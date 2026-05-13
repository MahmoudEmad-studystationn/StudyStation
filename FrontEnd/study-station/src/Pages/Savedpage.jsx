import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Bookmark, BookmarkX, ExternalLink, FileText,
    BookOpen, StickyNote, Newspaper, GraduationCap,
    Inbox, Calendar, X
} from "lucide-react";
import { useThemeContext } from '../Components/Theme/ThemeContext';

// ─── Design tokens ────────────────────────────────────────────────────────────
const LIGHT = {
    navy: "#2C3E50", steel: "#8FB7CC", bg: "#F3F4F6",
    surface: "#ffffff", surface2: "#e8eaed", text: "#1a1a2e",
    muted: "#686868", border: "rgba(44,62,80,0.10)",
    cardBorder: "rgba(44,62,80,0.08)", accentSoft: "rgba(143,183,204,0.18)",
    shadowHover: "0 10px 36px rgba(44,62,80,0.13)",
};
const DARK = {
    navy: "#2C3E50", steel: "#8FB7CC", bg: "#171717",
    surface: "#1f1f1f", surface2: "#2a2a2a", text: "#f0f0f0",
    muted: "#9a9a9a", border: "rgba(255,255,255,0.07)",
    cardBorder: "rgba(255,255,255,0.06)", accentSoft: "rgba(143,183,204,0.10)",
    shadowHover: "0 10px 36px rgba(0,0,0,0.5)",
};

// ─── Badge config ─────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
    PDF: { icon: FileText, label: "PDF", light: { bg: "rgba(239,68,68,.10)", color: "#dc2626" }, dark: { bg: "rgba(239,68,68,.15)", color: "#f87171" } },
    Course: { icon: GraduationCap, label: "Course", light: { bg: "rgba(59,130,246,.12)", color: "#2563eb" }, dark: { bg: "rgba(59,130,246,.15)", color: "#60a5fa" } },
    Note: { icon: StickyNote, label: "Note", light: { bg: "rgba(245,158,11,.12)", color: "#d97706" }, dark: { bg: "rgba(245,158,11,.15)", color: "#fbbf24" } },
    Article: { icon: Newspaper, label: "Article", light: { bg: "rgba(16,185,129,.12)", color: "#059669" }, dark: { bg: "rgba(16,185,129,.15)", color: "#34d399" } },
    Resource: { icon: BookOpen, label: "Resource", light: { bg: "rgba(139,92,246,.12)", color: "#7c3aed" }, dark: { bg: "rgba(139,92,246,.15)", color: "#a78bfa" } },
};

const FILTERS = ["All", "PDF", "Course", "Note", "Article", "Resource"];

// ─── Dummy data ───────────────────────────────────────────────────────────────
const INITIAL_SAVED = [
    { id: 1, type: "Course", title: "Machine Learning Crash Course", desc: "Google's comprehensive ML course covering linear models, neural networks, and practical machine learning workflows.", savedAt: "2025-04-28", track: "AI / ML" },
    { id: 2, type: "PDF", title: "Clean Code — Robert C. Martin", desc: "A handbook of agile software craftsmanship covering naming, functions, comments, and emergent design principles.", savedAt: "2025-04-25", track: "Software" },
    { id: 3, type: "Article", title: "Understanding Transformers", desc: "A deep-dive explaining attention mechanisms and how modern large language models are built and trained.", savedAt: "2025-04-20", track: "AI / ML" },
    { id: 4, type: "Note", title: "System Design Cheatsheet", desc: "Personal notes covering load balancing, caching strategies, database sharding, and microservices patterns.", savedAt: "2025-04-18", track: "Backend" },
    { id: 5, type: "Resource", title: "Frontend Roadmap 2025", desc: "Step-by-step path from absolute beginner to job-ready frontend developer, curated by the community.", savedAt: "2025-04-15", track: "Frontend" },
    { id: 6, type: "Course", title: "Figma Masterclass", desc: "Learn Figma from scratch — components, auto-layout, prototyping, and scalable design systems.", savedAt: "2025-04-10", track: "UI/UX" },
    { id: 7, type: "PDF", title: "The Pragmatic Programmer", desc: "A timeless guide covering DRY principles, orthogonality, and the philosophy behind pragmatic software development.", savedAt: "2025-04-08", track: "Software" },
    { id: 8, type: "Article", title: "UX Research Methods Overview", desc: "Guide to user interviews, usability testing, and translating qualitative insights into actionable design decisions.", savedAt: "2025-04-02", track: "UI/UX" },
    { id: 9, type: "Note", title: "Async/Await Patterns in JS", desc: "Personal notes on promise chaining, error handling, parallel execution, and common async pitfalls.", savedAt: "2025-03-28", track: "Frontend" },
];

