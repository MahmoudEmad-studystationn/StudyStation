import { useThemeContext } from "../Theme/ThemeContext";

const AV_PALETTE = [
    { background: "linear-gradient(135deg,#2C3E50,#3D718D)" },
    { background: "linear-gradient(135deg,#3D718D,#658FA5)" },
    { background: "linear-gradient(135deg,#658FA5,#8FB7CC)" },
    { background: "linear-gradient(135deg,#8FB7CC,#c2d9e8)" },
    { background: "linear-gradient(135deg,#2C3E50,#658FA5)" },
];

const getAvStyle = i => AV_PALETTE[i % AV_PALETTE.length];
const getInitials = (name = "") =>
    name.split(" ").filter(Boolean).map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";

export default function MembersPanel({ members = [], onlineCount = 0 }) {
    const { isDarkMode } = useThemeContext();

    const border = isDarkMode ? "rgba(255,255,255,0.07)" : "rgba(44,62,80,0.08)";
    const textPrimary = isDarkMode ? "#E5E7EB" : "#1C2B38";
    const muted = isDarkMode ? "#8A9BAA" : "#8A9BAA";
    const surface3 = isDarkMode ? "#252525" : "#f5f6f8";

    return (
        <div style={{
            padding: "1rem 1.25rem",
            borderBottom: `1px solid ${border}`,
            maxHeight: 180,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            flexShrink: 0,
        }}>
            <div style={{
                fontSize: ".68rem", fontWeight: 800, letterSpacing: ".06em",
                textTransform: "uppercase", color: muted, marginBottom: ".75rem",
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Members
                </span>
                <span style={{
                    fontSize: ".65rem", fontWeight: 700, padding: "2px 8px",
                    borderRadius: 999, background: "rgba(52,211,153,.1)",
                    color: "#34d399", border: "1px solid rgba(52,211,153,.2)",
                }}>
                    {onlineCount || members.length} online
                </span>
            </div>

            {members.length === 0 ? (
                <div style={{ fontSize: ".75rem", color: muted, fontStyle: "italic", opacity: 0.7 }}>
                    No members in this room yet
                </div>
            ) : (
                <div style={{
                    overflowY: "auto", display: "flex", flexDirection: "column",
                    gap: 6, scrollbarWidth: "thin",
                }}>
                    {members.map((m, i) => {
                        const name = m.userName || m.name || "Unknown";
                        return (
                            <div key={m.id ?? i} style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "6px 8px", borderRadius: 10, background: surface3,
                            }}>
                                <div style={{
                                    width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: ".58rem", fontWeight: 800, color: "#fff",
                                    ...getAvStyle(i),
                                }}>
                                    {getInitials(name)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: ".78rem", fontWeight: 700, color: textPrimary,
                                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                    }}>
                                        {name}
                                    </div>
                                </div>
                                <span style={{
                                    width: 7, height: 7, borderRadius: "50%",
                                    background: "#34d399", flexShrink: 0,
                                }} title="Online" />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
