import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Bookmark, BookmarkX, ExternalLink,
    FileText, BookOpen, StickyNote, Newspaper,
    GraduationCap, Inbox, Calendar, X, Loader2
} from "lucide-react";
import { useThemeContext } from '../Components/Theme/ThemeContext';
import { getSavedItems, deleteSavedItem } from "../Components/Services/Saveditemsservice";

// ─── Design tokens (same as NotificationsPage) ────────────────────────────────
const LIGHT = {
    navy: "#2C3E50", steel: "#8FB7CC", bg: "#F3F4F6",
    surface: "#ffffff", surface2: "#e8eaed", text: "#1a1a2e",
    muted: "#686868", border: "rgba(44,62,80,0.10)",
    cardBorder: "rgba(44,62,80,0.08)", accentSoft: "rgba(143,183,204,0.18)",
    error: "#fee2e2", errorText: "#ef4444",
};
const DARK = {
    navy: "#2C3E50", steel: "#8FB7CC", bg: "#171717",
    surface: "#1f1f1f", surface2: "#2a2a2a", text: "#f0f0f0",
    muted: "#9a9a9a", border: "rgba(255,255,255,0.07)",
    cardBorder: "rgba(255,255,255,0.06)", accentSoft: "rgba(143,183,204,0.10)",
    error: "rgba(239,68,68,0.15)", errorText: "#f87171",
};

// ─── Badge config ─────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
    PDF:      { icon: FileText,      label: "PDF",      light: { bg: "rgba(239,68,68,.10)",   color: "#dc2626" }, dark: { bg: "rgba(239,68,68,.15)",   color: "#f87171" } },
    Course:   { icon: GraduationCap, label: "Course",   light: { bg: "rgba(59,130,246,.12)",  color: "#2563eb" }, dark: { bg: "rgba(59,130,246,.15)",  color: "#60a5fa" } },
    Note:     { icon: StickyNote,    label: "Note",     light: { bg: "rgba(245,158,11,.12)",  color: "#d97706" }, dark: { bg: "rgba(245,158,11,.15)",  color: "#fbbf24" } },
    Article:  { icon: Newspaper,     label: "Article",  light: { bg: "rgba(16,185,129,.12)",  color: "#059669" }, dark: { bg: "rgba(16,185,129,.15)",  color: "#34d399" } },
    Resource: { icon: BookOpen,      label: "Resource", light: { bg: "rgba(139,92,246,.12)",  color: "#7c3aed" }, dark: { bg: "rgba(139,92,246,.15)",  color: "#a78bfa" } },
};

const FILTERS = ["All", "PDF", "Course", "Note", "Article", "Resource"];

function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function SkeletonItem({ dark }) {
    const t = dark ? DARK : LIGHT;
    return (
        <div style={{
            display: "flex", alignItems: "flex-start", gap: "1rem",
            padding: "1rem 1.25rem", borderRadius: 14,
        }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: t.surface2, flexShrink: 0, animation: "pulse 1.5s infinite" }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ height: 13, width: "55%", borderRadius: 6, background: t.surface2, animation: "pulse 1.5s infinite" }} />
                <div style={{ height: 11, width: "80%", borderRadius: 6, background: t.surface2, animation: "pulse 1.5s infinite" }} />
                <div style={{ height: 11, width: "40%", borderRadius: 6, background: t.surface2, animation: "pulse 1.5s infinite" }} />
            </div>
        </div>
    );
}

