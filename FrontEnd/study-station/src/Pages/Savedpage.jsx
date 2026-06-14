import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Input } from "@heroui/react";
import {
    Search, Bookmark, BookmarkX, ExternalLink,
    FileText, BookOpen, StickyNote, Newspaper,
    GraduationCap, Inbox, Calendar, X, Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useThemeContext } from '../Components/Theme/ThemeContext';
import { getSavedItems, deleteSavedItem } from "../Components/Services/Saveditemsservice";

export const SearchIcon = (props) => (
    <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
        <path d="M11.5 21C16.7467 21 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        <path d="M22 22L20 20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
);

// ─── Design tokens ────────────────────────────────────────────────────────────
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
function normalizeType(raw) {
    const postsTypes = new Set(["note", "Note", "article", "Article", "post", "Post", 2, 3]);
    if (!raw && raw !== 0) return "Library";
    if (postsTypes.has(raw)) return "Posts";
    return "Library";
}

const FILTERS = ["All", "Posts", "Library"];

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
            display: "flex", alignItems: "center", gap: "1.25rem",
            padding: "1.25rem 1.75rem", borderRadius: 18,
            background: t.surface, marginBottom: 0,
        }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: t.surface2, flexShrink: 0, animation: "pulse 1.5s infinite" }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ height: 12, width: "30%", borderRadius: 6, background: t.surface2, animation: "pulse 1.5s infinite" }} />
                <div style={{ height: 14, width: "60%", borderRadius: 6, background: t.surface2, animation: "pulse 1.5s infinite" }} />
                <div style={{ height: 11, width: "80%", borderRadius: 6, background: t.surface2, animation: "pulse 1.5s infinite" }} />
            </div>
        </div>
    );
}

