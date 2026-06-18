import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useThemeContext } from "../Theme/ThemeContext";
import TimerStudyRoom from "./TimerStudyRoom";
import ToDoStudyRoom from "./ToDoStudyRoom";
import ChatRoom from "./ChatRoom";
import { useFocusSession } from "../Services/useFocusSession";
import {
    getRoomById,
    leaveRoom,
    getMessages,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    extractMembers,
    normalizeMessage,
    getMemberCount,
} from "../Services/studyWithFriendsService";
import MembersPanel from "./MembersPanel";

const AV_PALETTE = [
    { background: "linear-gradient(135deg,#2C3E50,#3D718D)" },
    { background: "linear-gradient(135deg,#3D718D,#658FA5)" },
    { background: "linear-gradient(135deg,#658FA5,#8FB7CC)" },
    { background: "linear-gradient(135deg,#8FB7CC,#c2d9e8)" },
    { background: "linear-gradient(135deg,#2C3E50,#658FA5)" },
];
const getAvStyle = i => AV_PALETTE[i % AV_PALETTE.length];
const getInitials = (name = "") =>
    name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

const getMemberName = (m) =>
    m?.userName || m?.name || m?.displayName || m?.fullName ||
    m?.user?.userName || m?.user?.name || m?.user?.displayName ||
    m?.profile?.name || m?.profile?.userName || "Unknown";

// ── normalize task من الـ API (isCompleted → isDone) ───────────────────────
function normalizeTask(t) {
    return {
        ...t,
        isDone: t.isDone ?? t.isCompleted ?? false,
        title: t.title ?? t.text ?? t.content ?? "",
    };
}

