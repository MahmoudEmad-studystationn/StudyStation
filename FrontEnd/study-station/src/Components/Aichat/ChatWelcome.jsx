import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MODE_CONFIG, C, FONT } from "./constants";

export default function ChatWelcome({ context, isDark, textPrimary, textSecondary, cardBg, border2, onExampleClick }) {
    const mode = MODE_CONFIG[context] || MODE_CONFIG.general;

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            maxWidth: 560,
            margin: "auto",
            padding: "32px 20px",
            flex: 1,
        }}>
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
            <div style={{ fontSize: FONT.base, color: textSecondary, lineHeight: 1.7 }}>
                {mode.description}
            </div>
        </div>
    );
}