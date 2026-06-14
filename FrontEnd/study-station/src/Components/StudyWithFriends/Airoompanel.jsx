import { useState, useRef, useEffect, useCallback } from "react";
import {
    sendAiMessage,
    generateFlashcards,
    generateQuiz,
    getRoomAnalytics,
} from "../Services/aiRoomService";

// ─── helpers ────────────────────────────────────────────────────────────────
const TABS = [
    { id: "chat", label: "AI Chat" },
    { id: "flashcards", label: "Flashcards" },
    { id: "quiz", label: "Quiz" },
];

const DIFFICULTIES = ["easy", "medium", "hard"];
const QUESTION_TYPES = ["multiple-choice", "true-false", "short-answer"];

// ─── sub-components ─────────────────────────────────────────────────────────

function Spinner({ size = 16, color = "#8FB7CC" }) {
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%",
            border: `2px solid rgba(143,183,204,.25)`,
            borderTopColor: color,
            animation: "aiSpin .65s linear infinite",
            display: "inline-block", flexShrink: 0,
        }} />
    );
}

// ─── AI Chat ────────────────────────────────────────────────────────────────
function AiChat({ roomId, isDarkMode }) {
    const [msgs, setMsgs] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [convId, setConvId] = useState(null);
    const bottomRef = useRef(null);

    const surface = isDarkMode ? "#252525" : "#F5F6F8";
    const border = isDarkMode ? "rgba(255,255,255,.07)" : "rgba(44,62,80,.08)";
    const text = isDarkMode ? "#EDF2F7" : "#1C2B38";
    const muted = isDarkMode ? "#5A7080" : "#8A9BAA";
    const userBg = isDarkMode ? "#3D718D" : "#2C3E50";
    const aiBg = isDarkMode ? "#2b2b2b" : "#EAF2F8";

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [msgs, loading]);

    const send = async () => {
        const text = input.trim();
        if (!text || loading) return;
        setInput("");

        const userMsg = { role: "user", content: text };
        setMsgs(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            const res = await sendAiMessage(roomId, {
                message: text,
                context: "study-room",
                conversationId: convId ?? null,
                contextEntityId: null,
                uploadedFileId: null,
            });

            const aiContent =
                res?.message ?? res?.content ?? res?.reply ??
                res?.text ?? JSON.stringify(res);

            if (res?.conversationId) setConvId(res.conversationId);
            setMsgs(prev => [...prev, { role: "ai", content: aiContent }]);
        } catch {
            setMsgs(prev => [...prev, { role: "ai", content: "⚠️ Something went wrong. Try again." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKey = e => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>

            {/* messages */}
            <div style={{
                flex: 1, overflowY: "auto", padding: "1rem",
                display: "flex", flexDirection: "column", gap: ".65rem",
                scrollbarWidth: "thin",
            }}>
                {msgs.length === 0 && (
                    <div style={{ textAlign: "center", marginTop: "3rem", opacity: .45 }}>
                        <div style={{ fontSize: "2rem", marginBottom: ".5rem" }}>🤖</div>
                        <div style={{ fontSize: ".8rem", fontWeight: 600, color: muted }}>
                            Ask me anything about your study session
                        </div>
                    </div>
                )}

                {msgs.map((m, i) => (
                    <div key={i} style={{
                        display: "flex",
                        justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                    }}>
                        <div style={{
                            maxWidth: "82%",
                            padding: "9px 13px",
                            borderRadius: m.role === "user"
                                ? "14px 14px 4px 14px"
                                : "14px 14px 14px 4px",
                            background: m.role === "user" ? userBg : aiBg,
                            color: m.role === "user" ? "#fff" : text,
                            fontSize: ".8rem",
                            lineHeight: 1.6,
                            wordBreak: "break-word",
                            whiteSpace: "pre-wrap",
                        }}>
                            {m.content}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                            padding: "10px 14px", borderRadius: "14px 14px 14px 4px",
                            background: aiBg, display: "flex", alignItems: "center", gap: 8,
                        }}>
                            <Spinner size={14} />
                            <span style={{ fontSize: ".75rem", color: muted }}>Thinking…</span>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* input */}
            <div style={{ padding: ".75rem", borderTop: `1px solid ${border}`, flexShrink: 0 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                    <textarea
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Ask the AI…"
                        rows={1}
                        disabled={loading}
                        style={{
                            flex: 1, padding: "9px 12px",
                            background: surface,
                            border: `1px solid ${border}`,
                            borderRadius: 12,
                            fontFamily: "inherit", fontSize: ".8rem",
                            color: text, outline: "none", resize: "none",
                            lineHeight: 1.4, maxHeight: 80,
                        }}
                    />
                    <button
                        onClick={send}
                        disabled={loading || !input.trim()}
                        style={{
                            width: 36, height: 36, borderRadius: 10, border: "none",
                            background: loading || !input.trim() ? muted : userBg,
                            color: "#fff", cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, transition: "background .2s",
                        }}
                    >
                        {loading
                            ? <Spinner size={13} color="#fff" />
                            : <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Generator Form (shared by Flashcards & Quiz) ───────────────────────────
function GeneratorForm({ roomId, isDarkMode, mode }) {
    const isFlash = mode === "flashcards";

    const [topic, setTopic] = useState("");
    const [count, setCount] = useState(5);
    const [diff, setDiff] = useState("medium");
    const [qType, setQType] = useState("multiple-choice");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [flipped, setFlipped] = useState({});  // for flashcards
    const [answers, setAnswers] = useState({});  // for quiz
    const [checked, setChecked] = useState(false);

    const border = isDarkMode ? "rgba(255,255,255,.07)" : "rgba(44,62,80,.08)";
    const surface = isDarkMode ? "#252525" : "#F5F6F8";
    const text = isDarkMode ? "#EDF2F7" : "#1C2B38";
    const muted = isDarkMode ? "#5A7080" : "#8A9BAA";
    const accent = "#3D718D";

    const generate = async () => {
        if (!topic.trim()) { setError("Please enter a topic."); return; }
        setError(""); setLoading(true); setResult(null);
        setFlipped({}); setAnswers({}); setChecked(false);

        try {
            const payload = { topic: topic.trim(), count, difficulty: diff, questionType: qType, content: null, uploadedFileId: null };
            const res = isFlash
                ? await generateFlashcards(roomId, payload)
                : await generateQuiz(roomId, payload);

            const items =
                res?.flashcards ?? res?.cards ??
                res?.questions ?? res?.quiz ??
                res?.items ?? (Array.isArray(res) ? res : null);

            setResult(items);
        } catch {
            setError("Generation failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => { setResult(null); setFlipped({}); setAnswers({}); setChecked(false); };

    const labelStyle = { fontSize: ".72rem", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: muted, marginBottom: 4, display: "block" };
    const inputStyle = { width: "100%", padding: "8px 11px", background: surface, border: `1px solid ${border}`, borderRadius: 10, fontFamily: "inherit", fontSize: ".8rem", color: text, outline: "none", boxSizing: "border-box" };
    const btnStyle = { width: "100%", padding: "10px", borderRadius: 12, border: "none", background: accent, color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: ".83rem", cursor: "pointer" };

    // ── Quiz score ──────────────────────────────────────────────────────────
    const getScore = () => {
        if (!result) return 0;
        return result.filter((q, i) => {
            const correct = q.answer ?? q.correctAnswer ?? q.correct;
            return answers[i] === correct;
        }).length;
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, overflowY: "auto" }}>

            {/* form */}
            {!result && (
                <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: ".85rem" }}>
                    <div>
                        <label style={labelStyle}>Topic</label>
                        <input
                            value={topic} onChange={e => setTopic(e.target.value)}
                            placeholder={isFlash ? "e.g. Cell biology" : "e.g. World War II"}
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".75rem" }}>
                        <div>
                            <label style={labelStyle}>Count</label>
                            <input type="number" min={1} max={20} value={count}
                                onChange={e => setCount(Number(e.target.value))}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Difficulty</label>
                            <select value={diff} onChange={e => setDiff(e.target.value)} style={inputStyle}>
                                {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Question Type</label>
                        <select value={qType} onChange={e => setQType(e.target.value)} style={inputStyle}>
                            {QUESTION_TYPES.map(t => <option key={t} value={t}>{t.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ")}</option>)}
                        </select>
                    </div>

                    {error && <div style={{ fontSize: ".75rem", color: "#f87171", fontWeight: 600 }}>{error}</div>}

                    <button onClick={generate} disabled={loading} style={{ ...btnStyle, opacity: loading ? .7 : 1, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        {loading ? <><Spinner size={14} color="#fff" /> Generating…</> : `Generate ${isFlash ? "Flashcards" : "Quiz"}`}
                    </button>
                </div>
            )}

            {/* ── Flashcards result ── */}
            {result && isFlash && (
                <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: ".75rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: ".75rem", fontWeight: 700, color: muted }}>{result.length} cards · {diff} · {topic}</span>
                        <button onClick={reset} style={{ fontSize: ".72rem", fontWeight: 700, color: accent, background: "none", border: "none", cursor: "pointer" }}>← New</button>
                    </div>

                    {result.map((card, i) => {
                        const q = card.question ?? card.front ?? card.term ?? card.q ?? `Card ${i + 1}`;
                        const a = card.answer ?? card.back ?? card.definition ?? card.a ?? "—";
                        const isFlip = !!flipped[i];
                        return (
                            <div
                                key={i}
                                onClick={() => setFlipped(f => ({ ...f, [i]: !f[i] }))}
                                style={{
                                    padding: "1rem 1.1rem",
                                    borderRadius: 14,
                                    border: `1px solid ${border}`,
                                    background: isFlip ? (isDarkMode ? "#1a3040" : "#EAF2F8") : surface,
                                    cursor: "pointer",
                                    transition: "background .25s",
                                    userSelect: "none",
                                }}
                            >
                                <div style={{ fontSize: ".65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: muted, marginBottom: 5 }}>
                                    {isFlip ? "Answer" : `Card ${i + 1} · tap to reveal`}
                                </div>
                                <div style={{ fontSize: ".83rem", color: text, lineHeight: 1.55 }}>
                                    {isFlip ? a : q}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Quiz result ── */}
            {result && !isFlash && (
                <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: ".85rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: ".75rem", fontWeight: 700, color: muted }}>{result.length} questions · {diff}</span>
                        <button onClick={reset} style={{ fontSize: ".72rem", fontWeight: 700, color: accent, background: "none", border: "none", cursor: "pointer" }}>← New</button>
                    </div>

                    {result.map((q, i) => {
                        const question = q.question ?? q.q ?? `Q${i + 1}`;
                        const options = q.options ?? q.choices ?? [];
                        const correct = q.answer ?? q.correctAnswer ?? q.correct;
                        const selected = answers[i];
                        const isRight = checked && selected === correct;
                        const isWrong = checked && selected && selected !== correct;

                        return (
                            <div key={i} style={{ padding: "1rem", borderRadius: 14, border: `1px solid ${border}`, background: surface }}>
                                <div style={{ fontSize: ".8rem", fontWeight: 700, color: text, marginBottom: ".65rem", lineHeight: 1.5 }}>
                                    {i + 1}. {question}
                                </div>

                                {options.length > 0 ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        {options.map((opt, j) => {
                                            const isSelected = selected === opt;
                                            const isCorrectOpt = checked && opt === correct;
                                            const bg = isCorrectOpt
                                                ? "rgba(52,211,153,.15)"
                                                : isSelected && isWrong
                                                    ? "rgba(248,113,113,.12)"
                                                    : isSelected
                                                        ? (isDarkMode ? "rgba(61,113,141,.25)" : "rgba(44,62,80,.08)")
                                                        : "transparent";
                                            const bc = isCorrectOpt
                                                ? "#34d399"
                                                : isSelected && isWrong
                                                    ? "#f87171"
                                                    : border;

                                            return (
                                                <button
                                                    key={j}
                                                    disabled={checked}
                                                    onClick={() => setAnswers(a => ({ ...a, [i]: opt }))}
                                                    style={{
                                                        padding: "7px 11px", borderRadius: 9,
                                                        border: `1px solid ${bc}`,
                                                        background: bg,
                                                        color: text, fontFamily: "inherit",
                                                        fontSize: ".78rem", textAlign: "left",
                                                        cursor: checked ? "default" : "pointer",
                                                        transition: "all .15s",
                                                    }}
                                                >
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <input
                                        disabled={checked}
                                        placeholder="Type your answer…"
                                        value={answers[i] ?? ""}
                                        onChange={e => setAnswers(a => ({ ...a, [i]: e.target.value }))}
                                        style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                                    />
                                )}
                            </div>
                        );
                    })}

                    {!checked ? (
                        <button
                            onClick={() => setChecked(true)}
                            disabled={Object.keys(answers).length === 0}
                            style={{ ...btnStyle, opacity: Object.keys(answers).length === 0 ? .5 : 1 }}
                        >
                            Submit Answers
                        </button>
                    ) : (
                        <div style={{
                            padding: "1rem", borderRadius: 14,
                            background: isDarkMode ? "rgba(52,211,153,.1)" : "rgba(52,211,153,.08)",
                            border: "1px solid rgba(52,211,153,.25)",
                            textAlign: "center",
                        }}>
                            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#34d399" }}>
                                {getScore()} / {result.length}
                            </div>
                            <div style={{ fontSize: ".72rem", color: muted, marginTop: 3 }}>
                                {getScore() === result.length ? "Perfect score! 🎉" : "Keep studying! 💪"}
                            </div>
                            <button onClick={reset} style={{ ...btnStyle, marginTop: ".75rem", background: accent }}>Try Again</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Analytics ───────────────────────────────────────────────────────────────
function AnalyticsPanel({ roomId, isDarkMode }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const border = isDarkMode ? "rgba(255,255,255,.07)" : "rgba(44,62,80,.08)";
    const surface = isDarkMode ? "#252525" : "#F5F6F8";
    const text = isDarkMode ? "#EDF2F7" : "#1C2B38";
    const muted = isDarkMode ? "#5A7080" : "#8A9BAA";

    const load = useCallback(async () => {
        setLoading(true); setError("");
        try {
            const res = await getRoomAnalytics(roomId);
            setData(res);
        } catch {
            setError("Could not load analytics.");
        } finally {
            setLoading(false);
        }
    }, [roomId]);

    useEffect(() => { load(); }, [load]);

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", gap: 10 }}>
            <Spinner size={20} /><span style={{ fontSize: ".8rem", color: muted }}>Loading analytics…</span>
        </div>
    );

    if (error) return (
        <div style={{ padding: "1.5rem", textAlign: "center" }}>
            <div style={{ fontSize: ".8rem", color: "#f87171", marginBottom: ".75rem" }}>{error}</div>
            <button onClick={load} style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "#3D718D", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: ".78rem" }}>Retry</button>
        </div>
    );

    if (!data) return null;

    // render analytics as key-value cards
    const renderValue = (val) => {
        if (val === null || val === undefined) return "—";
        if (typeof val === "object") return JSON.stringify(val);
        return String(val);
    };

    const entries = Object.entries(data).filter(([, v]) => typeof v !== "object" || v === null);
    const nested = Object.entries(data).filter(([, v]) => typeof v === "object" && v !== null);

    return (
        <div style={{ padding: "1rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: ".75rem" }}>
            <div style={{ fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: muted }}>
                Room Analytics
            </div>

            {/* flat stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".6rem" }}>
                {entries.map(([k, v]) => (
                    <div key={k} style={{ padding: ".85rem", borderRadius: 12, background: surface, border: `1px solid ${border}` }}>
                        <div style={{ fontSize: ".62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: muted, marginBottom: 4 }}>
                            {k.replace(/([A-Z])/g, " $1").trim()}
                        </div>
                        <div style={{ fontSize: ".95rem", fontWeight: 800, color: text }}>{renderValue(v)}</div>
                    </div>
                ))}
            </div>

            {/* nested objects */}
            {nested.map(([k, v]) => (
                <div key={k} style={{ padding: ".9rem", borderRadius: 12, background: surface, border: `1px solid ${border}` }}>
                    <div style={{ fontSize: ".65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: muted, marginBottom: ".6rem" }}>
                        {k.replace(/([A-Z])/g, " $1").trim()}
                    </div>
                    <pre style={{ fontSize: ".72rem", color: text, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.6 }}>
                        {JSON.stringify(v, null, 2)}
                    </pre>
                </div>
            ))}

            <button onClick={load} style={{ padding: "8px", borderRadius: 10, border: `1px solid ${border}`, background: "transparent", color: muted, fontFamily: "inherit", fontWeight: 700, fontSize: ".72rem", cursor: "pointer" }}>
                ↻ Refresh
            </button>
        </div>
    );
}

// ─── Main Panel ─────────────────────────────────────────────────────────────
export default function AiRoomPanel({ roomId, isDarkMode }) {
    const [activeTab, setActiveTab] = useState("chat");

    const border = isDarkMode ? "rgba(255,255,255,.07)" : "rgba(44,62,80,.08)";
    const surface = isDarkMode ? "#1e1e1e" : "#fff";
    const text = isDarkMode ? "#EDF2F7" : "#1C2B38";
    const muted = isDarkMode ? "#5A7080" : "#8A9BAA";
    const accent = "#3D718D";

    return (
        <div style={{
            display: "flex", flexDirection: "column",
            height: "100%", overflow: "hidden",
            background: surface,
        }}>
            <style>{`@keyframes aiSpin { to { transform: rotate(360deg); } }`}</style>

            {/* header */}
            <div style={{
                padding: ".7rem 1rem .6rem",
                borderBottom: `1px solid ${border}`,
                flexShrink: 0,
            }}>
                <div style={{
                    display: "flex", alignItems: "center", gap: 6,
                    marginBottom: ".6rem",
                }}>
                    <span style={{ fontSize: ".72rem", fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", color: muted }}>
                        🤖 AI Assistant
                    </span>
                </div>

                {/* tabs */}
                <div style={{ display: "flex", gap: 4 }}>
                    {TABS.map(t => {
                        const active = t.id === activeTab;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                style={{
                                    flex: 1, padding: "5px 4px",
                                    borderRadius: 8, border: "none",
                                    background: active ? accent : "transparent",
                                    color: active ? "#fff" : muted,
                                    fontFamily: "inherit", fontWeight: 700,
                                    fontSize: ".65rem", cursor: "pointer",
                                    transition: "all .2s",
                                }}
                            >
                                {t.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* tab content */}
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {activeTab === "chat" && <AiChat roomId={roomId} isDarkMode={isDarkMode} />}
                {activeTab === "flashcards" && <GeneratorForm roomId={roomId} isDarkMode={isDarkMode} mode="flashcards" />}
                {activeTab === "quiz" && <GeneratorForm roomId={roomId} isDarkMode={isDarkMode} mode="quiz" />}
            </div>
        </div>
    );
}