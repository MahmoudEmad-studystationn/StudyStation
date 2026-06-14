import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBars,
    faArrowLeft,
    faPenToSquare,
    faPaperPlane,
    faPaperclip,
    faSpinner,
    faTrash,
    faCopy,
    faRobot,
    faCommentDots,
    faFileLines,
    faCircleCheck,
    faClone,
    faLightbulb,
    faMessage,
    faCircle,
    faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useThemeContext } from "../Theme/ThemeContext";
import {
    sendChat,
    uploadFile,
    summarize,
    generateQuiz,
    generateFlashcards,
    explainConcept,
    getConversations,
    getConversationMessages,
    deleteConversation,
} from "../Services/AiServices";

// ─── Color tokens (matching Home palette) ────────────────────────
const C = {
    navy: "#2c3e50",
    navyHover: "#3a4958",
    ocean: "#4e87a8",
    teal: "#658FA5",
    sky: "#8FB7CC",
    skyLight: "#c8dde9",
};

const AVATAR_GRADIENTS = [
    `linear-gradient(135deg,${C.navy},${C.ocean})`,
    `linear-gradient(135deg,${C.ocean},${C.teal})`,
    `linear-gradient(135deg,${C.teal},${C.sky})`,
];

// ─── Context chip config ──────────────────────────────────────────
const CONTEXT_CHIPS = [
    { key: "general", label: "General", icon: faCommentDots },
    { key: "summarize", label: "Summarize", icon: faFileLines },
    { key: "quiz", label: "Quiz me", icon: faCircleCheck },
    { key: "flashcards", label: "Flashcards", icon: faClone },
    { key: "explain", label: "Explain", icon: faLightbulb },
];

const QUICK_ACTIONS = [
    { label: "Explain a concept", prompt: "Explain photosynthesis in simple terms", icon: faLightbulb, ctx: "explain" },
    { label: "Generate a quiz", prompt: "Create a quiz on the French Revolution", icon: faCircleCheck, ctx: "quiz" },
    { label: "Create flashcards", prompt: "Make flashcards for cell biology basics", icon: faClone, ctx: "flashcards" },
    { label: "Summarize notes", prompt: "Summarize the key ideas of photosynthesis", icon: faFileLines, ctx: "summarize" },
];

// ─── Helpers ──────────────────────────────────────────────────────
function nowTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function extractReply(data) {
    if (typeof data === "string") return data;
    return (
        data?.message ||
        data?.response ||
        data?.content ||
        data?.reply ||
        data?.summary ||
        data?.explanation ||
        JSON.stringify(data, null, 2)
    );
}

async function dispatchByContext(context, message, conversationId, uploadedFileId) {
    switch (context) {
        case "summarize":
            return summarize({ topic: message, uploadedFileId });
        case "quiz":
            return generateQuiz({ topic: message, count: 5, difficulty: "medium", questionType: "multiple-choice", uploadedFileId });
        case "flashcards":
            return generateFlashcards({ topic: message, count: 8, difficulty: "medium", uploadedFileId });
        case "explain":
            return explainConcept({ concept: message, level: "beginner" });
        default:
            return sendChat({ message, context: "general", conversationId, uploadedFileId });
    }
}

// ═════════════════════════════════════════════════════════════════
// Sub-components
// ═════════════════════════════════════════════════════════════════

function Toast({ message, visible, type = "success" }) {
    const bg = type === "error" ? "#e53e3e" : C.navy;
    return (
        <div style={{
            position: "fixed", bottom: "2rem", left: "50%",
            transform: `translateX(-50%) translateY(${visible ? 0 : "80px"})`,
            background: bg, color: "#fff",
            padding: "10px 20px", borderRadius: "12px",
            fontSize: ".83rem", fontWeight: 600,
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

function TypingDots({ isDark }) {
    return (
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: AVATAR_GRADIENTS[0],
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0,
            }}>
                <FontAwesomeIcon icon={faRobot} style={{ fontSize: 12 }} />
            </div>
            <div style={{
                background: isDark ? "#2A2A2A" : "#fff",
                border: `1px solid ${isDark ? "rgba(143,183,204,0.12)" : "rgba(44,62,80,0.10)"}`,
                borderRadius: "16px 16px 16px 4px",
                padding: "12px 16px",
                display: "flex", gap: 5, alignItems: "center",
            }}>
                {[0, 0.2, 0.4].map((delay, i) => (
                    <span key={i} style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: C.ocean, display: "block",
                        animation: `aiBounce 1.2s ease-in-out ${delay}s infinite`,
                    }} />
                ))}
            </div>
            <style>{`@keyframes aiBounce{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}`}</style>
        </div>
    );
}

