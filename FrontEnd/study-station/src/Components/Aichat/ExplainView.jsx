import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb, faCopy } from "@fortawesome/free-solid-svg-icons";
import { C, FONT } from "./constants";

export default function ExplainView({ data, topic, isDark, textPrimary, cardBg, borderColor, onCopy }) {
    const text = typeof data === "string" ? data : data?.explanation || JSON.stringify(data, null, 2);

    return (
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 0" }}>
            <div style={{
                background: cardBg, borderRadius: 20,
                border: `1px solid ${borderColor}`, overflow: "hidden",
                boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.2)" : "0 4px 20px rgba(0,0,0,0.06)",
            }}>
                <div style={{
                    padding: "16px 22px",
                    background: `linear-gradient(90deg,${C.navy},${C.ocean})`,
                    display: "flex", alignItems: "center", gap: 12,
                }}>
                    <FontAwesomeIcon icon={faLightbulb} style={{ color: "#fbbf24", fontSize: 18 }} />
                    <div>
                        <span style={{ fontSize: FONT.base, fontWeight: 700, color: "#fff" }}>Explanation</span>
                        {topic && (
                            <div style={{ fontSize: FONT.xs, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>
                                {topic}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => onCopy(text)}
                        style={{
                            marginLeft: "auto", background: "rgba(255,255,255,0.15)", border: "none",
                            borderRadius: 8, padding: "6px 12px", color: "#fff", fontSize: FONT.xs,
                            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                        }}
                    >
                        <FontAwesomeIcon icon={faCopy} style={{ fontSize: 12 }} /> Copy
                    </button>
                </div>
                <div style={{
                    padding: "24px 26px",
                    fontSize: FONT.base, lineHeight: 1.85, color: textPrimary,
                    whiteSpace: "pre-wrap", wordBreak: "break-word",
                }}>
                    {text}
                </div>
            </div>
        </div>
    );
}
