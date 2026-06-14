import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MODE_CONFIG, C, FONT } from "./constants";

export default function ChatWelcome({ context, isDark, textPrimary, textSecondary, cardBg, border2, onExampleClick }) {
    const mode = MODE_CONFIG[context] || MODE_CONFIG.general;

    return (
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px" }}>
            <div style={{
                width: 56, height: 56, borderRadius: 16, marginBottom: 18,
                background: mode.color === C.navy || mode.color === C.ocean || mode.color === C.teal
                    ? `linear-gradient(135deg,${C.navy},${C.ocean})`
                    : mode.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, color: "#fff",
            }}>
                <FontAwesomeIcon icon={mode.icon} />
            </div>

            <div style={{ fontSize: FONT.xl, fontWeight: 800, color: textPrimary, marginBottom: 8 }}>
                {mode.label}
            </div>
            <div style={{ fontSize: FONT.base, color: textSecondary, lineHeight: 1.7, marginBottom: 22 }}>
                {mode.description}
            </div>

            <div style={{
                fontSize: FONT.xs, fontWeight: 700, color: textSecondary,
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10,
            }}>
                Try an example
            </div>
            <div style={{
                display: "grid",
                gridTemplateColumns: mode.examples.length > 3 ? "1fr 1fr" : "1fr",
                gap: 10,
            }}>
                {mode.examples.map(ex => (
                    <button
                        key={ex.label}
                        onClick={() => onExampleClick(ex.prompt)}
                        style={{
                            padding: "13px 16px", borderRadius: 13,
                            border: `1px solid ${border2}`, background: cardBg,
                            color: textPrimary, fontSize: FONT.sm, fontWeight: 600,
                            cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                            transition: "all 0.15s",
                            boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.2)" : "0 2px 8px rgba(0,0,0,0.06)",
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = C.ocean;
                            e.currentTarget.style.color = C.ocean;
                            e.currentTarget.style.background = isDark ? "rgba(78,135,168,0.1)" : "rgba(78,135,168,0.06)";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = border2;
                            e.currentTarget.style.color = textPrimary;
                            e.currentTarget.style.background = cardBg;
                        }}
                    >
                        {ex.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