function MessageBubble({ msg, isDark, onCopy }) {
    const isUser = msg.role === "user";
    const bubbleBg = isUser
        ? (isDark ? C.ocean : C.navy)
        : (isDark ? "#2A2A2A" : "#fff");
    const bubbleBorder = isUser ? "none"
        : `1px solid ${isDark ? "rgba(143,183,204,0.12)" : "rgba(44,62,80,0.10)"}`;

    return (
        <div style={{
            display: "flex", gap: 10,
            flexDirection: isUser ? "row-reverse" : "row",
            alignItems: "flex-end",
        }}>
            <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: isUser ? AVATAR_GRADIENTS[1] : AVATAR_GRADIENTS[0],
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0,
            }}>
                <FontAwesomeIcon icon={isUser ? faMessage : faRobot} style={{ fontSize: 11 }} />
            </div>
            <div>
                <div style={{
                    maxWidth: "clamp(240px, 60vw, 520px)",
                    padding: "11px 14px",
                    borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: bubbleBg,
                    border: bubbleBorder,
                    color: isUser ? "#fff" : (isDark ? "#E0E0E0" : "#1C2B38"),
                    fontSize: "13.5px", lineHeight: 1.65,
                    whiteSpace: "pre-wrap", wordBreak: "break-word",
                }}>
                    {msg.text}
                    {msg.file && (
                        <div style={{
                            marginTop: 8, padding: "6px 10px",
                            borderRadius: 8,
                            background: "rgba(255,255,255,0.12)",
                            fontSize: 12, display: "flex", alignItems: "center", gap: 6,
                        }}>
                            <FontAwesomeIcon icon={faPaperclip} /> {msg.file}
                        </div>
                    )}
                </div>
                <div style={{
                    fontSize: "10.5px",
                    color: isDark ? "#6B7A86" : "#8A9BAA",
                    marginTop: 4,
                    display: "flex", alignItems: "center", gap: 6,
                    justifyContent: isUser ? "flex-end" : "flex-start",
                }}>
                    <span>{msg.time}</span>
                    {!isUser && (
                        <button
                            onClick={() => onCopy(msg.text)}
                            style={{
                                background: "none", border: "none", cursor: "pointer",
                                color: isDark ? "#6B7A86" : "#8A9BAA",
                                fontSize: 11, padding: "1px 5px",
                                borderRadius: 5, display: "flex", alignItems: "center", gap: 3,
                            }}
                        >
                            <FontAwesomeIcon icon={faCopy} style={{ fontSize: 10 }} /> Copy
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function SidebarConvItem({ conv, active, isDark, onSelect, onDelete, textPrimary, muted }) {
    const bg = active ? "rgba(78,135,168,0.12)" : "transparent";
    const titleColor = active ? C.ocean : textPrimary;

    return (
        <div
            onClick={() => onSelect(conv.id)}
            style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "7px 8px", borderRadius: 9,
                background: bg, cursor: "pointer",
                transition: "background 0.12s",
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(44,62,80,0.05)"; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
        >
            <div style={{
                width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                background: AVATAR_GRADIENTS[0],
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, color: "#fff",
            }}>
                <FontAwesomeIcon icon={faCommentDots} style={{ fontSize: 11 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: "12.5px", fontWeight: 600, color: titleColor,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                    {conv.title || conv.name || `Conversation #${conv.id}`}
                </div>
                <div style={{ fontSize: "10.5px", color: muted, marginTop: 1 }}>
                    {conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                </div>
            </div>
            <button
                onClick={e => { e.stopPropagation(); onDelete(conv.id); }}
                style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: muted, fontSize: 12, padding: "2px 4px", borderRadius: 5, flexShrink: 0,
                    opacity: 0, transition: "opacity 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = "#e53e3e"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = 0; e.currentTarget.style.color = muted; }}
                title="Delete conversation"
            >
                <FontAwesomeIcon icon={faTrash} />
            </button>
        </div>
    );
}

export const openChatEvent = {
    dispatch: () => window.dispatchEvent(new CustomEvent("open-ai-chat")),
};

// ═════════════════════════════════════════════════════════════════
// Main Component
// ═════════════════════════════════════════════════════════════════

export default function AiChat() {
    const { isDarkMode } = useThemeContext();
    const navigate = useNavigate();
    const isDark = isDarkMode;

    // Theme tokens — matching Home.jsx exactly
    const bgColor = isDark ? "#171717" : "#F3F4F6";
    const cardBg = isDark ? "#2A2A2A" : "white";
    const sidebarBg = isDark ? "#1f1f1f" : "#ffffff";
    const textPrimary = isDark ? "#E0E0E0" : "#2f3b48";
    const textSecondary = isDark ? "#B0B0B0" : "#6b6f76";
    const textAccent = isDark ? "#8FB7CC" : "#4e87a8";
    const borderColor = isDark ? "#404040" : "#d1d5db";
    const iconBg = isDark ? "#363636" : "#eef1f4";
    const iconBorder = isDark ? "#505050" : "#d5d9de";
    const inputBg = isDark ? "#363636" : "#ffffff";
    const muted = isDark ? "#6B7A86" : "#8A9BAA";
    const border = isDark ? "#404040" : "#d1d5db";
    const border2 = isDark ? "#505050" : "#c4cdd6";

    const cardShadow = isDark
        ? "0 8px 16px rgba(0,0,0,0.3)"
        : "0 8px 16px rgba(0,0,0,0.07)";

    // State
    const [messages, setMessages] = useState([]);
    const [inputVal, setInputVal] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [context, setContext] = useState("general");
    const [conversationId, setConversationId] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [uploadedFileId, setUploadedFileId] = useState(null);
    const [uploadedFileName, setUploadedFileName] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState({ visible: false, msg: "", type: "success" });
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    useEffect(() => {
        loadConversations();
    }, []);

    async function loadConversations() {
        try {
            const data = await getConversations();
            const list = Array.isArray(data) ? data : data?.conversations ?? [];
            setConversations(list);
        } catch {
            // silent
        }
    }

    function showToast(msg, type = "success") {
        setToast({ visible: true, msg, type });
        setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
    }

    async function handleSend(overrideText) {
        const text = (overrideText ?? inputVal).trim();
        if (!text || isTyping) return;

        const userMsg = { role: "user", text, time: nowTime(), file: uploadedFileName };
        setMessages(prev => [...prev, userMsg]);
        setInputVal("");
        setUploadedFileId(null);
        setUploadedFileName(null);
        setIsTyping(true);

        try {
            const data = await dispatchByContext(context, text, conversationId, uploadedFileId);
            const reply = extractReply(data);
            if (data?.conversationId) setConversationId(data.conversationId);
            setMessages(prev => [...prev, { role: "ai", text: reply, time: nowTime() }]);
            loadConversations();
        } catch (err) {
            setMessages(prev => [...prev, {
                role: "ai",
                text: `Sorry, something went wrong.\n${err.message}`,
                time: nowTime(),
            }]);
        } finally {
            setIsTyping(false);
            inputRef.current?.focus();
        }
    }

    async function handleSelectConversation(id) {
        try {
            const data = await getConversationMessages(id);
            const msgs = Array.isArray(data) ? data : data?.messages ?? [];
            setConversationId(id);
            setMessages(msgs.map(m => ({
                role: m.role === "user" ? "user" : "ai",
                text: m.content || m.message || m.text || "",
                time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
            })));
        } catch {
            showToast("Failed to load conversation", "error");
        }
    }

    async function handleDeleteConversation(id) {
        try {
            await deleteConversation(id);
            setConversations(prev => prev.filter(c => c.id !== id));
            if (conversationId === id) startNewChat();
            showToast("Conversation deleted");
        } catch {
            showToast("Failed to delete", "error");
        }
    }

    async function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const data = await uploadFile(file);
            const id = data?.fileId ?? data?.id ?? data?.uploadedFileId;
            setUploadedFileId(id);
            setUploadedFileName(file.name);
            showToast(`"${file.name}" uploaded`);
        } catch {
            showToast("Upload failed", "error");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    }

    function startNewChat() {
        setMessages([]);
        setConversationId(null);
        setInputVal("");
        setUploadedFileId(null);
        setUploadedFileName(null);
        inputRef.current?.focus();
    }

    function handleCopy(text) {
        navigator.clipboard.writeText(text).then(() => showToast("Copied!"));
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    function handleInputChange(e) {
        setInputVal(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
    }

    const showWelcome = messages.length === 0;

    const iconStyle = {
        backgroundColor: iconBg,
        borderColor: iconBorder,
        color: textPrimary,
        border: `1px solid ${iconBorder}`,
    };

    return (
        <div style={{
            display: "flex", flexDirection: "column", height: "100vh",
            background: bgColor, color: textPrimary,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            transition: "background 0.3s, color 0.3s",
        }}>

            {/* ── HEADER ── */}
            <header style={{
                height: 56, background: cardBg,
                borderBottom: `1px solid ${borderColor}`,
                boxShadow: cardShadow,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 1.25rem", flexShrink: 0, zIndex: 10,
                transition: "background 0.3s",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {/* Back button */}
                    <button
                        onClick={() => navigate("/home")}
                        style={{
                            background: "none", border: `1px solid ${borderColor}`,
                            borderRadius: 9, cursor: "pointer", color: textSecondary,
                            width: 34, height: 34, display: "flex", alignItems: "center",
                            justifyContent: "center", transition: "all 0.15s",
                        }}
                        title="Back to Home"
                        onMouseEnter={e => { e.currentTarget.style.background = iconBg; e.currentTarget.style.color = textPrimary; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = textSecondary; }}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>

                    {/* Sidebar toggle */}
                    <button
                        onClick={() => setSidebarOpen(o => !o)}
                        style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: textSecondary, width: 34, height: 34,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            borderRadius: 9, transition: "all 0.15s",
                        }}
                        title="Toggle sidebar"
                        onMouseEnter={e => { e.currentTarget.style.background = iconBg; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
                    >
                        <FontAwesomeIcon icon={faBars} />
                    </button>

                    {/* Logo */}
                    <div style={{
                        width: 32, height: 32, borderRadius: 9,
                        background: `linear-gradient(135deg,${C.navy},${C.ocean})`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: 14,
                    }}>
                        <FontAwesomeIcon icon={faRobot} />
                    </div>

                    <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: textPrimary }}>Study Station AI</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <FontAwesomeIcon icon={faCircle} style={{ fontSize: 7, color: "#34d399" }} />
                            <span style={{ fontSize: 11, color: muted }}>Online · Ready to help</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={startNewChat}
                    title="New chat"
                    style={{
                        width: 34, height: 34, borderRadius: 9,
                        border: `1px solid ${borderColor}`,
                        background: "transparent", color: textSecondary,
                        cursor: "pointer", display: "flex", alignItems: "center",
                        justifyContent: "center", transition: "background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = iconBg}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                    <FontAwesomeIcon icon={faPenToSquare} />
                </button>
            </header>

            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

                {/* ── SIDEBAR ── */}
                {sidebarOpen && (
                    <aside style={{
                        width: 240, background: sidebarBg,
                        borderRight: `1px solid ${borderColor}`,
                        display: "flex", flexDirection: "column", flexShrink: 0,
                        overflow: "hidden", transition: "background 0.3s",
                        boxShadow: isDark ? "2px 0 8px rgba(0,0,0,0.2)" : "2px 0 8px rgba(0,0,0,0.04)",
                    }}>
                        <div style={{ padding: "12px 12px 10px", borderBottom: `1px solid ${borderColor}` }}>
                            <button
                                onClick={startNewChat}
                                style={{
                                    width: "100%", padding: "8px 12px", borderRadius: 10,
                                    border: `1px solid ${border2}`, background: "transparent",
                                    color: textPrimary, fontSize: 13, fontWeight: 600, cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit",
                                    transition: "all 0.15s",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = C.navy; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = C.navy; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = textPrimary; e.currentTarget.style.borderColor = border2; }}
                            >
                                <FontAwesomeIcon icon={faPenToSquare} /> New Chat
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: "auto", padding: "8px 6px" }}>
                            {conversations.length === 0 ? (
                                <div style={{ textAlign: "center", color: muted, fontSize: 12, padding: "2rem 1rem" }}>
                                    No conversations yet
                                </div>
                            ) : (
                                <>
                                    <div style={{
                                        fontSize: 10, fontWeight: 700, color: muted,
                                        textTransform: "uppercase", letterSpacing: "0.07em",
                                        padding: "0 6px 6px",
                                    }}>Recent</div>
                                    {conversations.map(conv => (
                                        <SidebarConvItem
                                            key={conv.id}
                                            conv={conv}
                                            active={conv.id === conversationId}
                                            isDark={isDark}
                                            onSelect={handleSelectConversation}
                                            onDelete={handleDeleteConversation}
                                            textPrimary={textPrimary}
                                            muted={muted}
                                        />
                                    ))}
                                </>
                            )}
                        </div>

                        <div style={{ borderTop: `1px solid ${borderColor}`, padding: 12 }}>
                            <div style={{
                                display: "flex", alignItems: "center", gap: 8,
                                padding: "8px 10px", borderRadius: 10,
                                background: isDark ? "rgba(78,135,168,0.12)" : "rgba(78,135,168,0.08)",
                                border: `1px solid rgba(78,135,168,0.2)`,
                            }}>
                                <FontAwesomeIcon icon={faRobot} style={{ color: C.ocean, fontSize: 14 }} />
                                <div style={{ fontSize: 12, fontWeight: 700, color: C.ocean }}>Study Station AI</div>
                            </div>
                        </div>
                    </aside>
                )}

                {/* ── MAIN CHAT ── */}
                <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: bgColor }}>

                    {/* context toolbar */}
                    <div style={{
                        padding: "9px 16px", background: cardBg,
                        borderBottom: `1px solid ${borderColor}`,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        flexShrink: 0, transition: "background 0.3s",
                    }}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {CONTEXT_CHIPS.map(chip => (
                                <button
                                    key={chip.key}
                                    onClick={() => setContext(chip.key)}
                                    style={{
                                        padding: "4px 12px", borderRadius: 999,
                                        fontSize: "11.5px", fontWeight: 600,
                                        cursor: "pointer", fontFamily: "inherit",
                                        border: `1px solid ${context === chip.key ? C.navy : border2}`,
                                        background: context === chip.key ? C.navy : "transparent",
                                        color: context === chip.key ? "#fff" : textSecondary,
                                        transition: "all 0.15s",
                                        display: "flex", alignItems: "center", gap: 5,
                                    }}
                                >
                                    <FontAwesomeIcon icon={chip.icon} style={{ fontSize: 10 }} />
                                    {chip.label}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={startNewChat}
                            title="Clear chat"
                            style={{
                                background: "none", border: `1px solid ${borderColor}`, borderRadius: 8,
                                padding: "4px 10px", cursor: "pointer", color: muted, fontSize: 12,
                                fontFamily: "inherit", transition: "all 0.15s",
                                display: "flex", alignItems: "center", gap: 5,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = "#e53e3e"; e.currentTarget.style.borderColor = "#e53e3e"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = muted; e.currentTarget.style.borderColor = borderColor; }}
                        >
                            <FontAwesomeIcon icon={faTrash} style={{ fontSize: 11 }} /> Clear
                        </button>
                    </div>

                    {/* messages area */}
                    <div style={{
                        flex: 1, overflowY: "auto", padding: "20px 20px",
                        display: "flex", flexDirection: "column", gap: 18,
                        scrollbarWidth: "thin",
                    }}>

                        {/* welcome screen */}
                        {showWelcome && (
                            <div style={{ maxWidth: 460, margin: "0 auto", textAlign: "center", padding: "28px 16px" }}>
                                <div style={{
                                    width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
                                    background: `linear-gradient(135deg,${C.navy},${C.ocean})`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 26, color: "#fff",
                                }}>
                                    <FontAwesomeIcon icon={faRobot} />
                                </div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: textPrimary, marginBottom: 8 }}>Hey there!</div>
                                <div style={{ fontSize: 13.5, color: textSecondary, lineHeight: 1.6, marginBottom: 20 }}>
                                    I'm your Study Station AI. Ask me anything — explain topics, generate quizzes, make flashcards, or summarize your notes.
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                    {QUICK_ACTIONS.map(qa => (
                                        <button
                                            key={qa.label}
                                            onClick={() => { setContext(qa.ctx); handleSend(qa.prompt); }}
                                            style={{
                                                padding: "10px 12px", borderRadius: 11,
                                                border: `1px solid ${border2}`, background: cardBg,
                                                color: textPrimary, fontSize: 12, fontWeight: 600,
                                                cursor: "pointer", textAlign: "left",
                                                fontFamily: "inherit",
                                                display: "flex", alignItems: "center", gap: 8,
                                                transition: "all 0.15s",
                                                boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.2)" : "0 2px 8px rgba(0,0,0,0.06)",
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = C.navy; e.currentTarget.style.color = C.ocean; e.currentTarget.style.background = isDark ? "rgba(78,135,168,0.1)" : "rgba(78,135,168,0.06)"; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = border2; e.currentTarget.style.color = textPrimary; e.currentTarget.style.background = cardBg; }}
                                        >
                                            <FontAwesomeIcon icon={qa.icon} style={{ fontSize: 14, color: C.ocean }} />
                                            {qa.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <MessageBubble key={i} msg={msg} isDark={isDark} onCopy={handleCopy} />
                        ))}

                        {isTyping && <TypingDots isDark={isDark} />}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* ── INPUT AREA ── */}
                    <div style={{
                        padding: "12px 16px", background: cardBg,
                        borderTop: `1px solid ${borderColor}`, flexShrink: 0,
                        transition: "background 0.3s",
                    }}>
                        {/* uploaded file chip */}
                        {uploadedFileName && (
                            <div style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                padding: "4px 10px", borderRadius: 999, marginBottom: 8,
                                background: "rgba(78,135,168,0.1)",
                                border: `1px solid rgba(78,135,168,0.2)`,
                                fontSize: 12, color: C.ocean, fontWeight: 600,
                            }}>
                                <FontAwesomeIcon icon={faPaperclip} /> {uploadedFileName}
                                <button
                                    onClick={() => { setUploadedFileId(null); setUploadedFileName(null); }}
                                    style={{ background: "none", border: "none", cursor: "pointer", color: C.ocean, fontSize: 13, lineHeight: 1 }}
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                        )}

                        <div style={{
                            display: "flex", alignItems: "flex-end", gap: 8,
                            background: inputBg,
                            border: `1.5px solid ${border2}`,
                            borderRadius: 14, padding: "8px 10px 8px 14px",
                            transition: "border-color 0.2s, background 0.3s",
                        }}>
                            {/* attach */}
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                style={{
                                    background: "none", border: "none",
                                    cursor: uploading ? "not-allowed" : "pointer",
                                    color: uploading ? C.ocean : muted, fontSize: 16,
                                    display: "flex", alignItems: "center", padding: "2px 4px",
                                    transition: "color 0.15s",
                                }}
                                title="Attach file"
                            >
                                <FontAwesomeIcon icon={uploading ? faSpinner : faPaperclip} spin={uploading} />
                            </button>

                            {/* textarea */}
                            <textarea
                                ref={inputRef}
                                value={inputVal}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask me anything — explain, quiz, summarize…"
                                rows={1}
                                style={{
                                    flex: 1, border: "none", outline: "none",
                                    background: "transparent", color: textPrimary,
                                    fontSize: "13.5px", fontFamily: "inherit",
                                    resize: "none", minHeight: 22, maxHeight: 120,
                                    lineHeight: 1.5, padding: "2px 0",
                                }}
                            />

                            {/* send */}
                            <button
                                onClick={() => handleSend()}
                                disabled={!inputVal.trim() || isTyping}
                                style={{
                                    width: 34, height: 34, borderRadius: 10,
                                    border: "none", flexShrink: 0,
                                    background: !inputVal.trim() || isTyping
                                        ? (isDark ? "#363636" : "#e8eaed")
                                        : C.navy,
                                    color: !inputVal.trim() || isTyping ? muted : "#fff",
                                    cursor: !inputVal.trim() || isTyping ? "default" : "pointer",
                                    fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
                                    transition: "all 0.15s",
                                }}
                                onMouseEnter={e => { if (inputVal.trim() && !isTyping) e.currentTarget.style.background = C.ocean; }}
                                onMouseLeave={e => { if (inputVal.trim() && !isTyping) e.currentTarget.style.background = C.navy; }}
                            >
                                <FontAwesomeIcon icon={faPaperPlane} />
                            </button>
                        </div>
                        <div style={{ textAlign: "center", fontSize: 10.5, color: muted, marginTop: 7 }}>
                            Press <strong>Enter</strong> to send · <strong>Shift+Enter</strong> for new line
                        </div>
                    </div>
                </main>
            </div>

            <Toast message={toast.msg} visible={toast.visible} type={toast.type} />
        </div>
    );
}