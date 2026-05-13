import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Heart, MessageCircle, CornerDownRight, Check, CheckCheck, Inbox } from "lucide-react";
import { useThemeContext } from '../Components/Theme/ThemeContext';

// ─── Design tokens ────────────────────────────────────────────────────────────
const LIGHT = {
    navy: "#2C3E50", steel: "#8FB7CC", bg: "#F3F4F6",
    surface: "#ffffff", surface2: "#e8eaed", text: "#1a1a2e",
    muted: "#686868", border: "rgba(44,62,80,0.10)",
    cardBorder: "rgba(44,62,80,0.08)", accentSoft: "rgba(143,183,204,0.18)",
    unreadBg: "rgba(143,183,204,0.10)", unreadBorder: "rgba(143,183,204,0.35)",
};
const DARK = {
    navy: "#2C3E50", steel: "#8FB7CC", bg: "#171717",
    surface: "#1f1f1f", surface2: "#2a2a2a", text: "#f0f0f0",
    muted: "#9a9a9a", border: "rgba(255,255,255,0.07)",
    cardBorder: "rgba(255,255,255,0.06)", accentSoft: "rgba(143,183,204,0.10)",
    unreadBg: "rgba(143,183,204,0.07)", unreadBorder: "rgba(143,183,204,0.22)",
};

// ─── Notification type config ─────────────────────────────────────────────────
const TYPE_CONFIG = {
    like: {
        icon: Heart,
        label: "liked your post",
        iconBg: "rgba(239,68,68,.12)",
        iconColor: "#ef4444",
    },
    comment: {
        icon: MessageCircle,
        label: "commented on your post",
        iconBg: "rgba(59,130,246,.12)",
        iconColor: "#3b82f6",
    },
    reply: {
        icon: CornerDownRight,
        label: "replied to your comment",
        iconBg: "rgba(16,185,129,.12)",
        iconColor: "#10b981",
    },
};

// ─── Dummy data ───────────────────────────────────────────────────────────────
const DUMMY_NOTIFS = [
    { id: 1, type: "like", user: "Sara Ahmed", avatar: "SA", time: "2m ago", read: false, postTitle: "System Design Notes" },
    { id: 2, type: "comment", user: "Kareem Mostafa", avatar: "KM", time: "8m ago", read: false, postTitle: "Frontend Roadmap 2025" },
    { id: 3, type: "reply", user: "Nour El-Din", avatar: "NE", time: "15m ago", read: false, postTitle: "Async/Await Patterns" },
    { id: 4, type: "like", user: "Layla Hassan", avatar: "LH", time: "1h ago", read: false, postTitle: "Clean Code PDF Notes" },
    { id: 5, type: "comment", user: "Omar Khalid", avatar: "OK", time: "2h ago", read: true, postTitle: "Machine Learning Course" },
    { id: 6, type: "like", user: "Hana Farouk", avatar: "HF", time: "3h ago", read: true, postTitle: "UI/UX Resources List" },
    { id: 7, type: "reply", user: "Youssef Nabil", avatar: "YN", time: "5h ago", read: true, postTitle: "Figma Masterclass Notes" },
    { id: 8, type: "comment", user: "Rania Sobhy", avatar: "RS", time: "Yesterday", read: true, postTitle: "Cyber Security Roadmap" },
    { id: 9, type: "like", user: "Tarek El-Sayed", avatar: "TE", time: "2 days ago", read: true, postTitle: "Understanding Transformers" },
];

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ initials, size = 40 }) {
    const colors = [
        ["#2C3E50", "#8FB7CC"], ["#1a1a2e", "#60a5fa"], ["#1e3a2f", "#34d399"],
        ["#2d1b44", "#a78bfa"], ["#3b1515", "#f87171"], ["#1a2d3b", "#38bdf8"],
    ];
    const idx = (initials.charCodeAt(0) + initials.charCodeAt(1)) % colors.length;
    const [bg, fg] = colors[idx];
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%", flexShrink: 0,
            background: bg, color: fg, display: "flex", alignItems: "center",
            justifyContent: "center", fontFamily: "'Syne', sans-serif",
            fontWeight: 700, fontSize: size * 0.36,
        }}>
            {initials}
        </div>
    );
}

