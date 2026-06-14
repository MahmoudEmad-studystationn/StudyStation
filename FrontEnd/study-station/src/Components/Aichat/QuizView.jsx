import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRotateLeft, faCheck, faXmark, faChevronLeft,
    faChevronRight, faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { C, FONT } from "./constants";

function getCorrectIndex(q) {
    const options = q.options || [];
    if (typeof q.correctAnswer === "number") return q.correctAnswer;
    return options.findIndex(o => o === q.correctAnswer || o === q.answer);
}

export default function QuizView({ questions, topic, isDark, textPrimary, textSecondary, cardBg, borderColor, onReset }) {
    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState({});
    const [submitted, setSubmitted] = useState(false);

    if (!questions?.length) return null;

    const q = questions[current];
    const options = q.options || [];
    const allAnswered = questions.every((_, i) => selected[i] !== undefined);

    const score = submitted
        ? Object.entries(selected).filter(([qi, oi]) => oi === getCorrectIndex(questions[parseInt(qi)])).length
        : 0;

    const questionLabel = q.question || q.text || `Question ${current + 1}`;

    if (submitted) {
        return (
            <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 0" }}>
                <div style={{
                    background: cardBg, borderRadius: 20, padding: "32px 28px", marginBottom: 18,
                    border: `1px solid ${borderColor}`, textAlign: "center",
                }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: "50%", margin: "0 auto 18px",
                        background: `linear-gradient(135deg,${C.navy},${C.ocean})`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 36, color: "#fff",
                    }}>
                        {score >= questions.length * 0.7 ? "🎉" : score >= questions.length * 0.4 ? "👍" : "📚"}
                    </div>
                    <div style={{ fontSize: FONT.xxl, fontWeight: 800, color: textPrimary }}>
                        {score}/{questions.length}
                    </div>
                    <div style={{ fontSize: FONT.base, color: textSecondary, marginTop: 6 }}>
                        {score >= questions.length * 0.7 ? "Great job!" : score >= questions.length * 0.4 ? "Good effort!" : "Keep studying!"}
                    </div>
                    <button
                        onClick={onReset}
                        style={{
                            marginTop: 20, padding: "11px 26px", borderRadius: 12,
                            background: C.navy, color: "#fff", border: "none",
                            fontSize: FONT.sm, fontWeight: 700, cursor: "pointer",
                            display: "inline-flex", alignItems: "center", gap: 8,
                        }}
                    >
                        <FontAwesomeIcon icon={faArrowRotateLeft} /> Try Again
                    </button>
                </div>

                {questions.map((qq, qi) => {
                    const opts = qq.options || [];
                    const ci = getCorrectIndex(qq);
                    const userPick = selected[qi];
                    const isRight = userPick === ci;
                    const qText = qq.question || qq.text || `Question ${qi + 1}`;

                    return (
                        <div key={qi} style={{
                            background: cardBg, borderRadius: 16, padding: "20px 22px", marginBottom: 12,
                            border: `1.5px solid ${isRight ? "#34d399" : "#f87171"}`,
                        }}>
                            <div style={{
                                fontSize: FONT.xs, fontWeight: 700, color: C.ocean,
                                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8,
                            }}>
                                Question {qi + 1}
                            </div>
                            <div style={{ fontSize: FONT.md, fontWeight: 700, color: textPrimary, marginBottom: 14, lineHeight: 1.55 }}>
                                {qText}
                            </div>
                            {opts.map((opt, oi) => {
                                const isCorrect = oi === ci;
                                const isUser = oi === userPick;
                                return (
                                    <div key={oi} style={{
                                        padding: "10px 14px", borderRadius: 10, marginBottom: 6,
                                        border: `1px solid ${isCorrect ? "#34d399" : isUser ? "#f87171" : borderColor}`,
                                        background: isCorrect ? "rgba(52,211,153,0.15)" : isUser ? "rgba(248,113,113,0.12)" : "transparent",
                                        fontSize: FONT.base, color: textPrimary,
                                        display: "flex", alignItems: "center", gap: 10,
                                    }}>
                                        {isCorrect ? <FontAwesomeIcon icon={faCheck} style={{ color: "#34d399" }} />
                                            : isUser ? <FontAwesomeIcon icon={faXmark} style={{ color: "#f87171" }} />
                                            : <span style={{ width: 16 }} />}
                                        {opt}
                                    </div>
                                );
                            })}
                            {qq.explanation && (
                                <div style={{
                                    marginTop: 12, padding: "10px 14px", borderRadius: 10,
                                    background: isDark ? "rgba(78,135,168,0.1)" : "rgba(78,135,168,0.06)",
                                    fontSize: FONT.sm, color: textSecondary, lineHeight: 1.65,
                                }}>
                                    💡 {qq.explanation}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 0" }}>
            {topic && (
                <div style={{
                    textAlign: "center", marginBottom: 16, padding: "10px 16px",
                    borderRadius: 12, background: isDark ? "rgba(78,135,168,0.1)" : "rgba(78,135,168,0.07)",
                    border: `1px solid rgba(78,135,168,0.2)`,
                    fontSize: FONT.sm, color: C.ocean, fontWeight: 600,
                }}>
                    Quiz topic: {topic}
                </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: FONT.sm, color: textSecondary, fontWeight: 600 }}>
                    Question {current + 1} of {questions.length}
                </span>
                <div style={{
                    height: 6, flex: 1, margin: "0 14px", borderRadius: 99,
                    background: isDark ? "#333" : "#e5e7eb", overflow: "hidden",
                }}>
                    <div style={{
                        height: "100%", borderRadius: 99,
                        background: `linear-gradient(90deg,${C.navy},${C.ocean})`,
                        width: `${((current + 1) / questions.length) * 100}%`,
                        transition: "width 0.3s",
                    }} />
                </div>
                <span style={{ fontSize: FONT.sm, color: textSecondary }}>
                    {Object.keys(selected).length}/{questions.length}
                </span>
            </div>

            <div style={{
                background: cardBg, borderRadius: 20, padding: "28px 26px",
                border: `1px solid ${borderColor}`, marginBottom: 16,
                boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.2)" : "0 4px 20px rgba(0,0,0,0.06)",
            }}>
                <div style={{
                    fontSize: FONT.xs, fontWeight: 700, color: C.ocean,
                    textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12,
                }}>
                    Question
                </div>
                <div style={{
                    fontSize: FONT.lg, fontWeight: 700, color: textPrimary,
                    lineHeight: 1.6, marginBottom: 22,
                }}>
                    {questionLabel}
                </div>

                {options.length === 0 ? (
                    <div style={{ fontSize: FONT.sm, color: textSecondary, fontStyle: "italic" }}>
                        No answer options available for this question.
                    </div>
                ) : (
                    options.map((opt, oi) => {
                        const picked = selected[current] === oi;
                        return (
                            <button
                                key={oi}
                                onClick={() => setSelected(s => ({ ...s, [current]: oi }))}
                                style={{
                                    display: "flex", alignItems: "center", gap: 12,
                                    width: "100%", padding: "13px 16px", borderRadius: 12,
                                    marginBottom: 10, textAlign: "left", fontFamily: "inherit",
                                    fontSize: FONT.base, cursor: "pointer",
                                    border: `1.5px solid ${picked ? C.ocean : borderColor}`,
                                    background: picked ? (isDark ? "rgba(78,135,168,0.15)" : "rgba(78,135,168,0.08)") : "transparent",
                                    color: picked ? C.ocean : textPrimary,
                                    fontWeight: picked ? 700 : 400,
                                    transition: "all 0.15s",
                                }}
                            >
                                <span style={{
                                    width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                                    border: `1.5px solid ${picked ? C.ocean : (isDark ? "#555" : "#ccc")}`,
                                    background: picked ? C.ocean : "transparent",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 11, color: picked ? "#fff" : textSecondary, fontWeight: 700,
                                }}>
                                    {picked ? <FontAwesomeIcon icon={faCheck} /> : String.fromCharCode(65 + oi)}
                                </span>
                                {opt}
                            </button>
                        );
                    })
                )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <button
                    onClick={() => setCurrent(c => Math.max(0, c - 1))}
                    disabled={current === 0}
                    style={{
                        padding: "11px 20px", borderRadius: 12, border: `1px solid ${borderColor}`,
                        background: "transparent", color: current === 0 ? (isDark ? "#555" : "#bbb") : textPrimary,
                        fontSize: FONT.sm, fontWeight: 600, cursor: current === 0 ? "default" : "pointer",
                        display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit",
                    }}
                >
                    <FontAwesomeIcon icon={faChevronLeft} /> Prev
                </button>

                {current < questions.length - 1 ? (
                    <button
                        onClick={() => setCurrent(c => Math.min(questions.length - 1, c + 1))}
                        style={{
                            padding: "11px 22px", borderRadius: 12, border: "none",
                            background: C.navy, color: "#fff",
                            fontSize: FONT.sm, fontWeight: 600, cursor: "pointer",
                            display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit",
                        }}
                    >
                        Next <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                ) : (
                    <button
                        onClick={() => allAnswered && setSubmitted(true)}
                        disabled={!allAnswered}
                        style={{
                            padding: "11px 24px", borderRadius: 12, border: "none",
                            background: allAnswered ? "#34d399" : (isDark ? "#333" : "#e5e7eb"),
                            color: allAnswered ? "#fff" : (isDark ? "#555" : "#bbb"),
                            fontSize: FONT.sm, fontWeight: 700, cursor: allAnswered ? "pointer" : "default",
                            display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit",
                        }}
                    >
                        <FontAwesomeIcon icon={faCircleCheck} /> Submit Quiz
                    </button>
                )}
            </div>
        </div>
    );
}
