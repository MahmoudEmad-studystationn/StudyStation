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

// ── Toast ──────────────────────────────────────────────────────────────────
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

// ── Confirm Modal ───────────────────────────────────────────────────────────
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

// ── Online Members Panel ────────────────────────────────────────────────────
function OnlineMembersPanel({ members, border, surface3, textPrimary, muted }) {
    return (
        <div style={{ borderTop: `1px solid ${border}`, flexShrink: 0 }}>
            {/* Header */}
            <div style={{
                padding: ".65rem 1rem",
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                <span style={{ fontSize: ".68rem", fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: muted, display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Members
                </span>
                {/* عدد المتصلين */}
                <span style={{
                    fontSize: ".6rem", fontWeight: 700,
                    padding: "2px 7px", borderRadius: 999,
                    background: "rgba(52,211,153,.12)",
                    color: "#34d399",
                    border: "1px solid rgba(52,211,153,.2)",
                }}>
                    {members.length} online
                </span>
            </div>

            {/* List */}
            <div style={{ padding: "0 .75rem .75rem", display: "flex", flexDirection: "column", gap: ".35rem", maxHeight: 200, overflowY: "auto", scrollbarWidth: "thin" }}>
                {members.map((m, i) => {
                    const name = m.userName ?? m.name ?? "Member";
                    return (
                        <div key={i} style={{
                            display: "flex", alignItems: "center", gap: ".6rem",
                            padding: ".45rem .6rem", borderRadius: 10,
                            background: surface3,
                            border: `1px solid ${border}`,
                        }}>
                            {/* Avatar + online dot */}
                            <div style={{ position: "relative", flexShrink: 0 }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: "50%",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: ".55rem", fontWeight: 800, color: "#fff",
                                    ...getAvStyle(i),
                                }}>
                                    {getInitials(name)}
                                </div>
                                {/* Green online dot */}
                                <span style={{
                                    position: "absolute", bottom: 0, right: 0,
                                    width: 8, height: 8, borderRadius: "50%",
                                    background: "#34d399",
                                    border: "1.5px solid var(--dot-border, #fff)",
                                    animation: "pulse 2s infinite",
                                }} />
                            </div>
                            {/* Name */}
                            <span style={{ fontSize: ".76rem", fontWeight: 600, color: textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {name}
                            </span>
                            {/* Online badge */}
                            <span style={{ marginLeft: "auto", fontSize: ".6rem", fontWeight: 700, color: "#34d399", flexShrink: 0 }}>
                                ● online
                            </span>
                        </div>
                    );
                })}

                {members.length === 0 && (
                    <div style={{ textAlign: "center", fontSize: ".73rem", color: muted, padding: ".5rem 0" }}>
                        No members yet
                    </div>
                )}
            </div>
        </div>
    );
}

export default function StudyRoom() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { isDarkMode } = useThemeContext();

    // ── Core state ─────────────────────────────────────────────────────────
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

    // ── Design tokens ──────────────────────────────────────────────────────
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

    // ── fetchRoom ──────────────────────────────────────────────────────────
    const fetchRoom = useCallback(async (silent = false) => {
        if (!roomId) return;
        if (!silent) setLoading(true);
        try {
            const [data, msgs] = await Promise.all([
                getRoomById(roomId),
                getMessages(roomId),
            ]);

            setRoom(prev => {
                if (!prev) {
                    const savedTasks = localStorage.getItem(`tasks_${roomId}`);
                    const localTasks = savedTasks ? JSON.parse(savedTasks) : (data.tasks ?? []);
                    tasksRef.current = localTasks;
                    return { ...data, tasks: localTasks };
                }
                return { ...data, tasks: tasksRef.current };
            });

            const incoming = Array.isArray(msgs) ? msgs : (msgs?.messages ?? []);

            setMessages(prev => {
                const optimistic = prev.filter(m => m.isOptimistic);
                const stillPending = optimistic.filter(
                    opt => !incoming.some(s => s.content === opt.content)
                );
                return [...incoming, ...stillPending]
                    .sort((a, b) => new Date(a.sentAt || 0) - new Date(b.sentAt || 0));
            });

        } catch (err) {
            console.error("Fetch Error:", err);
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

    useEffect(() => {
        if (room?.tasks) {
            localStorage.setItem(`tasks_${roomId}`, JSON.stringify(room.tasks));
        }
    }, [room?.tasks, roomId]);

    // ── Send message ────────────────────────────────────────────────────────
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

            setMessages(prev => {
                const filtered = prev.filter(m => m.id !== optId);
                const existingIds = new Set(filtered.map(m => m.id));
                const newOnes = incoming.filter(m => !existingIds.has(m.id));
                return [...filtered, ...newOnes].sort(
                    (a, b) => new Date(a.sentAt || 0) - new Date(b.sentAt || 0)
                );
            });
        } catch {
            setMessages(prev => prev.filter(m => m.id !== optId));
            showToast("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    const handleKey = e => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); }
    };

    // ── Handlers ──────────────────────────────────────────────────────────
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
            const updated = (prev.tasks ?? []).map(t =>
                t.id === taskId ? { ...t, isDone: !t.isDone } : t
            );
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
            const updated = (prev.tasks ?? []).map(t =>
                t.id === taskId ? { ...t, title: newTitle } : t
            );
            tasksRef.current = updated;
            return { ...prev, tasks: updated };
        });
        try { await updateTask(roomId, taskId, newTitle); } catch { showToast("Update failed"); }
    };

    // ── Loading / Error ────────────────────────────────────────────────────
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

    const members = room.members ?? [];

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

                <div style={{ display: "flex", alignItems: "center", gap: ".45rem" }}>
                    {members.slice(0, 4).map((m, i) => (
                        <div key={i} title={m.userName ?? m.name} style={{ width: 30, height: 30, borderRadius: "50%", border: "2px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".55rem", fontWeight: 800, color: "#fff", ...getAvStyle(i), flexShrink: 0 }}>
                            {getInitials(m.userName ?? m.name ?? "")}
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleLeave}
                    disabled={leaving}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 15px", borderRadius: 10, border: "none", background: "rgba(248,113,113,.18)", color: "#fca5a5", fontFamily: "inherit", fontSize: ".78rem", fontWeight: 700, cursor: leaving ? "not-allowed" : "pointer", transition: "background .2s", opacity: leaving ? .6 : 1 }}
                >
                    {leaving ? "Leaving…" : (
                        <>
                            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Leave Room
                        </>
                    )}
                </button>
            </div>

            {/* ── 3-COLUMN LAYOUT ── */}
            <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 320px", flex: 1, overflow: "hidden", minHeight: 0 }}>

                {/* ── LEFT — Timer + ToDo + Members ── */}
                <div style={{ borderRight: `1px solid ${border}`, background: surface, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <TimerStudyRoom roomId={roomId} onStart={handleStartFocus} onStop={handleStopFocus} isActive={!!sessionId} />
                    <ToDoStudyRoom tasks={room.tasks ?? []} onAdd={handleAddTask} onToggle={handleToggleTask} onUpdate={handleUpdateTask} onDelete={handleDeleteTask} />

                    {/* ── Online Members Panel ── */}
                    <OnlineMembersPanel
                        members={members}
                        border={border}
                        surface3={surface3}
                        textPrimary={textPrimary}
                        muted={muted}
                    />
                </div>

                {/* ── CENTER — Shared Workspace ── */}
                <div style={{ background: pageBg, display: "flex", flexDirection: "column", overflow: "hidden", borderRight: `1px solid ${border}` }}>
                    <div style={{ padding: ".85rem 1.25rem", borderBottom: `1px solid ${border}`, background: surface, fontSize: ".72rem", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: muted, flexShrink: 0 }}>
                        Shared Workspace
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: ".75rem", opacity: 0.3 }}>
                        <svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? "#8FB7CC" : "#2C3E50"} strokeWidth={1} strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
                        </svg>
                        <span style={{ fontSize: ".82rem", fontWeight: 600, color: muted }}>Shared whiteboard coming soon</span>
                    </div>
                </div>

                {/* ── RIGHT — Chat ── */}
                <div style={{ background: surface, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    {/* Chat Header */}
                    <div style={{ padding: ".85rem 1.25rem", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                        <span style={{ fontSize: ".72rem", fontWeight: 800, letterSpacing: ".04em", textTransform: "uppercase", color: muted, display: "flex", alignItems: "center", gap: 6 }}>
                            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            Room Chat
                        </span>
                        <span style={{ fontSize: ".65rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(52,211,153,.1)", color: "#34d399", border: "1px solid rgba(52,211,153,.2)" }}>
                            ● {members.length} online
                        </span>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: "auto", padding: ".75rem 1.25rem", display: "flex", flexDirection: "column", gap: ".65rem", scrollbarWidth: "thin" }}>
                        <div style={{ textAlign: "center", fontSize: ".67rem", fontWeight: 600, color: muted, padding: "4px 0" }}>
                            Welcome to {room.name} · {room.subject}
                        </div>

                        {messages.length === 0 && !loading && (
                            <div style={{ textAlign: "center", fontSize: ".75rem", color: muted, marginTop: "2rem", opacity: 0.6 }}>
                                No messages yet. Say hi! 👋
                            </div>
                        )}

                        {messages.map((msg, i) => {
                            const senderName = msg.senderName ?? msg.userName ?? "Member";
                            const memberIndex = members.findIndex(m => (m.userName ?? m.name) === senderName);
                            const avStyle = getAvStyle(memberIndex >= 0 ? memberIndex : i);
                            return (
                                <div key={msg.id ?? i} style={{ display: "flex", gap: 8, opacity: msg.isOptimistic ? 0.65 : 1, transition: "opacity 0.3s" }}>
                                    <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".55rem", fontWeight: 800, color: "#fff", marginTop: 1, ...avStyle }}>
                                        {getInitials(senderName)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
                                            <span style={{ fontSize: ".72rem", fontWeight: 700, color: textPrimary }}>{senderName}</span>
                                            <span style={{ fontSize: ".62rem", color: muted }}>{fmtTime(msg.sentAt)}</span>
                                            {msg.isOptimistic && <span style={{ fontSize: ".58rem", color: muted }}>sending…</span>}
                                        </div>
                                        <div style={{ fontSize: ".8rem", color: msgColor, lineHeight: 1.55, wordBreak: "break-word", background: surface2, padding: "7px 10px", borderRadius: "4px 12px 12px 12px", display: "inline-block", maxWidth: "100%" }}>
                                            {msg.content ?? msg.text}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div style={{ padding: ".75rem 1.25rem", borderTop: `1px solid ${border}`, flexShrink: 0 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                            <textarea
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKey}
                                placeholder="Message the room…"
                                rows={1}
                                disabled={sending}
                                style={{ flex: 1, padding: "9px 12px", background: surface3, border: `1px solid ${border}`, borderRadius: 12, fontFamily: "inherit", fontSize: ".82rem", color: textPrimary, outline: "none", resize: "none", lineHeight: 1.4, maxHeight: 80, transition: "border 0.2s", opacity: sending ? 0.7 : 1 }}
                                onFocus={e => e.currentTarget.style.borderColor = "#8FB7CC"}
                                onBlur={e => e.currentTarget.style.borderColor = border}
                            />
                            <button
                                onClick={sendMsg}
                                disabled={sending || !input.trim()}
                                style={{ width: 38, height: 38, borderRadius: 11, border: "none", background: sendBtnBg, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: (sending || !input.trim()) ? "not-allowed" : "pointer", flexShrink: 0, transition: "background 0.2s", opacity: (sending || !input.trim()) ? 0.5 : 1 }}
                            >
                                {sending
                                    ? <span style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.6s linear infinite" }} />
                                    : <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={leaveConfirm}
                title="Leave Room"
                body={`Are you sure you want to leave "${room.name}"?`}
                confirmLabel="Leave"
                danger
                isDarkMode={isDarkMode}
                onConfirm={confirmLeave}
                onCancel={() => setLeaveConfirm(false)}
            />
            <Toast message={toast.msg} visible={toast.visible} />
        </div>
    );
}