// ─── Saved Item Row ───────────────────────────────────────────────────────────
function SavedItem({ item, dark, onRemove }) {
    const t = dark ? DARK : LIGHT;
    const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.Resource;
    const Icon = cfg.icon;
    const badge = dark ? cfg.dark : cfg.light;
    const [hovered, setHovered] = useState(false);
    const [removing, setRemoving] = useState(false);

    const handleRemove = async (e) => {
        e.stopPropagation();
        setRemoving(true);
        await onRemove(item.id);
        setRemoving(false);
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
                background: hovered ? `rgba(143,183,204,0.04)` : "transparent",
                border: `1px solid ${hovered ? "rgba(143,183,204,0.2)" : "transparent"}`,
                transition: "all .22s", cursor: "default",
                opacity: removing ? 0.5 : 1,
            }}
        >
            {/* Icon box */}
            <div style={{
                width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                background: badge.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                <Icon size={18} color={badge.color} strokeWidth={2} />
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: ".875rem", fontWeight: 600, color: t.text, marginBottom: ".2rem", lineHeight: 1.35 }}>
                    {item.title}
                </div>
                <div style={{
                    fontSize: ".8rem", color: t.muted, lineHeight: 1.5, marginBottom: ".4rem",
                    display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                    {item.description || item.desc || "No description provided."}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "2px 8px", borderRadius: 999,
                        fontSize: ".68rem", fontWeight: 600,
                        textTransform: "uppercase", letterSpacing: ".05em",
                        background: badge.bg, color: badge.color,
                    }}>
                        <Icon size={9} strokeWidth={2.5} /> {cfg.label}
                    </span>
                    {(item.savedAt || item.createdAt) && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: ".72rem", color: t.muted }}>
                            <Calendar size={10} />
                            {formatDate(item.savedAt || item.createdAt)}
                        </span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                <AnimatePresence>
                    {hovered && !removing && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ duration: 0.15 }}
                            style={{ display: "flex", gap: 4 }}
                        >
                            <button
                                title="Open"
                                style={{
                                    background: t.surface2, border: "none", cursor: "pointer",
                                    color: t.muted, display: "flex", alignItems: "center", justifyContent: "center",
                                    width: 28, height: 28, borderRadius: "50%", transition: "all .15s",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = t.steel; e.currentTarget.style.color = "#fff"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = t.surface2; e.currentTarget.style.color = t.muted; }}
                            >
                                <ExternalLink size={12} />
                            </button>
                            <button
                                onClick={handleRemove}
                                title="Remove from saved"
                                style={{
                                    background: "rgba(239,68,68,.1)", border: "none", cursor: "pointer",
                                    color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center",
                                    width: 28, height: 28, borderRadius: "50%", transition: "all .15s",
                                }}
                            >
                                <BookmarkX size={12} />
                            </button>
                        </motion.div>
                    )}
                    {removing && (
                        <Loader2 size={16} color={t.muted} style={{ animation: "spin 1s linear infinite" }} />
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ t, query }) {
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
                <Inbox size={20} color={t.steel} strokeWidth={1.8} />
            </div>
            <div style={{ fontSize: ".875rem", color: t.muted }}>
                {query ? `No saved items match "${query}"` : "Nothing saved yet"}
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
                    cursor: "pointer", fontSize: ".78rem",
                }}
            >
                Retry
            </button>
        </motion.div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SavedPage() {
    const { isDarkMode } = useThemeContext();
    const dark = isDarkMode;
    const t = dark ? DARK : LIGHT;

    const [query, setQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [items, setItems] = useState(null);
    const [error, setError] = useState(null);

    const fetchItems = () => {
        setItems(null);
        setError(null);
        getSavedItems()
            .then(data => {
                const list = Array.isArray(data) ? data
                    : Array.isArray(data?.items) ? data.items
                    : Array.isArray(data?.data) ? data.data
                    : [];
                setItems(list);
            })
            .catch(err => {
                console.error(err);
                setError("Couldn't load saved items. Please try again.");
                setItems([]);
            });
    };

    useEffect(() => { fetchItems(); }, []);

    const filtered = (items || []).filter(item => {
        const matchType = activeFilter === "All" || item.type === activeFilter;
        const q = query.toLowerCase();
        const matchQ = !q
            || (item.title || "").toLowerCase().includes(q)
            || (item.description || item.desc || "").toLowerCase().includes(q);
        return matchType && matchQ;
    });

    const handleRemove = async (id) => {
        const previous = items;
        setItems(prev => prev.filter(i => i.id !== id));
        try {
            await deleteSavedItem(id);
        } catch (err) {
            console.error(err);
            setItems(previous);
            setError("Failed to remove item.");
        }
    };

    const loading = items === null;

    return (
        <div style={{
            fontFamily: "'DM Sans', sans-serif",
            background: t.bg, color: t.text,
            minHeight: "100vh", transition: "background .3s, color .3s",
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
                @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
            `}</style>

            {/* ── NAVBAR ── */}
            <div style={{
                background: t.surface, borderBottom: `1px solid ${t.border}`,
                position: "sticky", top: 0, zIndex: 10,
                backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            }}>
                <div style={{
                    maxWidth: 960, margin: "0 auto", padding: "0 2rem",
                    height: 52, display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                }}>
                    {/* left side */}
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        {/* back */}
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

                        <div style={{ width: 1, height: 16, background: t.border }} />

                        {/* title */}
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <Bookmark size={14} color={t.steel} strokeWidth={2} />
                            <span style={{
                                fontSize: ".875rem", fontWeight: 600, color: t.text,
                                fontFamily: "'Syne', sans-serif", letterSpacing: "-.01em",
                            }}>
                                Saved
                            </span>
                            {items && items.length > 0 && (
                                <span style={{
                                    background: t.steel, color: dark ? t.navy : "#fff",
                                    fontSize: ".68rem", fontWeight: 700,
                                    borderRadius: 99, padding: "1px 7px",
                                    lineHeight: "18px", display: "inline-block",
                                }}>
                                    {items.length}
                                </span>
                            )}
                        </div>

                        {/* filter pills */}
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginLeft: 4 }}>
                            {FILTERS.map(f => (
                                <button
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    style={{
                                        padding: "4px 11px", borderRadius: 999,
                                        fontSize: ".75rem", fontWeight: 500,
                                        cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                                        border: `1px solid ${activeFilter === f ? t.steel : t.border}`,
                                        background: activeFilter === f
                                            ? (dark ? "rgba(143,183,204,0.18)" : "rgba(143,183,204,0.12)")
                                            : "transparent",
                                        color: activeFilter === f ? t.steel : t.muted,
                                        transition: "all .18s",
                                    }}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* right side — search */}
                    <div style={{ position: "relative", width: 200 }}>
                        <Search size={13} style={{
                            position: "absolute", left: 10, top: "50%",
                            transform: "translateY(-50%)", color: t.muted, pointerEvents: "none",
                        }} />
                        <input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search saved…"
                            style={{
                                width: "100%", padding: "6px 28px 6px 30px",
                                background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                                border: `1px solid ${query ? t.steel : t.border}`,
                                borderRadius: 8, fontSize: ".8rem", color: t.text, outline: "none",
                                transition: "all .2s",
                            }}
                        />
                        {query && (
                            <button
                                onClick={() => setQuery("")}
                                style={{
                                    position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                                    background: "transparent", border: "none", cursor: "pointer", color: t.muted, display: "flex",
                                }}
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── LIST ── */}
            <div style={{ maxWidth: 960, margin: "0 auto", padding: ".75rem 2rem 4rem" }}>
                {/* count line */}
                {!loading && items && (
                    <div style={{ fontSize: ".72rem", color: t.muted, marginBottom: ".5rem", paddingLeft: "1.25rem", fontWeight: 500 }}>
                        {filtered.length} item{filtered.length !== 1 ? "s" : ""}
                        {activeFilter !== "All" ? ` · ${activeFilter}` : ""}
                        {query ? ` matching "${query}"` : ""}
                    </div>
                )}

                {error && <ErrorBanner message={error} dark={dark} onRetry={fetchItems} />}

                {loading && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: "0.25rem" }}>
                        {[1, 2, 3, 4, 5].map(i => <SkeletonItem key={i} dark={dark} />)}
                    </div>
                )}

                {!loading && (
                    filtered.length === 0
                        ? <EmptyState t={t} query={query} />
                        : (
                            <motion.div layout style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <AnimatePresence>
                                    {filtered.map(item => (
                                        <SavedItem
                                            key={item.id}
                                            item={item}
                                            dark={dark}
                                            onRemove={handleRemove}
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