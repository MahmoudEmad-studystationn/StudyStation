import { useState, useRef, useEffect, useCallback } from "react";
import {
    sendMessage,
    getMessages,
    normalizeMessage,
} from "../Services/studyWithFriendsService";

const POLL_INTERVAL = 4000;

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ size = 16, color = "#8FB7CC" }) {
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%",
            border: `2px solid rgba(143,183,204,.22)`,
            borderTopColor: color,
            animation: "aiSpin .65s linear infinite",
            display: "inline-block", flexShrink: 0,
        }} />
    );
}

// ─── Room Chat ────────────────────────────────────────────────────────────────
const AV_PALETTE = [
    "linear-gradient(135deg,#2C3E50,#3D718D)",
    "linear-gradient(135deg,#3D718D,#658FA5)",
    "linear-gradient(135deg,#658FA5,#8FB7CC)",
    "linear-gradient(135deg,#2C3E50,#658FA5)",
    "linear-gradient(135deg,#8FB7CC,#c2d9e8)",
];
const getInitials = (name = "") =>
    name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

function RoomChat({ roomId, currentUserName, isDarkMode }) {
    const [msgs, setMsgs] = useState([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef(null);
    const pollRef = useRef(null);
    const lastCountRef = useRef(0);

    const surface  = isDarkMode ? "#252525" : "#F5F6F8";
    const border   = isDarkMode ? "rgba(255,255,255,.07)" : "rgba(44,62,80,.08)";
    const text     = isDarkMode ? "#EDF2F7" : "#1C2B38";
    const muted    = isDarkMode ? "#5A7080" : "#8A9BAA";
    const surface2 = isDarkMode ? "#2b2b2b" : "#EAECF0";
    const myBg     = isDarkMode ? "#3D718D" : "#2C3E50";
    const msgColor = isDarkMode ? "#A0AEC0" : "#4A5568";

    const fetchMessages = useCallback(async (silent = false) => {
        try {
            const raw = await getMessages(roomId);
            const normalized = (Array.isArray(raw) ? raw : []).map(normalizeMessage);
            if (normalized.length !== lastCountRef.current) {
                lastCountRef.current = normalized.length;
                setMsgs(normalized.sort((a, b) => new Date(a.sentAt || 0) - new Date(b.sentAt || 0)));
            }
        } catch { /* silent */ } finally {
            if (!silent) setLoading(false);
        }
    }, [roomId]);

    useEffect(() => {
        fetchMessages();
        pollRef.current = setInterval(() => fetchMessages(true), POLL_INTERVAL);
        return () => clearInterval(pollRef.current);
    }, [fetchMessages]);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

    const send = async () => {
        const txt = input.trim();
        if (!txt || sending) return;
        setInput("");
        setSending(true);
        try {
            await sendMessage(roomId, txt);
            await fetchMessages(true);
        } catch { /* silent */ } finally { setSending(false); }
    };

    const handleKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

    const isMe = msg => msg.senderName === currentUserName || msg.senderName === "You";

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", gap: 8 }}>
            <Spinner size={18} /><span style={{ fontSize: ".8rem", color: muted }}>Loading…</span>
        </div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
            {/* messages */}
            <div style={{
                flex: 1, overflowY: "auto", padding: ".75rem 1.25rem",
                display: "flex", flexDirection: "column", gap: ".65rem",
                scrollbarWidth: "thin",
            }}>
                {msgs.length === 0 && (
                    <div style={{ textAlign: "center", fontSize: ".75rem", color: muted, marginTop: "2rem", opacity: .6 }}>
                        No messages yet. Say hi!
                    </div>
                )}

                {msgs.map((m, i) => {
                    const mine   = isMe(m);
                    const name   = m.senderName || "Unknown";
                    const avatar = AV_PALETTE[i % AV_PALETTE.length];
                    return (
                        <div key={m.id ?? i} style={{ display: "flex", gap: 8, justifyContent: mine ? "flex-end" : "flex-start" }}>
                            {!mine && (
                                <div style={{
                                    width: 28, height: 28, borderRadius: "50%",
                                    flexShrink: 0, display: "flex", alignItems: "center",
                                    justifyContent: "center", fontSize: ".52rem",
                                    fontWeight: 800, color: "#fff", marginTop: 1,
                                    background: avatar,
                                }}>
                                    {getInitials(name)}
                                </div>
                            )}
                            <div style={{ flex: mine ? "unset" : 1, maxWidth: "82%", minWidth: 0 }}>
                                {!mine && (
                                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
                                        <span style={{ fontSize: ".72rem", fontWeight: 700, color: text }}>{name}</span>
                                        {m.sentAt && (
                                            <span style={{ fontSize: ".62rem", color: muted }}>
                                                {new Date(m.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        )}
                                    </div>
                                )}
                                <div style={{
                                    fontSize: ".8rem", color: mine ? "#fff" : msgColor,
                                    lineHeight: 1.55, wordBreak: "break-word",
                                    background: mine ? myBg : surface2,
                                    padding: "7px 10px",
                                    borderRadius: mine ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
                                    display: "inline-block", maxWidth: "100%",
                                }}>
                                    {m.content ?? m.text}
                                </div>
                                {mine && m.sentAt && (
                                    <div style={{ fontSize: ".6rem", color: muted, marginTop: 2, textAlign: "right" }}>
                                        {new Date(m.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* input */}
            <div style={{ padding: ".75rem 1.25rem", borderTop: `1px solid ${border}`, flexShrink: 0 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                    <textarea
                        value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKey} placeholder="Message the room…"
                        rows={1} disabled={sending}
                        style={{
                            flex: 1, padding: "9px 12px", background: surface,
                            border: `1px solid ${border}`, borderRadius: 12,
                            fontFamily: "inherit", fontSize: ".82rem", color: text,
                            outline: "none", resize: "none", lineHeight: 1.4, maxHeight: 80,
                        }}
                    />
                    <button
                        onClick={send} disabled={sending || !input.trim()}
                        style={{
                            width: 38, height: 38, borderRadius: 11, border: "none",
                            background: sending || !input.trim() ? (isDarkMode ? "#5A7080" : "#8A9BAA") : myBg,
                            color: "#fff", display: "flex", alignItems: "center",
                            justifyContent: "center", cursor: "pointer", flexShrink: 0,
                            transition: "background .2s",
                        }}
                    >
                        {sending
                            ? <Spinner size={13} color="#fff" />
                            : <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────
export default function AiRoomPanel({ roomId, isDarkMode, currentUserName }) {
    const surface = isDarkMode ? "#1e1e1e" : "#fff";
    const border  = isDarkMode ? "rgba(255,255,255,.07)" : "rgba(44,62,80,.08)";
    const muted   = isDarkMode ? "#5A7080" : "#8A9BAA";

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: surface }}>
            <style>{`@keyframes aiSpin { to { transform: rotate(360deg); } }`}</style>

            {/* header */}
            <div style={{
                padding: ".85rem 1.25rem",
                borderBottom: `1px solid ${border}`,
                fontSize: ".72rem", fontWeight: 700,
                letterSpacing: ".06em", textTransform: "uppercase",
                color: muted, flexShrink: 0,
            }}>
                Room Chat
            </div>

            {/* content */}
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <RoomChat roomId={roomId} isDarkMode={isDarkMode} currentUserName={currentUserName} />
            </div>
        </div>
    );
}