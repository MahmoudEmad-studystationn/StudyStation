import { useState } from "react";
import { useThemeContext } from "../Theme/ThemeContext";
import SidebarDashboard from "./SidebarDashboard";
import TopbarDashboard from "./Topbardashboard";

// ── Initial Data ─────────────────────────────────────────────────────────────
const INITIAL_ITEMS = [
    { id: 1, preview: "This answer is completely wrong, stop spreading misinformation here...", user: "user_049", type: "Post", time: "10 min ago" },
    { id: 2, preview: 'Study room "Spam Zone" with no academic purpose detected.', user: "auto_flag", type: "Room", time: "42 min ago" },
    { id: 3, preview: "Buy followers here! DM me for the best prices available online...", user: "spammer99", type: "Post", time: "1 hr ago" },
    { id: 4, preview: "I hate this platform and everyone who uses it, absolute garbage.", user: "angry_usr", type: "Post", time: "2 hrs ago" },
    { id: 5, preview: 'Room "Cheat Hub" — sharing exam answers and unauthorized materials.', user: "anon_12x", type: "Room", time: "3 hrs ago" },
    { id: 6, preview: "Inappropriate profile picture reported by 3 users.", user: "user_077", type: "Post", time: "5 hrs ago" },
];

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconTrash = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ width: 12, height: 12, display: "inline", marginRight: 3 }}>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14H6L5 6" />
    </svg>
);

const IconShield = ({ size = 40 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        width={size} height={size}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

// ── ModerationPage ────────────────────────────────────────────────────────────
export default function ModerationPage() {
    const { isDarkMode } = useThemeContext();
    const [items, setItems] = useState(INITIAL_ITEMS);
    const [fadingId, setFadingId] = useState(null);

    const bgColor     = isDarkMode ? "#171717" : "#F3F4F6";
const surface     = isDarkMode ? "#2A2A2A" : "#ffffff";
const surface3    = isDarkMode ? "#363636" : "#eef1f4";
const border      = isDarkMode ? "#404040" : "rgba(44,62,80,0.08)";
const border2     = isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(44,62,80,0.05)";
const textPrimary = isDarkMode ? "#E0E0E0" : "#2f3b48";
const text2       = isDarkMode ? "#B0B0B0" : "#4A5568";
const muted       = isDarkMode ? "#B0B0B0" : "#6b6f76";
   const shadow = isDarkMode
    ? "0 8px 16px rgba(0,0,0,0.3)"
    : "0 8px 16px rgba(0,0,0,0.07)";
    const handleDelete = (id) => {
        setFadingId(id);
        setTimeout(() => {
            setItems(prev => prev.filter(m => m.id !== id));
            setFadingId(null);
        }, 250);
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
            `}</style>

            <SidebarDashboard />
            <TopbarDashboard breadcrumb="Moderation" />

            <main style={{
                marginLeft: 230,
                marginTop: 60,
                height: "calc(100vh - 60px)",
                overflowY: "auto",
                padding: "1.75rem",
                background: bgColor,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                WebkitFontSmoothing: "antialiased",
                color: textPrimary,
            }}>
                {/* Page Header */}
                <div style={{ marginBottom: "1.5rem" }}>
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: textPrimary, letterSpacing: "-.03em" }}>
                        Moderation
                    </div>
                    <div style={{ fontSize: ".8rem", color: muted, fontWeight: 500, marginTop: 3 }}>
                        Review and remove flagged content.
                    </div>
                </div>

                {/* Table Card */}
                <div style={{
                    background: surface,
                    border: `1px solid ${border}`,
                    borderRadius: 14,
                    boxShadow: shadow,
                    overflow: "hidden",
                }}>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".82rem", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                            <thead>
                                <tr style={{ background: surface3, borderBottom: `1px solid ${border}` }}>
                                    {["Content Preview", "User", "Type", "Reported", "Action"].map(h => (
                                        <th key={h} style={{
                                            padding: ".75rem 1rem", textAlign: "left",
                                            fontSize: ".68rem", fontWeight: 700, color: muted,
                                            textTransform: "uppercase", letterSpacing: ".06em", whiteSpace: "nowrap",
                                        }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: "3rem 1rem", textAlign: "center", color: muted }}>
                                            <IconShield />
                                            <p style={{ fontSize: ".85rem", fontWeight: 600, marginTop: ".75rem" }}>
                                                No flagged content — all clear!
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    items.map(item => (
                                        <tr
                                            key={item.id}
                                            style={{
                                                borderBottom: `1px solid ${border2}`,
                                                transition: "background .15s, opacity .25s",
                                                opacity: fadingId === item.id ? 0 : 1,
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = surface3}
                                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                        >
                                            {/* Content Preview */}
                                            <td style={{ padding: ".85rem 1rem", color: text2, verticalAlign: "middle" }}>
                                                <div style={{ maxWidth: 260, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                    {item.preview}
                                                </div>
                                            </td>

                                            {/* User */}
                                            <td style={{ padding: ".85rem 1rem", fontWeight: 700, color: textPrimary, fontSize: ".82rem", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                                                @{item.user}
                                            </td>

                                            {/* Type chip */}
                                            <td style={{ padding: ".85rem 1rem", verticalAlign: "middle" }}>
                                                <span style={{
                                                    display: "inline-flex", alignItems: "center", gap: 4,
                                                    padding: "3px 9px", borderRadius: 999,
                                                    fontSize: ".68rem", fontWeight: 700,
                                                    background: item.type === "Post" ? "rgba(61,113,141,.12)" : "rgba(101,143,165,.12)",
                                                    color: item.type === "Post"
                                                        ? (isDarkMode ? "#8FB7CC" : "#3D718D")
                                                        : (isDarkMode ? "#9dc4d4" : "#658FA5"),
                                                }}>
                                                    {item.type}
                                                </span>
                                            </td>

                                            {/* Time */}
                                            <td style={{ padding: ".85rem 1rem", color: muted, fontSize: ".75rem", whiteSpace: "nowrap", verticalAlign: "middle" }}>
                                                {item.time}
                                            </td>

                                            {/* Action */}
                                            <td style={{ padding: ".85rem 1rem", verticalAlign: "middle" }}>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    style={{
                                                        padding: "5px 11px", borderRadius: 8,
                                                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                                                        fontSize: ".72rem", fontWeight: 700, cursor: "pointer",
                                                        border: "1px solid rgba(248,113,113,.2)",
                                                        background: "rgba(248,113,113,.1)", color: "#dc2626",
                                                        transition: "all .2s", display: "inline-flex", alignItems: "center",
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,.2)"}
                                                    onMouseLeave={e => e.currentTarget.style.background = "rgba(248,113,113,.1)"}
                                                >
                                                    <IconTrash />
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </>
    );
}