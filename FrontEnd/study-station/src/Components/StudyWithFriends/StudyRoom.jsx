import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useThemeContext } from "../Theme/ThemeContext";
import TimerStudyRoom from "./TimerStudyRoom";
import ToDoStudyRoom from "./ToDoStudyRoom";
import {
    getRoomById,
    leaveRoom,
    sendMessage as apiSendMessage,
    getMessages,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    startFocusSession,
    stopFocusSession,
} from "../Services/studyWithFriendsService";

const AV_PALETTE = [
    { background: "linear-gradient(135deg,#2C3E50,#3D718D)" },
    { background: "linear-gradient(135deg,#3D718D,#658FA5)" },
    { background: "linear-gradient(135deg,#658FA5,#8FB7CC)" },
    { background: "linear-gradient(135deg,#8FB7CC,#c2d9e8)" },
    { background: "linear-gradient(135deg,#2C3E50,#658FA5)" },
];
const getAvStyle = i => AV_PALETTE[i % AV_PALETTE.length];
const getInitials = (name = "") => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
const fmtTime = iso => iso
    ? new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

function Toast({ message, visible }) {
    return (
        <div style={{
            position: "fixed", bottom: "2rem", left: "50%",
            transform: `translateX(-50%) translateY(${visible ? 0 : "80px"})`,
            background: "#2C3E50", color: "#fff", padding: "11px 22px", borderRadius: "14px",
            fontSize: ".85rem", fontWeight: 600, boxShadow: "0 8px 30px rgba(0,0,0,.2)",
            display: "flex", alignItems: "center", gap: "9px",
            opacity: visible ? 1 : 0, transition: "all .35s cubic-bezier(.34,1.56,.64,1)",
            pointerEvents: "none", zIndex: 9999, whiteSpace: "nowrap",
        }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{message}</span>
        </div>
    );
}

function ConfirmModal({ isOpen, title, body, confirmLabel = "Confirm", danger = false, onConfirm, onCancel, isDarkMode }) {
    if (!isOpen) return null;
    const surface = isDarkMode ? "#1f1f1f" : "#fff";
    const border = isDarkMode ? "rgba(255,255,255,0.07)" : "rgba(44,62,80,0.08)";
    const text = isDarkMode ? "#EDF2F7" : "#1C2B38";
    const text2 = isDarkMode ? "#A0AEC0" : "#4A5568";
    return (
        <div
            style={{ position: "fixed", inset: 0, zIndex: 900, background: "rgba(28,43,56,.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}
            onClick={e => e.target === e.currentTarget && onCancel()}
        >
            <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 20, padding: "1.75rem 2rem", width: "100%", maxWidth: 400, boxShadow: "0 8px 40px rgba(0,0,0,.18)" }}>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: text, marginBottom: ".5rem" }}>{title}</div>
                <div style={{ fontSize: ".85rem", color: text2, lineHeight: 1.6, marginBottom: "1.5rem" }}>{body}</div>
                <div style={{ display: "flex", gap: ".75rem", justifyContent: "flex-end" }}>
                    <button onClick={onCancel} style={{ padding: "9px 18px", borderRadius: 12, border: `1px solid ${border}`, background: "transparent", color: text2, fontFamily: "inherit", fontWeight: 600, fontSize: ".85rem", cursor: "pointer" }}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} style={{ padding: "9px 18px", borderRadius: 12, border: "none", background: danger ? "#e53e3e" : "#2C3E50", color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: ".85rem", cursor: "pointer" }}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function StudyRoom() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { isDarkMode } = useThemeContext();

    const [room, setRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [leaving, setLeaving] = useState(false);
    const [sending, setSending] = useState(false);
    const [toast, setToast] = useState({ visible: false, msg: "" });
    const [leaveConfirm, setLeaveConfirm] = useState(false);

    const tasksRef = useRef([]);
    const bottomRef = useRef(null);
    const pollRef = useRef(null);

    const pageBg = isDarkMode ? "#171717" : "#F3F4F6";
    const surface = isDarkMode ? "#1e1e1e" : "#fff";
    const surface2 = isDarkMode ? "#252525" : "#EAECF0";
    const surface3 = isDarkMode ? "#2b2b2b" : "#f5f6f8";
    const border = isDarkMode ? "rgba(255,255,255,0.07)" : "rgba(44,62,80,0.08)";
    const textPrimary = isDarkMode ? "#EDF2F7" : "#1C2B38";
    const muted = isDarkMode ? "#5A7080" : "#8A9BAA";
    const msgColor = isDarkMode ? "#A0AEC0" : "#4A5568";
    const sendBtnBg = isDarkMode ? "#3D718D" : "#2C3E50";

    function showToast(msg) {
        setToast({ visible: true, msg });
        setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
    }

    const fetchRoom = useCallback(async (silent = false) => {
        if (!roomId) return;
        if (!silent) setLoading(true);
        try {
            const [data, msgs] = await Promise.all([
                getRoomById(roomId),
                getMessages(roomId),
            ]);

            setRoom(prev => {
                const savedTasks = localStorage.getItem(`tasks_${roomId}`);
                const localTasks = savedTasks ? JSON.parse(savedTasks) : (data.tasks ?? []);
                tasksRef.current = localTasks;
                return { ...data, tasks: localTasks };
            });

            const incoming = Array.isArray(msgs) ? msgs : (msgs?.messages ?? []);
            setMessages(prev => {
                const optimistic = prev.filter(m => m.isOptimistic);
                const stillPending = optimistic.filter(opt => !incoming.some(s => s.content === opt.content));
                return [...incoming, ...stillPending].sort((a, b) => new Date(a.sentAt || 0) - new Date(b.sentAt || 0));
            });
        } catch (err) {
            if (!silent) setError("Could not load room. Please try again.");
        } finally {
            if (!silent) setLoading(false);
        }
    }, [roomId]);

    useEffect(() => {
        fetchRoom();
        pollRef.current = setInterval(() => fetchRoom(true), 5000);
        return () => clearInterval(pollRef.current);
    }, [fetchRoom]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMsg = async () => {
        const text = input.trim();
        if (!text || sending) return;
        setSending(true);
        setInput("");
        const optId = `opt-${Date.now()}`;
        const optimisticMsg = {
            id: optId,
            content: text,
            senderName: room?.currentUserName ?? room?.currentUser?.userName ?? "You",
            sentAt: new Date().toISOString(),
            isOptimistic: true,
        };
        setMessages(prev => [...prev, optimisticMsg]);
        try {
            await apiSendMessage(roomId, text);
            const msgs = await getMessages(roomId);
            const incoming = Array.isArray(msgs) ? msgs : (msgs?.messages ?? []);
            setMessages(incoming.sort((a, b) => new Date(a.sentAt || 0) - new Date(b.sentAt || 0)));
        } catch {
            setMessages(prev => prev.filter(m => m.id !== optId));
            showToast("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    const handleKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } };

    const handleLeave = () => setLeaveConfirm(true);

    const confirmLeave = async () => {
        setLeaveConfirm(false);
        setLeaving(true);
        try {
            await leaveRoom(roomId);
            clearInterval(pollRef.current);
            navigate("/study-with-friends");
        } catch {
            setLeaving(false);
            showToast("Failed to leave room");
        }
    };

    const handleStartFocus = async (durationMinutes = 25) => {
        try {
            const session = await startFocusSession(roomId, durationMinutes);
            setSessionId(session?.id ?? session?.sessionId ?? null);
        } catch (err) { console.error("Start focus failed", err); }
    };

    const handleStopFocus = async () => {
        if (!sessionId) return;
        try {
            await stopFocusSession(roomId, sessionId);
            setSessionId(null);
        } catch (err) { console.error("Stop focus failed", err); }
    };

    const handleAddTask = async taskText => {
        if (!taskText?.trim()) return;
        try {
            const task = await addTask(roomId, taskText.trim());
            setRoom(prev => {
                const updated = [...(prev.tasks ?? []), task];
                tasksRef.current = updated;
                return { ...prev, tasks: updated };
            });
        } catch (err) { console.error("Add task failed", err); }
    };

    const handleToggleTask = async taskId => {
        setRoom(prev => {
            const updated = (prev.tasks ?? []).map(t => t.id === taskId ? { ...t, isDone: !t.isDone } : t);
            tasksRef.current = updated;
            return { ...prev, tasks: updated };
        });
        try { await toggleTask(roomId, taskId); } catch { fetchRoom(true); }
    };

    const handleDeleteTask = async taskId => {
        const backup = room.tasks ?? [];
        setRoom(prev => {
            const updated = (prev.tasks ?? []).filter(t => t.id !== taskId);
            tasksRef.current = updated;
            return { ...prev, tasks: updated };
        });
        try { await deleteTask(roomId, taskId); } catch {
            setRoom(prev => { tasksRef.current = backup; return { ...prev, tasks: backup }; });
        }
    };

    const handleUpdateTask = async (taskId, newTitle) => {
        setRoom(prev => {
            const updated = (prev.tasks ?? []).map(t => t.id === taskId ? { ...t, title: newTitle } : t);
            tasksRef.current = updated;
            return { ...prev, tasks: updated };
        });
        try { await updateTask(roomId, taskId, newTitle); } catch { showToast("Update failed"); }
    };

    if (loading && !room) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: pageBg, flexDirection: "column", gap: "1rem" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(61,113,141,.2)", borderTopColor: "#3D718D", animation: "spin .7s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <span style={{ color: muted, fontSize: ".85rem", fontWeight: 600 }}>Loading room…</span>
        </div>
    );

    if (error || !room) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: pageBg, flexDirection: "column", gap: ".75rem" }}>
            <span style={{ color: "#f87171", fontSize: ".9rem", fontWeight: 600 }}>{error || "Room not found."}</span>
            <button onClick={() => navigate("/study-with-friends")} style={{ padding: "9px 20px", borderRadius: 12, border: "none", background: "#2C3E50", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: ".85rem" }}>
                Back to Rooms
            </button>
        </div>
    );

    const members = room.members || room.participants || [];

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: pageBg }}>
            <style>{`
                @keyframes spin  { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(52,211,153,.5); } 50% { box-shadow: 0 0 0 5px rgba(52,211,153,0); } }
            `}</style>

            {/* ── TOP BAR ── */}
            <div style={{ background: "#2C3E50", height: 60, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 1.5rem", gap: "1rem", borderBottom: "1px solid rgba(0,0,0,.15)" }}>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: ".75rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <span style={{ fontSize: ".95rem", fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>{room.name}</span>
                        <span style={{ fontSize: ".68rem", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: "rgba(255,255,255,.45)" }}>{room.subject}</span>
                    </div>
                    {room.roomCode && (
                        <span style={{ padding: "2px 8px", borderRadius: 7, fontSize: ".68rem", fontWeight: 700, letterSpacing: ".04em", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", color: "rgba(255,255,255,.65)" }}>
                            {room.roomCode}
                        </span>
                    )}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 999, fontSize: ".7rem", fontWeight: 700, background: "rgba(52,211,153,.15)", color: "#34d399", border: "1px solid rgba(52,211,153,.2)" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", animation: "pulse 2s infinite" }} />
                        {members.length} Online
                    </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: ".5rem", flexWrap: "nowrap", overflow: "hidden" }}>
                    {members.slice(0, 4).map((m, i) => {
                        // تعديل مهم: فحص شامل لاستخراج الاسم الحقيقي بدل "Member"
                        const realName = m.userName || m.name || m.user?.userName || m.user?.name || m.fullName || "Member";
                        return (
                            <div key={i} title={realName} style={{
                                display: "flex", alignItems: "center", gap: "6px",
                                padding: "4px 10px 4px 4px", borderRadius: 999,
                                background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", flexShrink: 0,
                            }}>
                                <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".55rem", fontWeight: 800, color: "#fff", ...getAvStyle(i), flexShrink: 0 }}>
                                    {getInitials(realName)}
                                </div>
                                <span style={{ fontSize: ".72rem", fontWeight: 700, color: "rgba(255,255,255,.85)", whiteSpace: "nowrap" }}>{realName}</span>
                            </div>
                        );
                    })}
                    {members.length > 4 && <span style={{ fontSize: ".72rem", fontWeight: 700, color: "rgba(255,255,255,.5)", flexShrink: 0 }}>+{members.length - 4}</span>}
                </div>

                <button onClick={handleLeave} disabled={leaving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 15px", borderRadius: 10, border: "none", background: "rgba(248,113,113,.18)", color: "#fca5a5", fontFamily: "inherit", fontSize: ".78rem", fontWeight: 700, cursor: leaving ? "not-allowed" : "pointer" }}>
                    {leaving ? "Leaving…" : "Leave Room"}
                </button>
            </div>

            {/* ── 3-COLUMN LAYOUT ── */}
            <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 320px", flex: 1, overflow: "hidden", minHeight: 0 }}>
                {/* LEFT */}
                <div style={{ borderRight: `1px solid ${border}`, background: surface, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <TimerStudyRoom roomId={roomId} onStart={handleStartFocus} onStop={handleStopFocus} isActive={!!sessionId} />
                    <ToDoStudyRoom tasks={room.tasks ?? []} onAdd={handleAddTask} onToggle={handleToggleTask} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} />
                </div>

                {/* CENTER */}
                <div style={{ background: pageBg, display: "flex", flexDirection: "column", overflow: "hidden", borderRight: `1px solid ${border}` }}>
                    <div style={{ padding: ".85rem 1.25rem", borderBottom: `1px solid ${border}`, background: surface, fontSize: ".72rem", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: muted, flexShrink: 0 }}>Shared Workspace</div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: ".75rem", opacity: 0.3 }}>
                        <span style={{ fontSize: ".82rem", fontWeight: 600, color: muted }}>Shared whiteboard coming soon</span>
                    </div>
                </div>

                {/* RIGHT (CHAT) */}
                <div style={{ background: surface, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <div style={{ padding: ".85rem 1.25rem", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                        <span style={{ fontSize: ".72rem", fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", color: muted, display: "flex", alignItems: "center", gap: 6 }}>
                            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                            Room Chat
                        </span>
                        <span style={{ fontSize: ".65rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(52,211,153,.1)", color: "#34d399", border: "1px solid rgba(52,211,153,.2)" }}>
                            ● {members.length} online
                        </span>
                    </div>

                    <div style={{ flex: 1, overflowY: "auto", padding: ".75rem 1.25rem", display: "flex", flexDirection: "column", gap: ".65rem", scrollbarWidth: "thin" }}>
                        {messages.map((msg, i) => {
                            const sName = msg.senderName || msg.userName || msg.user?.userName || "Member";
                            return (
                                <div key={msg.id || i} style={{ display: "flex", gap: 8, opacity: msg.isOptimistic ? 0.65 : 1 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".55rem", fontWeight: 800, color: "#fff", ...getAvStyle(i) }}>{getInitials(sName)}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                                            <span style={{ fontSize: ".72rem", fontWeight: 700, color: textPrimary }}>{sName}</span>
                                            <span style={{ fontSize: ".62rem", color: muted }}>{fmtTime(msg.sentAt)}</span>
                                        </div>
                                        <div style={{ fontSize: ".8rem", color: msgColor, background: surface2, padding: "7px 10px", borderRadius: "4px 12px 12px 12px", display: "inline-block", maxWidth: "100%", marginTop: 2 }}>{msg.content}</div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>

                    <div style={{ padding: ".75rem 1.25rem", borderTop: `1px solid ${border}`, flexShrink: 0 }}>
                        <div style={{ display: "flex", gap: 8 }}>
                            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} placeholder="Message the room…" rows={1} style={{ flex: 1, padding: "9px 12px", background: surface3, border: `1px solid ${border}`, borderRadius: 12, fontSize: ".82rem", color: textPrimary, outline: "none", resize: "none" }} />
                            <button onClick={sendMsg} disabled={sending || !input.trim()} style={{ width: 38, height: 38, borderRadius: 11, border: "none", background: sendBtnBg, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {sending ? "..." : ">"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal isOpen={leaveConfirm} title="Leave Room" body={`Are you sure you want to leave "${room?.name}"?`} onConfirm={confirmLeave} onCancel={() => setLeaveConfirm(false)} isDarkMode={isDarkMode} />
            <Toast message={toast.msg} visible={toast.visible} />
        </div>
    );
}