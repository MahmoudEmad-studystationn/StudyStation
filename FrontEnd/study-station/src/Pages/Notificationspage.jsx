import { useState, useEffect, useCallback, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Heart, MessageCircle, CornerDownRight, Check, CheckCheck, Loader2 } from "lucide-react";
import { useThemeContext } from '../Components/Theme/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { createNotificationsService } from "../Components/Services/Notificationsservice";

// ─── Design tokens ────────────────────────────────────────────────────────────
const LIGHT = {
    navy: "#2C3E50", steel: "#8FB7CC", bg: "#F3F4F6",
    surface: "#ffffff", surface2: "#e8eaed", text: "#1a1a2e",
    muted: "#686868", border: "rgba(44,62,80,0.10)",
    cardBorder: "rgba(44,62,80,0.08)", accentSoft: "rgba(143,183,204,0.18)",
    unreadBg: "rgba(143,183,204,0.10)", unreadBorder: "rgba(143,183,204,0.35)",
    error: "#fee2e2", errorText: "#ef4444",
};
const DARK = {
    navy: "#2C3E50", steel: "#8FB7CC", bg: "#171717",
    surface: "#1f1f1f", surface2: "#2a2a2a", text: "#f0f0f0",
    muted: "#9a9a9a", border: "rgba(255,255,255,0.07)",
    cardBorder: "rgba(255,255,255,0.06)", accentSoft: "rgba(143,183,204,0.10)",
    unreadBg: "rgba(143,183,204,0.07)", unreadBorder: "rgba(143,183,204,0.22)",
    error: "rgba(239,68,68,0.15)", errorText: "#f87171",
};

// ─── Notification type config ─────────────────────────────────────────────────
const TYPE_CONFIG = {
    like: {
        icon: Heart,
        iconBg: "rgba(239,68,68,.12)",
        iconColor: "#ef4444",
    },
    comment: {
        icon: MessageCircle,
        label: "commented on your post",
        iconBg: "rgba(59,130,246,.12)",
        iconColor: "#3b82f6",
    },
    system: {
        icon: CornerDownRight,
        label: "reposted your post",
        iconBg: "rgba(16,185,129,.12)",
        iconColor: "#10b981",
    },
};

function getLabel(notif) {
    if (notif.type === "like") return "liked your post";
    if (notif.type === "comment") return "commented on your post";
    if (notif.type === "system") return "reposted your post";
    return "interacted with your content";
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ initials, size = 40 }) {
    const colors = [
        ["#2C3E50", "#8FB7CC"], ["#1a1a2e", "#60a5fa"], ["#1e3a2f", "#34d399"],
        ["#2d1b44", "#a78bfa"], ["#3b1515", "#f87171"], ["#1a2d3b", "#38bdf8"],
    ];
    const safeInitials = (initials || "??").slice(0, 2);
    const idx = (safeInitials.charCodeAt(0) + safeInitials.charCodeAt(1)) % colors.length;
    const [bg, fg] = colors[idx];
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%", flexShrink: 0,
            background: bg, color: fg, display: "flex", alignItems: "center",
            justifyContent: "center", fontFamily: "'Syne', sans-serif",
            fontWeight: 700, fontSize: size * 0.36,
        }}>
            {safeInitials}
        </div>
    );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function SkeletonItem({ dark }) {
    const t = dark ? DARK : LIGHT;
    return (
        <div style={{
            display: "flex", alignItems: "flex-start", gap: "1rem",
            padding: "1rem 1.25rem", borderRadius: 14,
        }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: t.surface2, flexShrink: 0, animation: "pulse 1.5s infinite" }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ height: 13, width: "60%", borderRadius: 6, background: t.surface2, animation: "pulse 1.5s infinite" }} />
                <div style={{ height: 11, width: "35%", borderRadius: 6, background: t.surface2, animation: "pulse 1.5s infinite" }} />
            </div>
        </div>
    );
}

