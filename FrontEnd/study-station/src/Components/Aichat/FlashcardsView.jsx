import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faRotate, faXmark, faCheck, faChevronLeft, faChevronRight, faArrowRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import { C, FONT } from "./constants";

export default function FlashcardsView({ cards, topic, isDark, textPrimary, textSecondary, cardBg, borderColor, onReset }) {
    const [current, setCurrent] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [known, setKnown] = useState(new Set());

    if (!cards?.length) return null;

    const card = cards[current];
    const front = card.front || card.term || card.question || "";
    const back = card.back || card.definition || card.answer || "";
    const doneCount = known.size;

    function markKnown(val) {
        setKnown(s => {
            const ns = new Set(s);
            val ? ns.add(current) : ns.delete(current);
            return ns;
        });
        setFlipped(false);
        setCurrent(c => (c + 1) % cards.length);
    }

    return (
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 0", width: "100%" }}>
            {topic && (
                <div style={{
                    textAlign: "center", marginBottom: 16, padding: "10px 16px",
                    borderRadius: 12, background: isDark ? "rgba(78,135,168,0.1)" : "rgba(78,135,168,0.07)",
                    border: `1px solid rgba(78,135,168,0.2)`,
                    fontSize: FONT.sm, color: C.ocean, fontWeight: 600,
                }}>
                    Flashcards: {topic}
                </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: FONT.sm, color: textSecondary, fontWeight: 600 }}>
                    {current + 1}/{cards.length}
                </span>
                <div style={{
                    height: 6, flex: 1, margin: "0 14px", borderRadius: 99,
                    background: isDark ? "#333" : "#e5e7eb", overflow: "hidden",
                }}>
                    <div style={{
                        height: "100%", borderRadius: 99,
                        background: `linear-gradient(90deg,#34d399,${C.ocean})`,
                        width: `${(doneCount / cards.length) * 100}%`,
                        transition: "width 0.35s",
                    }} />
                </div>
                <span style={{ fontSize: FONT.sm, color: "#34d399", fontWeight: 700 }}>
                    {doneCount} known
                </span>
            </div>

            <div
                onClick={() => setFlipped(f => !f)}
                style={{ perspective: 1200, cursor: "pointer", marginBottom: 20, userSelect: "none" }}
            >
                <div style={{
                    position: "relative", width: "100%", minHeight: 320,
                    transformStyle: "preserve-3d",
                    transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    transition: "transform 0.45s cubic-bezier(.4,0,.2,1)",
                }}>
                    <div style={{
                        position: "absolute", inset: 0, minHeight: 320,
                        backfaceVisibility: "hidden",
                        background: cardBg,
                        border: `2px solid ${borderColor}`,
                        borderRadius: 24,
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        padding: "36px 40px",
                        boxShadow: isDark ? "0 12px 40px rgba(0,0,0,0.35)" : "0 12px 40px rgba(0,0,0,0.1)",
                    }}>
                        <div style={{
                            fontSize: FONT.sm, fontWeight: 700, color: C.ocean,
                            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20,
                        }}>
                            Term
                        </div>
                        <div style={{
                            fontSize: FONT.xl, fontWeight: 700, color: textPrimary,
                            textAlign: "center", lineHeight: 1.55,
                        }}>
                            {front || "—"}
                        </div>
                        <div style={{ marginTop: 28, fontSize: FONT.sm, color: isDark ? "#666" : "#aaa" }}>
                            Tap to reveal answer
                        </div>
                    </div>

                    <div style={{
                        position: "absolute", inset: 0, minHeight: 320,
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        background: isDark ? "#1e3040" : `linear-gradient(135deg,${C.skyLight},#fff)`,
                        border: `2px solid ${C.ocean}`,
                        borderRadius: 24,
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        padding: "36px 40px",
                        boxShadow: "0 12px 40px rgba(78,135,168,0.22)",
                    }}>
                        <div style={{
                            fontSize: FONT.sm, fontWeight: 700, color: C.ocean,
                            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20,
                        }}>
                            Definition
                        </div>
                        <div style={{
                            fontSize: FONT.lg, color: textPrimary,
                            textAlign: "center", lineHeight: 1.7,
                        }}>
                            {back || "—"}
                        </div>
                    </div>
                </div>
            </div>

            {!flipped && (
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
                    <button
                        onClick={() => setFlipped(true)}
                        style={{
                            background: "none", border: `1px solid ${borderColor}`, borderRadius: 10,
                            padding: "8px 18px", fontSize: FONT.sm, color: textSecondary,
                            cursor: "pointer", fontFamily: "inherit",
                            display: "flex", alignItems: "center", gap: 8,
                        }}
                    >
                        <FontAwesomeIcon icon={faRotate} /> Flip card
                    </button>
                </div>
            )}

            {flipped && (
                <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                    <button
                        onClick={() => markKnown(false)}
                        style={{
                            flex: 1, padding: "14px", borderRadius: 14,
                            background: "rgba(248,113,113,0.12)", border: "1.5px solid #f87171",
                            color: "#f87171", fontSize: FONT.base, fontWeight: 700,
                            cursor: "pointer", fontFamily: "inherit",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        }}
                    >
                        <FontAwesomeIcon icon={faXmark} /> Still learning
                    </button>
                    <button
                        onClick={() => markKnown(true)}
                        style={{
                            flex: 1, padding: "14px", borderRadius: 14,
                            background: "rgba(52,211,153,0.12)", border: "1.5px solid #34d399",
                            color: "#34d399", fontSize: FONT.base, fontWeight: 700,
                            cursor: "pointer", fontFamily: "inherit",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        }}
                    >
                        <FontAwesomeIcon icon={faCheck} /> Got it!
                    </button>
                </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <button
                    onClick={() => { setCurrent(c => Math.max(0, c - 1)); setFlipped(false); }}
                    disabled={current === 0}
                    style={{
                        background: "none", border: `1px solid ${borderColor}`, borderRadius: 10,
                        padding: "9px 16px", fontSize: FONT.sm,
                        color: current === 0 ? (isDark ? "#444" : "#ccc") : textSecondary,
                        cursor: current === 0 ? "default" : "pointer", fontFamily: "inherit",
                        display: "flex", alignItems: "center", gap: 7,
                    }}
                >
                    <FontAwesomeIcon icon={faChevronLeft} /> Prev
                </button>
                <button
                    onClick={onReset}
                    style={{
                        background: "none", border: `1px solid ${borderColor}`, borderRadius: 10,
                        padding: "9px 16px", fontSize: FONT.sm, color: textSecondary,
                        cursor: "pointer", fontFamily: "inherit",
                        display: "flex", alignItems: "center", gap: 7,
                    }}
                >
                    <FontAwesomeIcon icon={faArrowRotateLeft} /> Restart
                </button>
                <button
                    onClick={() => { setCurrent(c => Math.min(cards.length - 1, c + 1)); setFlipped(false); }}
                    disabled={current === cards.length - 1}
                    style={{
                        background: "none", border: `1px solid ${borderColor}`, borderRadius: 10,
                        padding: "9px 16px", fontSize: FONT.sm,
                        color: current === cards.length - 1 ? (isDark ? "#444" : "#ccc") : textSecondary,
                        cursor: current === cards.length - 1 ? "default" : "pointer", fontFamily: "inherit",
                        display: "flex", alignItems: "center", gap: 7,
                    }}
                >
                    Next <FontAwesomeIcon icon={faChevronRight} />
                </button>
            </div>
        </div>
    );
}