// ─── Saved Item Row ───────────────────────────────────────────────────────────
function SavedItemCard({ item, dark, onRemove }) {
    const t = dark ? DARK : LIGHT;
    const normalizedType = normalizeType(item.itemType);
    const TYPE_CONFIG = {
        Posts: { icon: Newspaper, label: "Post", light: { bg: "rgba(61,113,141,0.2)", color: "#8FB7CC" }, dark: { bg: "rgba(61,113,141,0.2)", color: "#8FB7CC" } },
        Library: { icon: BookOpen, label: "Library", light: { bg: "rgba(101,143,165,0.2)", color: "#658FA5" }, dark: { bg: "rgba(101,143,165,0.2)", color: "#658FA5" } },
    };
    const cfg = TYPE_CONFIG[normalizedType] || TYPE_CONFIG["Library"];
    const Icon = cfg.icon;
    const badge = dark ? cfg.dark : cfg.light;
    const [hovered, setHovered] = useState(false);
    const [removing, setRemoving] = useState(false);
    const navigate = useNavigate();

    const handleClick = () => {
        const id = item.originalItemId || item.id;
        const type = normalizeType(item.itemType);

        if (type === "Library") {
            navigate(`/library/${id}`);
        } else {
            const nameParts = (item.authorName || "").trim().split(" ");
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            navigate(`/posts/${id}`, {
                state: {
                    post: {
                        id: id,
                        title: item.title,
                        content: item.contentSnippet || "",
                        createdAt: item.savedAt || item.createdAt,
                        imageUrl: item.url || null,
                        reactions: [],
                        comments: [],
                        author: { id: null, firstName, lastName }
                    },
                    fromSaved: true
                }
            });
        }
    };

    const handleRemove = async (e) => {
        e.stopPropagation();
        setRemoving(true);
        await onRemove(item.id);
        setRemoving(false);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.22 }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            onClick={handleClick}
            style={{
                background: t.surface,
                border: `1px solid ${hovered ? "rgba(143,183,204,0.35)" : t.cardBorder}`,
                borderRadius: 18,
                padding: "1.25rem 1.75rem",
                cursor: "pointer",
                opacity: removing ? 0.5 : 1,
                transition: "all .22s",
                boxShadow: hovered
                    ? (dark ? "0 8px 32px rgba(0,0,0,0.35)" : "0 8px 32px rgba(44,62,80,0.10)")
                    : "none",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                gap: "1.25rem",
                width: "100%",
            }}
        >
            {/* accent left bar on hover */}
            <div style={{
                position: "absolute", top: 0, left: 0, bottom: 0, width: 3,
                borderRadius: "18px 0 0 18px",
                background: `linear-gradient(180deg, #2C3E50, #8FB7CC)`,
                opacity: hovered ? 1 : 0,
                transition: "opacity .22s",
            }} />

            {/* icon */}
            <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: badge.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                <Icon size={24} color={badge.color} strokeWidth={2} />
            </div>

            {/* content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                {/* badge + date row */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: ".35rem" }}>
                    <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "3px 10px", borderRadius: 999,
                        fontSize: ".7rem", fontWeight: 700,
                        textTransform: "uppercase", letterSpacing: ".05em",
                        background: badge.bg, color: badge.color,
                    }}>
                        <Icon size={10} strokeWidth={2.5} /> {cfg.label}
                    </span>
                    {(item.savedAt || item.createdAt) && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: ".72rem", color: t.muted }}>
                            <Calendar size={11} />
                            {formatDate(item.savedAt || item.createdAt)}
                        </span>
                    )}
                </div>

                {/* title */}
                <div style={{
                    fontSize: "1rem", fontWeight: 700, color: t.text,
                    marginBottom: ".3rem", lineHeight: 1.35,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                    {item.title}
                </div>

                {/* description */}
                <div style={{
                    fontSize: ".83rem", color: t.muted, lineHeight: 1.55,
                    display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                    {item.contentSnippet || item.description || item.desc || "No description provided."}
                </div>
            </div>

            {/* right actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <AnimatePresence>
                    {hovered && (
                        <motion.div
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 8 }}
                            style={{ display: "flex", alignItems: "center", gap: 8 }}
                        >
                            <span style={{
                                display: "flex", alignItems: "center", gap: 5,
                                fontSize: ".75rem", color: t.steel, fontWeight: 600,
                            }}>
                                <ExternalLink size={13} /> Open
                            </span>
                            {!removing && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    onClick={handleRemove}
                                    title="Remove"
                                    style={{
                                        background: "rgba(239,68,68,.1)", border: "none", cursor: "pointer",
                                        color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center",
                                        width: 32, height: 32, borderRadius: "50%", transition: "all .15s",
                                    }}
                                >
                                    <BookmarkX size={15} />
                                </motion.button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
                {removing && <Loader2 size={18} color={t.muted} style={{ animation: "spin 1s linear infinite" }} />}
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
        const matchType = activeFilter === "All" || normalizeType(item.itemType) === activeFilter;
        const matchQ = !query
            || (item.title || "").toLowerCase().includes(query.toLowerCase())
            || (item.contentSnippet || item.description || "").toLowerCase().includes(query.toLowerCase());
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
            background: t.bg, color: t.text,
            minHeight: "100vh", transition: "background .3s, color .3s",
        }}>
            <style>{`
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
                    maxWidth: 1100, margin: "0 auto", padding: "0 2rem",
                    height: 64, display: "flex", alignItems: "center",
                    justifyContent: "space-between", gap: 16,
                }}>
                    {/* left: back + title */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                        <button
                            onClick={() => window.history.back()}
                            style={{
                                background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
                                border: `1px solid ${t.border}`, borderRadius: 8,
                                cursor: "pointer", color: t.muted,
                                display: "flex", alignItems: "center", gap: 5,
                                fontSize: ".8rem", padding: "5px 10px", transition: "all .2s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = t.text; e.currentTarget.style.borderColor = t.steel; }}
                            onMouseLeave={e => { e.currentTarget.style.color = t.muted; e.currentTarget.style.borderColor = t.border; }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 13, height: 13 }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            Back
                        </button>

                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: 9,
                                background: dark ? "rgba(143,183,204,0.15)" : "rgba(143,183,204,0.2)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <Bookmark size={15} color={t.steel} strokeWidth={2} />
                            </div>
                            <span style={{ fontSize: ".95rem", fontWeight: 700, color: t.text, letterSpacing: "-.01em" }}>
                                Saved
                            </span>
                            {items && items.length > 0 && (
                                <span style={{
                                    background: t.steel, color: dark ? t.navy : "#fff",
                                    fontSize: ".68rem", fontWeight: 700,
                                    borderRadius: 99, padding: "2px 8px",
                                    lineHeight: "18px", display: "inline-block",
                                }}>
                                    {items.length}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* center: filters */}
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {FILTERS.map(f => {
                            const isActive = activeFilter === f;
                            return (
                                <Button
                                    key={f}
                                    radius="full"
                                    onClick={() => setActiveFilter(f)}
                                    style={{
                                        backgroundColor: isActive
                                            ? (dark ? "#8FB7CC" : "#2C3E50")
                                            : (dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"),
                                        color: isActive
                                            ? (dark ? "#1a1a2e" : "#ffffff")
                                            : t.muted,
                                        border: `1px solid ${isActive ? "transparent" : t.border}`,
                                        height: 34, fontSize: ".78rem", fontWeight: 600,
                                        padding: "0 14px",
                                        transition: "all .2s",
                                        boxShadow: isActive ? "0 2px 8px rgba(143,183,204,0.25)" : "none",
                                    }}
                                >
                                    {f}
                                </Button>
                            );
                        })}
                    </div>

                    {/* right: search */}
                    <div style={{ width: 240, flexShrink: 0 }}>
                        <Input
                            isClearable
                            value={query}
                            onValueChange={setQuery}
                            classNames={{
                                input: ["bg-transparent", "text-black/90 dark:text-white/90",
                                    "placeholder:text-default-700/50 dark:placeholder:text-white/60", "text-sm"],
                                innerWrapper: "bg-transparent",
                                inputWrapper: ["shadow-sm", "bg-default-200/50", "dark:bg-default/60",
                                    "backdrop-blur-xl", "backdrop-saturate-200",
                                    "hover:bg-default-200/70", "dark:hover:bg-default/70",
                                    "group-data-[focus=true]:bg-default-200/50",
                                    "dark:group-data-[focus=true]:bg-default/60",
                                    "cursor-text!", "h-9", "px-3"],
                            }}
                            placeholder="Search saved"
                            radius="lg"
                            startContent={<SearchIcon className="text-black/50 dark:text-white/90 text-slate-400 pointer-events-none shrink-0" style={{ width: 14, height: 14 }} />}
                        />
                    </div>
                </div>
            </div>

            {/* ── LIST ── */}
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem 2rem 4rem" }}>
                {error && <ErrorBanner message={error} dark={dark} onRetry={fetchItems} />}

                {loading && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {[1, 2, 3, 4, 5, 6].map(i => <SkeletonItem key={i} dark={dark} />)}
                    </div>
                )}

                {!loading && (() => {
                    const posts = filtered.filter(i => normalizeType(i.itemType) === "Posts");
                    const library = filtered.filter(i => normalizeType(i.itemType) === "Library");

                    if (filtered.length === 0) return <EmptyState t={t} query={query} />;

                    const renderSection = (title, icon, items) => {
                        if (items.length === 0) return null;
                        return (
                            <div style={{ marginBottom: "2rem" }}>
                                <div style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    marginBottom: "1rem", paddingBottom: ".6rem",
                                    borderBottom: `1px solid ${t.border}`,
                                }}>
                                    {icon}
                                    <span style={{ fontSize: ".85rem", fontWeight: 700, color: t.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>
                                        {title}
                                    </span>
                                    <span style={{
                                        background: t.accentSoft, color: t.steel,
                                        fontSize: ".68rem", fontWeight: 700,
                                        borderRadius: 99, padding: "2px 8px",
                                    }}>
                                        {items.length}
                                    </span>
                                </div>
                                <motion.div layout style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                    <AnimatePresence>
                                        {items.map(item => (
                                            <SavedItemCard key={item.id} item={item} dark={dark} onRemove={handleRemove} />
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            </div>
                        );
                    };

                    return (
                        <>
                            {renderSection("Posts", <Newspaper size={14} color={t.steel} />, posts)}
                            {renderSection("Library", <BookOpen size={14} color={t.steel} />, library)}
                        </>
                    );
                })()}
            </div>
        </div>
    );
}