// ─── Notification Item ────────────────────────────────────────────────────────
function NotifItem({ notif, dark, onMarkRead, onDelete }) {
    const t = dark ? DARK : LIGHT;
    const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.like;
    const Icon = cfg.icon;
    const [hovered, setHovered] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const handleMarkRead = async () => {
        setActionLoading(true);
        await onMarkRead(notif.id);
        setActionLoading(false);
    };

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
                opacity: actionLoading ? 0.6 : 1,
            }}
        >
            {!notif.read && (
                <div style={{
                    position: "absolute", left: -5, top: "50%", transform: "translateY(-50%)",
                    width: 8, height: 8, borderRadius: "50%", background: t.steel,
                    boxShadow: `0 0 0 3px ${dark ? "rgba(143,183,204,.15)" : "rgba(143,183,204,.25)"}`,
                }} />
            )}

            <Avatar initials={notif.senderName?.slice(0, 2) ?? "??"} size={42} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: ".875rem", color: t.text, lineHeight: 1.5, marginBottom: ".25rem" }}>
                    <span style={{ fontWeight: 600 }}>{notif.user || notif.userName}</span>
                    {" "}
                    <span style={{ color: t.muted }}>{getLabel(notif)}</span>
                    {" "}
                    <span style={{ fontWeight: 500, color: t.steel, fontSize: ".82rem" }}>
                        "{notif.postTitle || notif.title}"
                    </span>
                </div>
                <div style={{ fontSize: ".75rem", color: t.muted }}>{notif.time || notif.createdAt}</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                <div style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: cfg.iconBg, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Icon size={13} color={cfg.iconColor} strokeWidth={2.5} />
                </div>

                <AnimatePresence>
                    {hovered && !actionLoading && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ duration: 0.15 }}
                            style={{ display: "flex", gap: 4 }}
                        >
                            {!notif.read && (
                                <button
                                    onClick={handleMarkRead}
                                    title="Mark as read"
                                    style={{
                                        background: t.surface2, border: "none", cursor: "pointer",
                                        color: t.muted, display: "flex", alignItems: "center", justifyContent: "center",
                                        width: 28, height: 28, borderRadius: "50%", transition: "all .15s",
                                    }}
                                >
                                    <Check size={13} />
                                </button>
                            )}
                            <button
                                onClick={() => onDelete(notif.id)}
                                title="Delete"
                                style={{
                                    background: "rgba(239,68,68,.1)", border: "none", cursor: "pointer",
                                    color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center",
                                    width: 28, height: 28, borderRadius: "50%", transition: "all .15s",
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 12, height: 12 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </motion.div>
                    )}
                    {actionLoading && (
                        <Loader2 size={16} color={t.muted} style={{ animation: "spin 1s linear infinite" }} />
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ t }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ textAlign: "center", padding: "6rem 2rem" }}
        >
            <div style={{
                width: 52, height: 52, borderRadius: "50%", margin: "0 auto 0.875rem",
                background: t.accentSoft, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                <Bell size={20} color={t.steel} strokeWidth={1.8} />
            </div>
            <div style={{ fontSize: ".875rem", color: t.muted }}>
                No notifications yet
            </div>
        </motion.div>
    );
}

