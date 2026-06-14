import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCircleCheck, faTimes, faRobot, faMessage, faCopy,
    faCommentDots, faTrash, faPaperclip,
} from "@fortawesome/free-solid-svg-icons";
import { C, AVATAR_GRADIENTS, FONT } from "./constants";

export function Toast({ message, visible, type = "success" }) {
    return (
        <div style={{
            position: "fixed", bottom: "2rem", left: "50%",
            transform: `translateX(-50%) translateY(${visible ? 0 : "80px"})`,
            background: type === "error" ? "#e53e3e" : C.navy,
            color: "#fff", padding: "12px 22px", borderRadius: "12px",
            fontSize: FONT.sm, fontWeight: 600,
            boxShadow: "0 8px 30px rgba(0,0,0,.2)",
            display: "flex", alignItems: "center", gap: "8px",
            opacity: visible ? 1 : 0,
            transition: "all .35s cubic-bezier(.34,1.56,.64,1)",
            pointerEvents: "none", zIndex: 9999, whiteSpace: "nowrap",
        }}>
            <FontAwesomeIcon icon={type === "success" ? faCircleCheck : faTimes} />
            {message}
        </div>
    );
}

export function TypingDots({ isDark, message }) {
    return (
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: AVATAR_GRADIENTS[0],
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", flexShrink: 0,
            }}>
                <FontAwesomeIcon icon={faRobot} style={{ fontSize: 14 }} />
            </div>
            <div>
                <div style={{
                    background: isDark ? "#2A2A2A" : "#fff",
                    border: `1px solid ${isDark ? "rgba(143,183,204,0.12)" : "rgba(44,62,80,0.10)"}`,
                    borderRadius: "18px 18px 18px 4px",
                    padding: "14px 18px", display: "flex", gap: 6, alignItems: "center",
                }}>
                    {[0, 0.2, 0.4].map((delay, i) => (
                        <span key={i} style={{
                            width: 7, height: 7, borderRadius: "50%",
                            background: C.ocean, display: "block",
                            animation: `aiBounce 1.2s ease-in-out ${delay}s infinite`,
                        }} />
                    ))}
                </div>
                {message && (
                    <div style={{ fontSize: FONT.xs, color: isDark ? "#888" : "#999", marginTop: 5, paddingLeft: 4 }}>
                        {message}
                    </div>
                )}
            </div>
            <style>{`@keyframes aiBounce{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}`}</style>
        </div>
    );
}

export function MessageBubble({ msg, isDark, onCopy, muted }) {
    const isUser = msg.role === "user";
    const isError = msg.isError;
    const bubbleBg = isUser
        ? (isDark ? C.ocean : C.navy)
        : isError
            ? (isDark ? "rgba(248,113,113,0.12)" : "rgba(248,113,113,0.08)")
            : (isDark ? "#2A2A2A" : "#fff");

    return (
        <div style={{
            display: "flex", gap: 12,
            flexDirection: isUser ? "row-reverse" : "row",
            alignItems: "flex-end",
        }}>
            <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: isUser ? AVATAR_GRADIENTS[1] : AVATAR_GRADIENTS[0],
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", flexShrink: 0,
            }}>
                <FontAwesomeIcon icon={isUser ? faMessage : faRobot} style={{ fontSize: 14 }} />
            </div>
            <div style={{ maxWidth: "clamp(260px, 65vw, 560px)" }}>
                <div style={{
                    padding: "13px 16px",
                    borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: bubbleBg,
                    border: isUser ? "none" : `1px solid ${isError ? "#f87171" : (isDark ? "rgba(143,183,204,0.12)" : "rgba(44,62,80,0.10)")}`,
                    color: isUser ? "#fff" : isError ? (isDark ? "#fca5a5" : "#dc2626") : (isDark ? "#E0E0E0" : "#1C2B38"),
                    fontSize: FONT.base, lineHeight: 1.7,
                    whiteSpace: "pre-wrap", wordBreak: "break-word",
                }}>
                    {msg.text}
                    {msg.file && (
                        <div style={{
                            marginTop: 10, padding: "8px 12px", borderRadius: 8,
                            background: "rgba(255,255,255,0.12)",
                            fontSize: FONT.sm, display: "flex", alignItems: "center", gap: 7,
                        }}>
                            <FontAwesomeIcon icon={faPaperclip} /> {msg.file}
                        </div>
                    )}
                </div>
                <div style={{
                    fontSize: FONT.xs, color: muted, marginTop: 5,
                    display: "flex", alignItems: "center", gap: 8,
                    justifyContent: isUser ? "flex-end" : "flex-start",
                }}>
                    <span>{msg.time}</span>
                    {!isUser && (
                        <button onClick={() => onCopy(msg.text)} style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: muted, fontSize: FONT.xs, padding: "2px 6px",
                            borderRadius: 5, display: "flex", alignItems: "center", gap: 4,
                        }}>
                            <FontAwesomeIcon icon={faCopy} style={{ fontSize: 11 }} /> Copy
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export function SidebarConvItem({ conv, active, isDark, onSelect, onDelete, textPrimary, muted }) {
    const bg = active ? "rgba(78,135,168,0.12)" : "transparent";
    return (
        <div
            onClick={() => onSelect(conv.id)}
            style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 10px", borderRadius: 10,
                background: bg, cursor: "pointer", transition: "background 0.12s",
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(44,62,80,0.05)"; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
        >
            <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: AVATAR_GRADIENTS[0],
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff",
            }}>
                <FontAwesomeIcon icon={faCommentDots} style={{ fontSize: 13 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: FONT.sm, fontWeight: 600,
                    color: active ? C.ocean : textPrimary,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                    {conv.title || conv.name || `Conversation #${conv.id}`}
                </div>
                <div style={{ fontSize: FONT.xs, color: muted, marginTop: 2 }}>
                    {conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                </div>
            </div>
            <button
                onClick={e => { e.stopPropagation(); onDelete(conv.id); }}
                style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: muted, fontSize: 13, padding: "3px 5px", borderRadius: 5, flexShrink: 0,
                    opacity: 0, transition: "opacity 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = "#e53e3e"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = 0; e.currentTarget.style.color = muted; }}
                title="Delete"
            >
                <FontAwesomeIcon icon={faTrash} />
            </button>
        </div>
    );
}