// ── localStorage helpers ────────────────────────────────────────────────────
function loadTasksFromStorage(roomId) {
    try {
        const raw = localStorage.getItem(`tasks_room_${roomId}`);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function saveTasksToStorage(roomId, tasks) {
    try {
        // مخزنش الـ temp tasks
        const toSave = tasks.filter(t => !String(t.id).startsWith("temp-"));
        localStorage.setItem(`tasks_room_${roomId}`, JSON.stringify(toSave));
    } catch { /* ignore */ }
}

function extractNamesFromMessages(incoming) {
    const seen = new Set();
    const names = [];
    for (const msg of incoming) {
        const name = msg.senderName;
        if (name && name !== "Unknown" && !seen.has(name)) {
            seen.add(name);
            names.push(name);
        }
    }
    return names;
}

function buildMembers(existingMembers, namesFromMessages, count) {
    const realApiMembers = existingMembers.filter(m => {
        const n = getMemberName(m);
        return n && n !== "Unknown" && !n.startsWith("Member ");
    });

    if (realApiMembers.length > 0) {
        if (realApiMembers.length < count && namesFromMessages.length > 0) {
            const existingNames = new Set(realApiMembers.map(m => getMemberName(m)));
            const extra = namesFromMessages
                .filter(n => !existingNames.has(n))
                .map((n, i) => ({ id: `msg-member-${i}`, userId: null, userName: n, name: n, isOnline: true }));
            return [...realApiMembers, ...extra].slice(0, Math.max(count, realApiMembers.length));
        }
        return realApiMembers;
    }

    if (namesFromMessages.length > 0) {
        return Array.from({ length: Math.max(count, namesFromMessages.length) }, (_, i) => ({
            id: `msg-member-${i}`, userId: null,
            userName: namesFromMessages[i] ?? `Member ${i + 1}`,
            name: namesFromMessages[i] ?? `Member ${i + 1}`,
            isOnline: true,
        }));
    }

    return Array.from({ length: count }, (_, i) => ({
        id: `placeholder-${i}`, userId: null,
        userName: `Member ${i + 1}`, name: `Member ${i + 1}`, isOnline: true,
    }));
}

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [leaving, setLeaving] = useState(false);
    const [toast, setToast] = useState({ visible: false, msg: "" });
    const [leaveConfirm, setLeaveConfirm] = useState(false);

    // ── Tasks: مستقلة، بتتحمل من localStorage أول ما نعرف الـ roomId ────────
    const [tasks, setTasks] = useState(() => []);
    const pendingToggles = useRef(new Set());
    const pollRef = useRef(null);

    // حمّل من localStorage أول ما يتعرف الـ roomId
    useEffect(() => {
        if (!roomId) return;
        const stored = loadTasksFromStorage(roomId);
        if (stored.length > 0) setTasks(stored.map(normalizeTask));
    }, [roomId]);

    // احفظ في localStorage كل ما تتغير الـ tasks
    useEffect(() => {
        if (!roomId) return;
        saveTasksToStorage(roomId, tasks);
    }, [tasks, roomId]);

    const { sharedTimer, handleStart, handleStop } = useFocusSession(roomId);

    const pageBg = isDarkMode ? "#171717" : "#F3F4F6";
    const surface = isDarkMode ? "#1e1e1e" : "#fff";
    const border = isDarkMode ? "rgba(255,255,255,0.07)" : "rgba(44,62,80,0.08)";
    const muted = isDarkMode ? "#5A7080" : "#8A9BAA";

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
                getMessages(roomId).catch(() => []),
            ]);

            const incoming = (Array.isArray(msgs) ? msgs : (msgs?.messages ?? [])).map(normalizeMessage);
            const namesFromMessages = extractNamesFromMessages(incoming);
            const count = data?.participantsCount ?? data?.memberCount ?? 0;
            const existingMembers = extractMembers(data);
            const members = buildMembers(existingMembers, namesFromMessages, count);

            setRoom(prev => ({
                ...data,
                members,
                currentUserName: data?.currentUserName ?? prev?.currentUserName ?? null,
                currentUser: data?.currentUser ?? prev?.currentUser ?? null,
            }));

        } catch (err) {
            console.error("fetchRoom error:", err);
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

    const handleAddTask = async (taskText) => {
        if (!taskText?.trim()) return;
        const tempId = `temp-${Date.now()}`;
        const optimistic = { id: tempId, title: taskText.trim(), isDone: false };
        setTasks(prev => [...prev, optimistic]);
        try {
            const result = await addTask(roomId, taskText.trim());
            // الـ API بيرجع { id, title, isCompleted, ... }
            const normalized = normalizeTask(result);
            setTasks(prev => prev.map(t => t.id === tempId ? normalized : t));
        } catch {
            setTasks(prev => prev.filter(t => t.id !== tempId));
            showToast("Failed to add task");
        }
    };

    const handleToggleTask = async (taskId) => {
        pendingToggles.current.add(taskId);
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isDone: !t.isDone } : t));
        try { await toggleTask(roomId, taskId); }
        catch { setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isDone: !t.isDone } : t)); }
        finally { pendingToggles.current.delete(taskId); }
    };

    const handleDeleteTask = async (taskId) => {
        const backup = tasks;
        setTasks(prev => prev.filter(t => t.id !== taskId));
        try { await deleteTask(roomId, taskId); }
        catch { setTasks(backup); showToast("Failed to delete task"); }
    };

    const handleUpdateTask = async (taskId, newTitle) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, title: newTitle } : t));
        try { await updateTask(roomId, taskId, newTitle); }
        catch { showToast("Update failed"); }
    };

    // ── Loading / Error ───────────────────────────────────────────────────────
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

    const members = room.members ?? extractMembers(room);
    const onlineCount = getMemberCount(room, members);
    const currentUserName = room?.currentUserName ?? room?.currentUser?.userName ?? null;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: pageBg }}>
            <style>{`
                @keyframes spin  { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(52,211,153,.5); } 50% { box-shadow: 0 0 0 5px rgba(52,211,153,0); } }
            `}</style>

            {/* ── TOP BAR ── */}
            <div style={{
                background: "#2C3E50", height: 60, flexShrink: 0,
                display: "flex", alignItems: "center", padding: "0 1.5rem",
                gap: "1rem", borderBottom: "1px solid rgba(0,0,0,.15)",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".75rem", flexShrink: 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <span style={{ fontSize: ".95rem", fontWeight: 800, letterSpacing: "-.02em", color: "#fff" }}>{room.name}</span>
                        <span style={{ fontSize: ".68rem", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: "rgba(255,255,255,.45)" }}>{room.subject}</span>
                    </div>
                    {room.roomCode && (
                        <span style={{ padding: "2px 8px", borderRadius: 7, fontSize: ".68rem", fontWeight: 700, letterSpacing: ".04em", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", color: "rgba(255,255,255,.65)" }}>
                            {room.roomCode}
                        </span>
                    )}
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 999, fontSize: ".7rem", fontWeight: 700, background: "rgba(52,211,153,.15)", color: "#34d399", border: "1px solid rgba(52,211,153,.2)", flexShrink: 0 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", animation: "pulse 2s infinite" }} />
                        {onlineCount} Online
                    </span>
                </div>

                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: ".5rem", overflow: "hidden", flexWrap: "nowrap" }}>
                    {members.length === 0 ? (
                        <span style={{ fontSize: ".72rem", color: "rgba(255,255,255,.35)", fontStyle: "italic" }}>No members yet</span>
                    ) : (
                        <>
                            {members.slice(0, 5).map((m, i) => {
                                const name = getMemberName(m);
                                return (
                                    <div key={m?.id ?? i} title={name} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px 4px 4px", borderRadius: 999, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", flexShrink: 0 }}>
                                        <div style={{ width: 26, height: 26, borderRadius: "50%", border: "2px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".52rem", fontWeight: 800, color: "#fff", flexShrink: 0, ...getAvStyle(i) }}>
                                            {getInitials(name)}
                                        </div>
                                        <span style={{ fontSize: ".72rem", fontWeight: 700, color: "rgba(255,255,255,.85)", whiteSpace: "nowrap", maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {name}
                                        </span>
                                    </div>
                                );
                            })}
                            {members.length > 5 && (
                                <span style={{ fontSize: ".72rem", fontWeight: 700, color: "rgba(255,255,255,.5)", flexShrink: 0, padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)" }}>
                                    +{members.length - 5} more
                                </span>
                            )}
                        </>
                    )}
                </div>

                <button
                    onClick={handleLeave} disabled={leaving}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 15px", borderRadius: 10, border: "none", background: "rgba(248,113,113,.18)", color: "#fca5a5", fontFamily: "inherit", fontSize: ".78rem", fontWeight: 700, cursor: leaving ? "not-allowed" : "pointer", transition: "background .2s", opacity: leaving ? .6 : 1, flexShrink: 0 }}
                >
                    {leaving ? "Leaving…" : (
                        <>
                            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Leave Room
                        </>
                    )}
                </button>
            </div>

            {/* ── 3-COLUMN LAYOUT ── */}
            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 420px", flex: 1, overflow: "hidden", minHeight: 0 }}>

                {/* ── LEFT ── */}
                <div style={{ borderRight: `1px solid ${border}`, background: surface, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
                    <TimerStudyRoom roomId={roomId} sharedTimer={sharedTimer} onStart={handleStart} onStop={handleStop} />
                    <MembersPanel members={members} onlineCount={onlineCount} />
                    <ToDoStudyRoom
                        tasks={tasks}
                        onAdd={handleAddTask}
                        onToggle={handleToggleTask}
                        onUpdate={handleUpdateTask}
                        onDelete={handleDeleteTask}
                    />
                </div>

                {/* ── CENTER ── */}
                <div style={{ background: pageBg, display: "flex", flexDirection: "column", overflow: "hidden", borderRight: `1px solid ${border}` }}>
                    <div style={{ padding: ".85rem 1.25rem", borderBottom: `1px solid ${border}`, background: surface, fontSize: ".72rem", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: muted, flexShrink: 0 }}>
                        Shared Workspace
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: ".75rem", opacity: 0.3 }}>
                        <svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? "#8FB7CC" : "#2C3E50"} strokeWidth={1} strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <line x1="3" y1="9" x2="21" y2="9" />
                            <line x1="9" y1="21" x2="9" y2="9" />
                        </svg>
                        <span style={{ fontSize: ".82rem", fontWeight: 600, color: muted }}>Shared whiteboard coming soon</span>
                    </div>
                </div>

                {/* ── RIGHT ── */}
                <ChatRoom
                    roomId={roomId}
                    isDarkMode={isDarkMode}
                    currentUserName={currentUserName}
                />
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