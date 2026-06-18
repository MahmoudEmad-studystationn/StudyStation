import { useState } from "react";
import { useThemeContext } from "../Theme/ThemeContext";

export default function ToDoStudyRoom({ tasks = [], onAdd, onToggle, onDelete, onUpdate }) {
    const { isDarkMode } = useThemeContext();
    const [input,      setInput]      = useState("");
    const [adding,     setAdding]     = useState(false);
    const [editingId,  setEditingId]  = useState(null);
    const [editValue,  setEditValue]  = useState("");
    const [savingId,   setSavingId]   = useState(null);

    const textPrimary = isDarkMode ? "#E5E7EB" : "#1C2B38";
    const mutedColor  = isDarkMode ? "#8A9BAA" : "#8A9BAA";
    const border      = isDarkMode ? "rgba(255,255,255,0.07)" : "rgba(44,62,80,0.08)";
    const surface2    = isDarkMode ? "#2a2a2a" : "#EAECF0";
    const surface3    = isDarkMode ? "#252525" : "#f5f6f8";
    const btnBg       = isDarkMode ? "#3D718D" : "#2C3E50";
    const doneBg      = isDarkMode ? "rgba(52,211,153,.08)" : "rgba(52,211,153,.07)";

    async function handleAdd() {
        const text = input.trim();
        if (text.length < 2) return;
        setAdding(true);
        try { await onAdd(text); setInput(""); }
        finally { setAdding(false); }
    }

    function startEdit(task) {
        setEditingId(task.id);
        setEditValue(task.title ?? task.text ?? task.content ?? "");
    }

    async function saveEdit(taskId) {
        const val = editValue.trim();
        if (!val || val.length < 2) { setEditingId(null); return; }
        setSavingId(taskId);
        try {
            await onUpdate(taskId, val);
            setEditingId(null);
        } finally {
            setSavingId(null);
        }
    }

    const done  = tasks.filter(t => t.isDone).length;
    const total = tasks.length;

    return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "1.25rem", minHeight: 0 }}>

            {/* Header */}
            <div style={{
                fontSize: ".68rem", fontWeight: 800, letterSpacing: ".06em",
                textTransform: "uppercase", color: mutedColor, marginBottom: "1rem",
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 11 12 14 22 4"/>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                    Tasks
                </span>
                {total > 0 && (
                    <span style={{ fontSize: ".65rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: surface2, color: mutedColor }}>
                        {done}/{total}
                    </span>
                )}
            </div>

            {/* Add input */}
            <div style={{ display: "flex", gap: 6, marginBottom: "1rem" }}>
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !adding && handleAdd()}
                    placeholder="Add a task…"
                    disabled={adding}
                    style={{
                        flex: 1, padding: "7px 10px", background: surface3,
                        border: `1px solid ${border}`, borderRadius: 10,
                        fontFamily: "inherit", fontSize: ".8rem", color: textPrimary, outline: "none",
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = "#8FB7CC"}
                    onBlur={e  => e.currentTarget.style.borderColor = border}
                />
                <button
                    onClick={handleAdd}
                    disabled={adding || input.trim().length < 2}
                    style={{
                        width: 32, height: 32, borderRadius: 9, border: "none",
                        background: btnBg, color: "#fff",
                        cursor: (adding || input.trim().length < 2) ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        opacity: (adding || input.trim().length < 2) ? .5 : 1,
                        flexShrink: 0, transition: "opacity .2s",
                    }}
                >
                    {adding
                        ? <span style={{ width: 10, height: 10, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", display: "block", animation: "todoSpin .6s linear infinite" }} />
                        : <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    }
                </button>
            </div>

            {/* Task list */}
            <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "thin", display: "flex", flexDirection: "column", gap: 6 }}>
                {tasks.length === 0 && (
                    <div style={{ textAlign: "center", fontSize: ".75rem", color: mutedColor, marginTop: "1.5rem", opacity: .6 }}>
                        No tasks yet. Add one above!
                    </div>
                )}

                {tasks.map(task => (
                    <div
                        key={task.id}
                        style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "7px 10px", borderRadius: 10,
                            background: task.isDone ? doneBg : surface3,
                            border: `1px solid ${border}`, transition: "background .2s",
                        }}
                    >
                        {/* Checkbox */}
                        <button
                            onClick={() => onToggle(task.id)}
                            style={{
                                width: 18, height: 18, borderRadius: 5,
                                border: `1.5px solid ${task.isDone ? "#34d399" : mutedColor}`,
                                background: task.isDone ? "#34d399" : "transparent",
                                cursor: "pointer", display: "flex", alignItems: "center",
                                justifyContent: "center", flexShrink: 0, transition: "all .2s",
                            }}
                        >
                            {task.isDone && (
                                <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                            )}
                        </button>

                        {/* Text or edit input */}
                        {editingId === task.id ? (
                            <input
                                autoFocus
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === "Enter") saveEdit(task.id);
                                    if (e.key === "Escape") setEditingId(null);
                                }}
                                onBlur={() => saveEdit(task.id)}
                                disabled={savingId === task.id}
                                style={{
                                    flex: 1, padding: "3px 7px", background: surface3,
                                    border: `1px solid #8FB7CC`, borderRadius: 7,
                                    fontFamily: "inherit", fontSize: ".78rem",
                                    color: textPrimary, outline: "none",
                                    opacity: savingId === task.id ? .6 : 1,
                                }}
                            />
                        ) : (
                            <span
                                onDoubleClick={() => !task.isDone && startEdit(task)}
                                title={!task.isDone ? "Double-click to edit" : ""}
                                style={{
                                    flex: 1, fontSize: ".78rem",
                                    color: task.isDone ? mutedColor : textPrimary,
                                    textDecoration: task.isDone ? "line-through" : "none",
                                    lineHeight: 1.4, wordBreak: "break-word",
                                    transition: "color .2s",
                                    cursor: !task.isDone ? "text" : "default",
                                }}
                            >
                                {task.title ?? task.text ?? task.content}
                            </span>
                        )}

                        {/* Edit icon (visible on hover) */}
                        {!task.isDone && editingId !== task.id && (
                            <button
                                onClick={() => startEdit(task)}
                                title="Edit task"
                                style={{
                                    width: 22, height: 22, borderRadius: 6, border: "none",
                                    background: "transparent", color: mutedColor,
                                    cursor: "pointer", display: "flex", alignItems: "center",
                                    justifyContent: "center", flexShrink: 0,
                                    transition: "background .15s, color .15s",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(61,113,141,.12)"; e.currentTarget.style.color = "#3D718D"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = mutedColor; }}
                            >
                                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </button>
                        )}

                        {/* Delete */}
                        <button
                            onClick={() => onDelete(task.id)}
                            style={{
                                width: 22, height: 22, borderRadius: 6, border: "none",
                                background: "transparent", color: mutedColor,
                                cursor: "pointer", display: "flex", alignItems: "center",
                                justifyContent: "center", flexShrink: 0,
                                transition: "background .15s, color .15s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(248,113,113,.12)"; e.currentTarget.style.color = "#f87171"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = mutedColor; }}
                        >
                            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                <path d="M10 11v6"/><path d="M14 11v6"/>
                                <path d="M9 6V4h6v2"/>
                            </svg>
                        </button>
                    </div>
                ))}
            </div>

            <style>{`@keyframes todoSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}