// ─── Error Banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ message, dark, onRetry }) {
    const t = dark ? DARK : LIGHT;
    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: t.error, color: t.errorText,
                padding: "0.75rem 1.25rem", borderRadius: 10, marginBottom: "1rem",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                fontSize: ".85rem", fontWeight: 500,
            }}
        >
            <span>{message}</span>
            <button
                onClick={onRetry}
                style={{
                    background: "transparent", border: `1px solid ${t.errorText}`,
                    color: t.errorText, borderRadius: 6, padding: "3px 10px",
                    cursor: "pointer", fontSize: ".78rem", fontFamily: "'DM Sans', sans-serif",
                }}
            >
                Retry
            </button>
        </motion.div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
    const { isDarkMode } = useThemeContext();
    const { userData } = useContext(AuthContext);
    const token = localStorage.getItem("accessToken");
    const api = createNotificationsService(token);

    const dark = isDarkMode;
    const t = dark ? DARK : LIGHT;

    const [notifs, setNotifs] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [markingAll, setMarkingAll] = useState(false);

    const fetchNotifs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getNotifications();

            console.log("API response:", data);

            const list = Array.isArray(data?.notifications)
                ? data.notifications
                : Array.isArray(data)
                    ? data
                    : [];

            const TYPE_MAP = { 1: "like", 2: "comment", 3: "system" };

            const normalized = list.map(n => ({
                ...n,
                id: n.id,
                read: n.isRead,
                user: n.senderName,
                postTitle: n.targetTitle,
                type: TYPE_MAP[n.type] ?? "like",
                createdAt: new Date(n.createdAt).toLocaleString("en-US", {
                    month: "short", day: "numeric",
                    hour: "numeric", minute: "2-digit",
                    hour12: true
                }),
            }));

            setNotifs(normalized);
        } catch (err) {
            console.error("Notifications error:", err);
            setError("Couldn't load notifications. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

    const unreadCount = notifs.filter(n => !n.read).length;
    const displayed = filter === "unread" ? notifs.filter(n => !n.read) : notifs;

    const markRead = async (id) => {
        setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        try {
            await api.markNotificationRead(id);
        } catch {
            setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
        }
    };

    const markAllRead = async () => {
        setMarkingAll(true);
        const previous = notifs;
        setNotifs(prev => prev.map(n => ({ ...n, read: true })));
        try {
            await api.markAllRead();
        } catch {
            setNotifs(previous);
            setError("Failed to mark all as read.");
        } finally {
            setMarkingAll(false);
        }
    };

    const deleteNotif = async (id) => {
        const previous = notifs;
        setNotifs(prev => prev.filter(n => n.id !== id));
        try {
            await api.deleteNotification(id);
        } catch {
            setNotifs(previous);
            setError("Failed to delete notification.");
        }
    };

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
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
                @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
            `}</style>

            {/* ── NAVBAR ── */}
            <div style={{
                background: t.surface,
                borderBottom: `1px solid ${t.border}`,
                position: "sticky", top: 0, zIndex: 10,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
            }}>
                <div style={{
                    maxWidth: 960, margin: "0 auto", padding: "0 2rem",
                    height: 52, display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                }}>
                    {/* left side */}
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        {/* back button — text link style, no border box */}
                        <button
                            onClick={() => window.history.back()}
                            style={{
                                background: "transparent", border: "none",
                                cursor: "pointer", color: t.muted,
                                display: "flex", alignItems: "center", gap: 5,
                                fontSize: ".8rem", fontFamily: "'DM Sans', sans-serif",
                                padding: 0, transition: "color .2s",
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = t.text}
                            onMouseLeave={e => e.currentTarget.style.color = t.muted}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 13, height: 13 }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            Back
                        </button>

                        {/* divider */}
                        <div style={{ width: 1, height: 16, background: t.border }} />

                        {/* title */}
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <Bell size={14} color={t.steel} strokeWidth={2} />
                            <span style={{
                                fontSize: ".875rem", fontWeight: 600,
                                color: t.text, fontFamily: "'Syne', sans-serif",
                                letterSpacing: "-.01em",
                            }}>
                                Notifications
                            </span>
                            {unreadCount > 0 && (
                                <span style={{
                                    background: t.steel, color: dark ? t.navy : "#fff",
                                    fontSize: ".68rem", fontWeight: 700,
                                    borderRadius: 99, padding: "1px 7px",
                                    lineHeight: "18px", display: "inline-block",
                                }}>
                                    {unreadCount}
                                </span>
                            )}
                        </div>

                        {/* filter pills */}
                        <div style={{ display: "flex", gap: 4, marginLeft: 4 }}>
                            {[["all", "All"], ["unread", "Unread"]].map(([val, label]) => (
                                <button
                                    key={val}
                                    onClick={() => setFilter(val)}
                                    style={{
                                        padding: "4px 11px", borderRadius: 999,
                                        fontSize: ".75rem", fontWeight: 500,
                                        cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                                        border: `1px solid ${filter === val ? t.steel : t.border}`,
                                        background: filter === val
                                            ? (dark ? "rgba(143,183,204,0.18)" : "rgba(143,183,204,0.12)")
                                            : "transparent",
                                        color: filter === val ? t.steel : t.muted,
                                        transition: "all .18s",
                                    }}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* right side — mark all read */}
                    {unreadCount > 0 && (
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={markAllRead}
                            disabled={markingAll}
                            style={{
                                display: "inline-flex", alignItems: "center", gap: 5,
                                background: "transparent", border: "none",
                                cursor: markingAll ? "not-allowed" : "pointer",
                                color: t.steel, fontSize: ".78rem",
                                fontFamily: "'DM Sans', sans-serif",
                                fontWeight: 500, opacity: markingAll ? 0.5 : 1,
                                transition: "opacity .2s", padding: 0,
                            }}
                        >
                            {markingAll
                                ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
                                : <CheckCheck size={13} />
                            }
                            Mark all read
                        </motion.button>
                    )}
                </div>
            </div>

            {/* ── LIST ── */}
            <div style={{ maxWidth: 960, margin: "0 auto", padding: ".75rem 2rem 4rem" }}>
                {error && <ErrorBanner message={error} dark={dark} onRetry={fetchNotifs} />}

                {loading && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: "0.25rem" }}>
                        {[1, 2, 3, 4, 5].map(i => <SkeletonItem key={i} dark={dark} />)}
                    </div>
                )}

                {!loading && (
                    displayed.length === 0
                        ? <EmptyState t={t} />
                        : (
                            <motion.div layout style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <AnimatePresence>
                                    {displayed.map(n => (
                                        <NotifItem
                                            key={n.id}
                                            notif={n}
                                            dark={dark}
                                            onMarkRead={markRead}
                                            onDelete={deleteNotif}
                                        />
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        )
                )}
            </div>
        </div>
    );
}