function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard({ t }) {
    return (
        <div style={{
            background: t.surface, border: `1px solid ${t.cardBorder}`,
            borderRadius: 14, padding: "1.1rem", overflow: "hidden",
        }}>
            {[60, 90, 70, 50].map((w, i) => (
                <div key={i} style={{
                    height: i === 0 ? 18 : i === 3 ? 16 : 14, borderRadius: 6,
                    background: t.surface2, width: `${w}%`, marginBottom: i < 3 ? 10 : 0,
                    animation: "shimmer 1.5s ease-in-out infinite",
                }} />
            ))}
        </div>
    );
}

// ─── Saved Card ───────────────────────────────────────────────────────────────
function SavedCard({ item, dark, onRemove }) {
    const t = dark ? DARK : LIGHT;
    const cfg = TYPE_CONFIG[item.type];
    const Icon = cfg.icon;
    const badge = dark ? cfg.dark : cfg.light;
    const [hovered, setHovered] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93 }}
            transition={{ duration: 0.25 }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            style={{
                background: t.surface,
                border: `1px solid ${hovered ? "rgba(143,183,204,0.4)" : t.cardBorder}`,
                borderRadius: 14, padding: "1.1rem", position: "relative", overflow: "hidden",
                boxShadow: hovered ? t.shadowHover : "none",
                transform: hovered ? "translateY(-3px)" : "translateY(0)",
                transition: "all 0.25s",
                cursor: "default",
            }}
        >
            {/* top accent bar */}
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                background: `linear-gradient(90deg, ${t.navy}, ${t.steel})`,
                opacity: hovered ? 1 : 0, transition: "opacity .2s",
            }} />

            {/* badge row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: ".65rem" }}>
                <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "3px 9px", borderRadius: 999, fontSize: ".68rem", fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: ".05em",
                    background: badge.bg, color: badge.color,
                }}>
                    <Icon size={10} strokeWidth={2.5} /> {cfg.label}
                </span>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onRemove(item.id)}
                    title="Remove from saved"
                    style={{
                        background: "transparent", border: "none", cursor: "pointer",
                        color: t.muted, display: "flex", alignItems: "center", padding: 3,
                        borderRadius: 6, transition: "color .2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                    onMouseLeave={e => e.currentTarget.style.color = t.muted}
                >
                    <BookmarkX size={15} />
                </motion.button>
            </div>

            {/* title */}
            <div style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: ".9rem",
                color: t.text, marginBottom: ".35rem", lineHeight: 1.3,
            }}>{item.title}</div>

            {/* desc */}
            <div style={{
                fontSize: ".8rem", color: t.muted, lineHeight: 1.55, marginBottom: ".9rem",
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>{item.desc}</div>

            {/* footer */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: t.muted, fontSize: ".72rem" }}>
                    <Calendar size={11} />
                    <span>Saved {formatDate(item.savedAt)}</span>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "5px 12px", borderRadius: 8, border: "none",
                        background: hovered ? t.navy : t.surface2,
                        color: hovered ? "white" : t.muted,
                        fontSize: ".75rem", fontWeight: 500, cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif", transition: "all .2s",
                    }}
                >
                    <ExternalLink size={11} /> Open
                </motion.button>
            </div>
        </motion.div>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ t, query }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: "center", padding: "5rem 2rem" }}
        >
            <div style={{
                width: 72, height: 72, borderRadius: 20, margin: "0 auto 1.25rem",
                background: t.accentSoft, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                <Inbox size={30} color={t.steel} />
            </div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.05rem", color: t.text, marginBottom: ".5rem" }}>
                {query ? "No matches found" : "Nothing saved yet"}
            </div>
            <div style={{ fontSize: ".85rem", color: t.muted, maxWidth: 280, margin: "0 auto" }}>
                {query
                    ? `No saved items match "${query}". Try a different search.`
                    : "Browse the Library and save resources to access them here."}
            </div>
        </motion.div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SavedPage() {
    const { isDarkMode } = useThemeContext();
    const dark = isDarkMode;

    const [query, setQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [items, setItems] = useState(null); // null = loading

    const t = dark ? DARK : LIGHT;

    // Simulate skeleton loading
    useEffect(() => {
        const timer = setTimeout(() => setItems(INITIAL_SAVED), 1200);
        return () => clearTimeout(timer);
    }, []);

    const filtered = (items || []).filter(item => {
        const matchType = activeFilter === "All" || item.type === activeFilter;
        const q = query.toLowerCase();
        const matchQ = !q || item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
        return matchType && matchQ;
    });

    const handleRemove = (id) => {
        setTimeout(() => {
            setItems(prev => prev.filter(i => i.id !== id));
        }, 300);
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
                @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:1} }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(143,183,204,.3); border-radius: 3px; }
            `}</style>

            {/* TOP NAV BAR */}
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
                    gap: 10,
                }}>
                    <button
                        onClick={() => window.history.back()}
                        style={{
                            background: "transparent", border: `1px solid ${t.border}`,
                            borderRadius: 8, padding: "6px 10px", cursor: "pointer",
                            color: t.muted, display: "flex", alignItems: "center",
                            marginRight: 4, transition: "all .2s",
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 15, height: 15 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                    </button>
                    <Bookmark size={17} color={t.steel} strokeWidth={2.2} />
                    <span style={{
                        fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: ".95rem", color: t.text,
                    }}>Saved</span>
                    {items && (
                        <span style={{
                            background: t.accentSoft, color: t.steel,
                            fontSize: ".7rem", fontWeight: 600,
                            padding: "2px 8px", borderRadius: 999,
                        }}>{items.length}</span>
                    )}
                </div>
            </div>

            {/* FILTER BAR */}
            <div style={{
                maxWidth: 960,
                margin: "0 auto",
                padding: "1.25rem 2.5rem",
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
            }}>
                {/* search */}
                <div style={{ flex: 1, minWidth: 180, position: "relative" }}>
                    <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: t.muted, pointerEvents: "none" }} />
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search saved items…"
                        style={{
                            width: "100%", padding: "9px 36px 9px 34px",
                            background: t.surface, border: `1px solid ${query ? t.steel : t.border}`,
                            borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: ".875rem",
                            color: t.text, outline: "none",
                            boxShadow: query ? `0 0 0 3px rgba(143,183,204,.15)` : "none",
                            transition: "all .2s",
                        }}
                    />
                    {query && (
                        <button
                            onClick={() => setQuery("")}
                            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: t.muted, display: "flex" }}
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>

                {/* type filters */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {FILTERS.map(f => {
                        const active = activeFilter === f;
                        return (
                            <button key={f} onClick={() => setActiveFilter(f)} style={{
                                padding: "6px 13px", borderRadius: 999, fontSize: ".78rem", fontWeight: 500,
                                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                                border: `1px solid ${active ? (dark ? t.steel : t.navy) : t.border}`,
                                background: active ? (dark ? t.steel : t.navy) : t.surface,
                                color: active ? (dark ? t.navy : "white") : t.muted,
                                transition: "all .2s",
                            }}>{f}</button>
                        );
                    })}
                </div>
            </div>

            {/* GRID */}
            <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 2.5rem 4rem" }}>
                {/* count */}
                {items && (
                    <div style={{ fontSize: ".75rem", color: t.muted, marginBottom: "1rem", fontWeight: 500 }}>
                        {filtered.length} item{filtered.length !== 1 ? "s" : ""}
                        {activeFilter !== "All" ? ` · ${activeFilter}` : ""}
                        {query ? ` matching "${query}"` : ""}
                    </div>
                )}

                {/* Skeleton loading */}
                {!items && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 14 }}>
                        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} t={t} />)}
                    </div>
                )}

                {/* Empty state */}
                {items && filtered.length === 0 && <EmptyState t={t} query={query} />}

                {/* Cards */}
                {items && filtered.length > 0 && (
                    <motion.div layout style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 14 }}>
                        <AnimatePresence>
                            {filtered.map(item => (
                                <SavedCard key={item.id} item={item} dark={dark} onRemove={handleRemove} />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
}