// ─── Notification Item ────────────────────────────────────────────────────────
function NotifItem({ notif, dark, onMarkRead }) {
    const t = dark ? DARK : LIGHT;
    const cfg = TYPE_CONFIG[notif.type];
    const Icon = cfg.icon;
    const [hovered, setHovered] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            style={{
                display: "flex", alignItems: "flex-start", gap: "1rem",
                padding: "1rem 1.25rem", borderRadius: 14, position: "relative",
                background: !notif.read
                    ? t.unreadBg
                    : hovered ? `rgba(143,183,204,0.04)` : "transparent",
                border: `1px solid ${!notif.read ? t.unreadBorder : "transparent"}`,
                transition: "all .22s", cursor: "default",
            }}
        >
            {/* unread dot */}
            {!notif.read && (
                <div style={{
                    position: "absolute", left: -5, top: "50%", transform: "translateY(-50%)",
                    width: 8, height: 8, borderRadius: "50%", background: t.steel,
                    boxShadow: `0 0 0 3px ${dark ? "rgba(143,183,204,.15)" : "rgba(143,183,204,.25)"}`,
                }} />
            )}

            {/* avatar */}
            <Avatar initials={notif.avatar} size={42} />

            {/* body */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: ".875rem", color: t.text, lineHeight: 1.45, marginBottom: ".25rem" }}>
                    <span style={{ fontWeight: 600 }}>{notif.user}</span>
                    {" "}
                    <span style={{ color: t.muted }}>{cfg.label}</span>
                    {" "}
                    <span style={{ fontWeight: 500, color: t.steel, fontSize: ".82rem" }}>
                        "{notif.postTitle}"
                    </span>
                </div>
                <div style={{ fontSize: ".75rem", color: t.muted }}>{notif.time}</div>
            </div>

            {/* type icon badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <div style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: cfg.iconBg, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Icon size={13} color={cfg.iconColor} strokeWidth={2.5} />
                </div>
                {!notif.read && hovered && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => onMarkRead(notif.id)}
                        title="Mark as read"
                        style={{
                            background: t.surface2, border: "none", cursor: "pointer",
                            color: t.muted, display: "flex", alignItems: "center", justifyContent: "center",
                            width: 28, height: 28, borderRadius: "50%", transition: "all .15s",
                        }}
                    >
                        <Check size={13} />
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ t }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "5rem 2rem" }}>
            <div style={{
                width: 68, height: 68, borderRadius: 18, margin: "0 auto 1.25rem",
                background: t.accentSoft, display: "flex", alignItems: "center", justifyContent: "center",
            }}>

                <Bell size={28} color={t.steel} />
            </div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1rem", color: t.text, marginBottom: ".5rem" }}>
                You're all caught up
            </div>
            <div style={{ fontSize: ".85rem", color: t.muted }}>No notifications yet. Check back later.</div>
        </motion.div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
    const { isDarkMode } = useThemeContext();
    const dark = isDarkMode;

    const [notifs, setNotifs] = useState(DUMMY_NOTIFS);
    const [filter, setFilter] = useState("all"); // "all" | "unread"

    const t = dark ? DARK : LIGHT;
    const unreadCount = notifs.filter(n => !n.read).length;

    const displayed = filter === "unread"
        ? notifs.filter(n => !n.read)
        : notifs;

    const markRead = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));

    return (
        <div style={{
            fontFamily: "'DM Sans', sans-serif",
            background: t.bg,
            color: t.text,
            minHeight: "100vh",
            transition: "background .3s, color .3s",
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
            `}</style>

            {/* TOOLBAR */}
            <div style={{
                background: t.surface,
                borderBottom: `1px solid ${t.border}`,
                position: "sticky", top: 0, zIndex: 10,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
            }}>
                <div style={{
                    maxWidth: 960,
                    margin: "0 auto",
                    padding: "0 2.5rem",
                    height: 56,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                }}>
                    {/* left — filter tabs */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button
                            onClick={() => window.history.back()}
                            style={{
                                background: "transparent", border: `1px solid ${t.border}`,
                                borderRadius: 8, padding: "6px 10px", cursor: "pointer",
                                color: t.muted, display: "flex", alignItems: "center",
                                transition: "all .2s",
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 15, height: 15 }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                        </button>
                        <Bell size={16} color={t.steel} strokeWidth={2.2} />
                        <div style={{ display: "flex", gap: 5 }}>
                            {[["all", "All"], ["unread", `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`]].map(([val, label]) => (
                                <button key={val} onClick={() => setFilter(val)} style={{
                                    padding: "5px 12px", borderRadius: 999, fontSize: ".78rem", fontWeight: 500,
                                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                                    border: `1px solid ${filter === val ? (dark ? t.steel : t.navy) : t.border}`,
                                    background: filter === val ? (dark ? t.steel : t.navy) : "transparent",
                                    color: filter === val ? (dark ? t.navy : "white") : t.muted,
                                    transition: "all .2s",
                                }}>{label}</button>
                            ))}
                        </div>
                    </div>

                    {/* right — mark all read */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {unreadCount > 0 && (
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                onClick={markAllRead}
                                style={{
                                    display: "inline-flex", alignItems: "center", gap: 5,
                                    background: "transparent", border: `1px solid ${t.border}`,
                                    borderRadius: 8, padding: "5px 11px", cursor: "pointer",
                                    color: t.muted, fontSize: ".75rem", fontFamily: "'DM Sans', sans-serif",
                                    transition: "all .2s", whiteSpace: "nowrap",
                                }}
                            >
                                <CheckCheck size={12} /> Mark all read
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>

            {/* NOTIFICATIONS LIST */}
            <div style={{ maxWidth: 960, margin: "0 auto", padding: ".5rem 2.5rem 4rem" }}>
                {displayed.length === 0
                    ? <EmptyState t={t} />
                    : (
                        <motion.div layout style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <AnimatePresence>
                                {displayed.map(n => (
                                    <NotifItem key={n.id} notif={n} dark={dark} onMarkRead={markRead} />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )
                }
            </div>
        </div>
    );
}