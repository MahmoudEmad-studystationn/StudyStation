import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft, faBars, faRobot, faCircle, faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { MODE_CONFIG, C, FONT } from "./constants";

export default function ChatHeader({
    context, onBack, onToggleSidebar, onNewChat,
    textPrimary, textSecondary, muted, borderColor, cardBg, cardShadow, iconBg,
}) {
    const mode = MODE_CONFIG[context] || MODE_CONFIG.general;

    return (
        <header style={{
            height: 60, background: cardBg,
            borderBottom: `1px solid ${borderColor}`,
            boxShadow: cardShadow,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 1.25rem", flexShrink: 0, zIndex: 10,
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                    onClick={onBack}
                    style={{
                        background: "none", border: `1px solid ${borderColor}`, borderRadius: 10,
                        cursor: "pointer", color: textSecondary,
                        width: 38, height: 38, display: "flex", alignItems: "center",
                        justifyContent: "center", transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = iconBg; e.currentTarget.style.color = textPrimary; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = textSecondary; }}
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                </button>

                <button
                    onClick={onToggleSidebar}
                    style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: textSecondary, width: 38, height: 38,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        borderRadius: 10, transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = iconBg; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
                >
                    <FontAwesomeIcon icon={faBars} />
                </button>

                <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `linear-gradient(135deg,${C.navy},${C.ocean})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 16,
                }}>
                    <FontAwesomeIcon icon={mode.icon} />
                </div>

                <div>
                    <div style={{ fontSize: FONT.md, fontWeight: 700, color: textPrimary }}>
                        {mode.label}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <FontAwesomeIcon icon={faCircle} style={{ fontSize: 8, color: "#34d399" }} />
                        <span style={{ fontSize: FONT.xs, color: muted }}>Study Station AI</span>
                    </div>
                </div>
            </div>

            <button
                onClick={onNewChat}
                title="New chat"
                style={{
                    width: 38, height: 38, borderRadius: 10,
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
    );
}
