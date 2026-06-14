import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CONTEXT_KEYS, MODE_CONFIG, C, FONT } from "./constants";

export default function ModeSelector({ context, onContextChange, isDark, borderColor, textPrimary, muted }) {
    return (
        <div style={{ padding: "12px 10px 8px", borderBottom: `1px solid ${borderColor}` }}>
            <div style={{
                fontSize: 10, fontWeight: 700, color: muted,
                textTransform: "uppercase", letterSpacing: "0.08em",
                padding: "0 6px 8px",
            }}>
                AI Tools
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {CONTEXT_KEYS.map(key => {
                    const mode = MODE_CONFIG[key];
                    const active = context === key;
                    return (
                        <button
                            key={key}
                            onClick={() => onContextChange(key)}
                            style={{
                                width: "100%", padding: "10px 12px", borderRadius: 11,
                                border: `1.5px solid ${active ? mode.color : "transparent"}`,
                                background: active
                                    ? (isDark ? "rgba(78,135,168,0.18)" : "rgba(78,135,168,0.1)")
                                    : "transparent",
                                color: active ? (isDark ? "#fff" : C.navy) : textPrimary,
                                fontSize: FONT.sm, fontWeight: active ? 700 : 500,
                                cursor: "pointer", fontFamily: "inherit",
                                display: "flex", alignItems: "center", gap: 10,
                                transition: "all 0.15s", textAlign: "left",
                            }}
                            onMouseEnter={e => {
                                if (!active) e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "rgba(44,62,80,0.04)";
                            }}
                            onMouseLeave={e => {
                                if (!active) e.currentTarget.style.background = "transparent";
                            }}
                        >
                            <span style={{
                                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                                background: active ? mode.color : (isDark ? "#333" : "#eef1f4"),
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: active ? "#fff" : muted,
                                fontSize: 13, transition: "all 0.15s",
                            }}>
                                <FontAwesomeIcon icon={mode.icon} />
                            </span>
                            {mode.shortLabel}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
