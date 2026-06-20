import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, List, Map } from "lucide-react";
import { useThemeContext } from "../Theme/ThemeContext";
import { useLibraryResource, useAllLibraryResources } from "../Services/useLibrary";

const CATEGORIES = [
    { id: 1, label: "Frontend", example: "React, CSS, HTML" },
    { id: 2, label: "Backend", example: "Node.js, APIs, DBs" },
    { id: 3, label: "AI / ML", example: "PyTorch, LLMs, Data" },
    { id: 4, label: "Cyber Security", example: "Networking, Pentesting" },
    { id: 5, label: "UI/UX", example: "Figma, Design Systems" },
];

const RESOURCE_TYPES = [
    { id: 1, label: "Videos", example: "YouTube, Vimeo playlists" },
    { id: 2, label: "Articles", example: "Blog posts, Docs, Guides" },
    { id: 3, label: "Books", example: "PDFs, eBooks, Textbooks" },
];

const PRICING_OPTIONS = [
    { id: "Free", label: "Free", color: "#22c55e", desc: "Freely accessible" },
    { id: "Paid", label: "Paid", color: "#f59e0b", desc: "Requires purchase" },
];

const BASE_URL = "https://study-station.runasp.net/api/Library";

// ── SVG Icons ─────────────────────────────────────────────
const IconVideo = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="3" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M11 6.5l4-2v7l-4-2V6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
);

const IconArticle = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="1.5" width="12" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M5 5.5h6M5 8h6M5 10.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
);

const IconBook = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 2.5C3 2.5 5 2 8 2s5 .5 5 .5V14s-2-.5-5-.5S3 14 3 14V2.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M8 2v11.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
);

const IconFrontend = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="2" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M5 14h6M8 12v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M5 8l2-2-2-2M9 8h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const IconBackend = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="2" width="14" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <rect x="1" y="8" width="14" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="13" cy="4" r="0.8" fill="currentColor" />
        <circle cx="13" cy="10" r="0.8" fill="currentColor" />
    </svg>
);

const IconAI = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.42 1.42M11.53 11.53l1.42 1.42M3.05 12.95l1.42-1.42M11.53 4.47l1.42-1.42" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
);

const IconSecurity = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5L2 4v4c0 3.5 2.5 6 6 7 3.5-1 6-3.5 6-7V4L8 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M5.5 8l1.5 1.5L10.5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const IconUX = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
        <path d="M5 8c0-1.66 1.34-3 3-3s3 1.34 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="8" cy="10" r="1.5" fill="currentColor" />
    </svg>
);

const IconFree = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1l1.8 3.6L14 5.6l-3 2.9.7 4.1L8 10.5 4.3 12.6 5 8.5 2 5.6l4.2-.6L8 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
);

const IconPaid = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M8 4.5v7M6 6.5c0-.83.9-1.5 2-1.5s2 .67 2 1.5S9.1 8 8 8s-2 .67-2 1.5S6.9 11 8 11s2-.67 2-1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
);

// ── Icon for the "choose file" button ───────────────────────
const IconUpload = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 9.5V1.5M7 1.5L4 4.5M7 1.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M1.5 9.5v2A1.5 1.5 0 003 13h8a1.5 1.5 0 001.5-1.5v-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const IconClose = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const CATEGORY_ICONS = {
    1: <IconFrontend />,
    2: <IconBackend />,
    3: <IconAI />,
    4: <IconSecurity />,
    5: <IconUX />,
};

const RESOURCE_TYPE_ICONS = {
    1: <IconVideo />,
    2: <IconArticle />,
    3: <IconBook />,
};

const PRICING_ICONS = {
    Free: <IconFree />,
    Paid: <IconPaid />,
};

// Helper: human readable file size
const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─── Toast (react-toastify style, top-right) ──────────────
function Toast({ message, type = "error", visible }) {
    const bg = type === "error" ? "#dc2626" : "#22c55e";
    return (
        <div style={{
            position: "fixed", top: "1.25rem", right: "1.25rem", zIndex: 9999,
            background: bg, color: "#fff", padding: "13px 18px", borderRadius: "10px",
            fontSize: "13.5px", fontWeight: 500, boxShadow: "0 8px 28px rgba(0,0,0,.22)",
            display: "flex", alignItems: "center", gap: "9px", maxWidth: "320px",
            transform: visible ? "translateY(0)" : "translateY(-80px)",
            opacity: visible ? 1 : 0,
            transition: "all .35s cubic-bezier(.34,1.56,.64,1)",
            pointerEvents: "none",
        }}>
            {type === "error"
                ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="white" strokeWidth="1.3" /><path d="M8 5v3.5M8 11v.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
                : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="white" strokeWidth="1.3" /><path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            }
            <span>{message}</span>
        </div>
    );
}

function useToast() {
    const [toast, setToast] = useState({ visible: false, message: "", type: "error" });
    const showToast = (message, type = "error", duration = 3500) => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast(t => ({ ...t, visible: false })), duration);
    };
    return { toast, showToast };
}

// ─── Toggle List Component ─────────────────────────────────
function ToggleList({ options, value, onChange, isDarkMode, columns = 1, iconMap }) {
    const t = isDarkMode;
    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap: "8px",
        }}>
            {options.map((opt) => {
                const active = String(value) === String(opt.id);
                const accentColor = opt.color || "#8FB7CC";
                return (
                    <button
                        key={opt.id}
                        type="button"
                        onClick={() => onChange(opt.id)}
                        style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            padding: "10px 12px", borderRadius: "10px",
                            border: active
                                ? `2px solid ${accentColor}`
                                : `1px solid ${t ? "rgba(255,255,255,0.09)" : "rgba(44,62,80,0.12)"}`,
                            background: active
                                ? (t ? `${accentColor}18` : `${accentColor}14`)
                                : (t ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"),
                            cursor: "pointer",
                            transition: "all .18s",
                            textAlign: "left",
                            width: "100%",
                            minWidth: 0,
                            boxSizing: "border-box",
                        }}
                    >
                        <span style={{
                            color: active ? accentColor : (t ? "#9a9a9a" : "#686868"),
                            flexShrink: 0,
                            display: "flex", alignItems: "center",
                        }}>
                            {iconMap ? iconMap[opt.id] : null}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontSize: "13px", fontWeight: 600,
                                color: active ? accentColor : (t ? "#e0e0e0" : "#2C3E50"),
                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            }}>
                                {opt.label}
                            </div>
                            {(opt.example || opt.desc) && (
                                <div style={{
                                    fontSize: "11px", color: t ? "#7a7a7a" : "#9a9a9a",
                                    marginTop: "1px", whiteSpace: "nowrap",
                                    overflow: "hidden", textOverflow: "ellipsis",
                                }}>
                                    {opt.example || opt.desc}
                                </div>
                            )}
                        </div>
                        {active && (
                            <div style={{
                                width: "16px", height: "16px", borderRadius: "50%",
                                background: accentColor,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0,
                            }}>
                                <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                                    <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

// ─── TypeIcon ─────────────────────────────────────────────
const TypeIcon = ({ type, iconBg, iconColor }) => {
    const base = "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0";
    const style = { backgroundColor: iconBg, color: iconColor };
    switch (type?.toLowerCase()) {
        case "playlist": return <div className={base} style={style}><List size={18} /></div>;
        case "roadmap": return <div className={base} style={style}><Map size={18} /></div>;
        default: return <div className={base} style={style}><BookOpen size={18} /></div>;
    }
};

// ─── ResourceDetail ───────────────────────────────────────
function ResourceDetail({ onBack, onNavigate }) {
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();

    const { data, isLoading, error } = useLibraryResource(id);
    const { resources: allResources } = useAllLibraryResources();

    const relatedResources = allResources
        .filter((r) => r.id !== Number(id) && r.track === data?.track)
        .slice(0, 3);

    const { isDarkMode } = useThemeContext();
    const pageBg = isDarkMode ? "#171717" : "#F3F4F6";
    const cardBg = isDarkMode ? "#262626" : "#ffffff";
    const textPrimary = isDarkMode ? "#f3f4f6" : "#2C3E50";
    const textSecondary = isDarkMode ? "#9ca3af" : "#686868";
    const borderColor = isDarkMode ? "#404040" : "#cbd5e1";
    const metaBoxBg = isDarkMode ? "#1f1f1f" : "#E8EAED";
    const typeIconBg = isDarkMode ? "#404040" : "#f1f5f9";
    const typeIconColor = isDarkMode ? "#9ca3af" : "#686868";
    const backHover = isDarkMode ? "#e5e7eb" : "#2C3E50";
    const sectionLabel = isDarkMode ? "#9ca3af" : "#686868";
    const btnSecondaryBg = isDarkMode ? "#404040" : "transparent";
    const btnSecondaryHover = isDarkMode ? "#525252" : "#f8fafc";
    const pulseBg = isDarkMode ? "#404040" : "#e2e8f0";
    const pulseBgLight = isDarkMode ? "#525252" : "#f1f5f9";

    const CATEGORY_MAP = { 1: "Frontend", 2: "Backend", 3: "AI / ML", 4: "Cyber Security", 5: "UI/UX" };
    const RESOURCE_TYPE_MAP = { 1: "Videos", 2: "Articles", 3: "Books" };

    const handleBackToLibrary = () => { if (onBack) onBack(); else navigate("/library"); };
    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopied(true); setTimeout(() => setCopied(false), 2000);
        });
    };
    const handleOpenResource = () => {
        if (data?.url) window.open(data.url, "_blank", "noopener,noreferrer");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen px-5 py-6 animate-pulse" style={{ backgroundColor: pageBg }}>
                <div className="h-4 w-28 rounded mb-5" style={{ backgroundColor: pulseBg }} />
                <div className="rounded-2xl p-8 mb-4" style={{ backgroundColor: cardBg }}>
                    <div className="flex gap-2 mb-4">
                        {[20, 22, 18].map((w, i) => <div key={i} className={`h-7 w-${w} rounded-full`} style={{ backgroundColor: pulseBgLight }} />)}
                    </div>
                    <div className="h-12 rounded w-3/4 mb-3" style={{ backgroundColor: pulseBgLight }} />
                    <div className="space-y-2 mb-6">
                        {[100, 83, 66].map((w, i) => <div key={i} className={`h-3.5 rounded w-${w === 100 ? "full" : w === 83 ? "5/6" : "4/6"}`} style={{ backgroundColor: pulseBgLight }} />)}
                    </div>
                    <div className="flex gap-2 mb-5">
                        <div className="h-11 w-36 rounded-xl" style={{ backgroundColor: pulseBgLight }} />
                        <div className="h-11 w-28 rounded-xl" style={{ backgroundColor: pulseBgLight }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-16 rounded-xl" style={{ backgroundColor: pulseBgLight }} />)}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-5" style={{ backgroundColor: pageBg }}>
                <p className="text-sm font-medium" style={{ color: textSecondary }}>Failed to load resource: {error}</p>
                <button onClick={handleBackToLibrary} className="text-sm underline" style={{ color: textSecondary }}>← Back to Library</button>
            </div>
        );
    }

    const categoryName = data?.categoryName || CATEGORY_MAP[data?.categoryId] || data?.category || null;
    const resourceType = data?.resourceTypeName || RESOURCE_TYPE_MAP[data?.resourceTypeId] || null;
    const pricing = data?.type?.toLowerCase();
    const isPaid = pricing === "paid";
    const isFree = pricing === "free";

    return (
        <div className="min-h-screen px-5 py-6 flex flex-col items-center" style={{ backgroundColor: pageBg }}>
            <div className="w-full max-w-2xl">

                {/* Back */}
                <button
                    onClick={handleBackToLibrary}
                    className="flex items-center gap-1.5 text-sm transition-colors mb-5 cursor-pointer"
                    style={{ color: textSecondary, background: "none", border: "none", padding: 0 }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = backHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = textSecondary; }}
                >
                    <ArrowLeft size={13} /> Back to Library
                </button>

                {/* Main Card */}
                <div className="rounded-2xl mb-5" style={{ backgroundColor: cardBg, padding: "32px 36px 36px" }}>

                    {/* Badges — only content type, category, resource type */}
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                        <span
                            className="flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide"
                            style={isDarkMode
                                ? { color: "#93c5fd", backgroundColor: "rgba(59,130,246,0.2)", border: "1px solid #2563eb" }
                                : { color: "#2563eb", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}
                        >
                            <BookOpen size={11} />
                            {data?.contentType || "Resource"}
                        </span>

                        {categoryName && (
                            <span
                                className="text-[11px] font-medium px-3 py-1 rounded-full border"
                                style={{ color: textPrimary, borderColor }}
                            >
                                {categoryName}
                            </span>
                        )}

                        {resourceType && (
                            <span
                                className="text-[11px] font-medium px-3 py-1 rounded-full"
                                style={isDarkMode
                                    ? { color: "#a0b4c4", backgroundColor: "rgba(100,120,140,0.25)" }
                                    : { color: "#4a6578", backgroundColor: "rgba(100,120,140,0.1)" }}
                            >
                                {resourceType}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h1
                        className="leading-tight mb-3"
                        style={{ fontSize: "2.2rem", fontWeight: 900, fontFamily: "sans-serif", color: textPrimary, margin: "0 0 12px" }}
                    >
                        {data?.title}
                    </h1>

                    {/* Description */}
                    <p className="leading-relaxed mb-6" style={{ fontSize: "14px", color: textSecondary, margin: "0 0 22px" }}>
                        {data?.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap mb-6">
                        <button
                            onClick={handleOpenResource}
                            style={{
                                display: "flex", alignItems: "center", gap: 8,
                                background: "#2C3E50", color: "#fff",
                                border: "none", padding: "11px 24px", borderRadius: 12,
                                fontSize: 14, fontWeight: 600, cursor: "pointer",
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M6 2H2.5A1.5 1.5 0 001 3.5v8A1.5 1.5 0 002.5 13h8A1.5 1.5 0 0012 11.5V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                                <path d="M8 1h5v5M13 1L7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Open Resource
                        </button>
                        <button
                            onClick={handleCopyLink}
                            style={{
                                display: "flex", alignItems: "center", gap: 8,
                                background: btnSecondaryBg, color: textPrimary,
                                border: `1px solid ${borderColor}`, padding: "11px 24px", borderRadius: 12,
                                fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "background .15s",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = btnSecondaryHover; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = btnSecondaryBg; }}
                        >
                            {copied
                                ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="4" y="1" width="8" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><path d="M2 4v8a1.5 1.5 0 001.5 1.5H10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
                            }
                            {copied ? "Copied!" : "Copy Link"}
                        </button>
                    </div>

                    {/* Meta Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: "CATEGORY", value: categoryName || "—" },
                            { label: "RESOURCE TYPE", value: resourceType || "—" },
                            { label: "PRICING", value: isFree ? "Free" : isPaid ? "Paid" : "—" },
                            { label: "ADDED BY", value: data?.addedBy || "Community" },
                        ].map(({ label, value }) => (
                            <div key={label} className="rounded-xl" style={{ backgroundColor: metaBoxBg, padding: "14px 16px" }}>
                                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: textSecondary, margin: "0 0 5px" }}>{label}</p>
                                <p style={{ fontSize: 14, fontWeight: 600, color: textPrimary, margin: 0 }}>{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Related */}
                {relatedResources.length > 0 && (
                    <>
                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: sectionLabel, marginBottom: 12, paddingLeft: 4 }}>
                            More from {data?.track} Track
                        </p>
                        <div className="flex flex-col gap-3">
                            {relatedResources.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onNavigate ? onNavigate(item.id) : navigate(`/library/${item.id}`)}
                                    className="rounded-2xl px-5 py-4 flex items-center gap-3 w-full text-left cursor-pointer"
                                    style={{ backgroundColor: cardBg, border: "none" }}
                                >
                                    <TypeIcon type={item.type} iconBg={typeIconBg} iconColor={typeIconColor} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate" style={{ color: textPrimary, margin: 0 }}>{item.title}</p>
                                        <p className="text-xs" style={{ color: textSecondary, margin: 0 }}>{item.type}</p>
                                    </div>
                                    <ArrowRight size={16} className="flex-shrink-0" style={{ color: textSecondary }} />
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── ShareForm ────────────────────────────────────────────
function ShareForm() {
    const { isDarkMode } = useThemeContext();
    const navigate = useNavigate();
    const { toast, showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null); // { name, size }
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        title: "",
        description: "",
        categoryId: "",
        resourceTypeId: "",
        pricing: "Free",
        url: "",
        filePath: "",
    });

    const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

    // ── File picker handlers ─────────────────────────────────
    const handlePickFile = () => fileInputRef.current?.click();

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 20MB safety cap so people don't try to attach huge files
        // that can't realistically be sent as a path string anyway.
        const MAX_SIZE = 20 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            showToast("File is too large. Please pick a file under 20MB.", "error");
            e.target.value = "";
            return;
        }

        setSelectedFile({ name: file.name, size: file.size });
        // The backend only stores a file path string (no upload endpoint exists yet),
        // so we drop the picked file's name into the File Path field for the user.
        setForm((f) => ({ ...f, filePath: file.name }));
        e.target.value = ""; // allow re-selecting the same file later
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        setForm((f) => ({ ...f, filePath: "" }));
    };

    const validate = () => {
        if (!form.title.trim()) return "Title is required.";
        if (!form.categoryId) return "Please select a category / track.";
        if (!form.resourceTypeId) return "Please select a resource type.";
        if (!form.url.trim()) return "Resource URL is required.";
        return null;
    };

    const submit = async () => {
        const err = validate();
        if (err) { showToast(err, "error"); return; }
        setLoading(true);
        const payload = {
            title: form.title.trim(),
            type: form.pricing,
            url: form.url.trim(),
            filePath: form.filePath.trim() || "",
            description: form.description.trim() || "",
            categoryId: parseInt(form.categoryId, 10),
            resourceTypeId: parseInt(form.resourceTypeId, 10),
        };
        try {
            const res = await fetch(`${BASE_URL}/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                let msg = `Server error: ${res.status}`;
                try { const d = await res.json(); msg = d?.message || d?.title || msg; } catch (_) { }
                throw new Error(msg);
            }
            showToast("Resource submitted! Pending admin review.", "success");
            setForm({ title: "", description: "", categoryId: "", resourceTypeId: "", pricing: "Free", url: "", filePath: "" });
            setSelectedFile(null);
        } catch (e) {
            showToast(e.message || "Something went wrong.", "error");
        } finally {
            setLoading(false);
        }
    };

    const t = isDarkMode;
    const th = {
        bg: t ? "#171717" : "#F3F4F6",
        surface: t ? "#1f1f1f" : "#ffffff",
        text: t ? "#f0f0f0" : "#1a1a2e",
        muted: t ? "#9a9a9a" : "#686868",
        border: t ? "rgba(255,255,255,0.07)" : "rgba(44,62,80,0.1)",
        cardBorder: t ? "rgba(255,255,255,0.06)" : "rgba(44,62,80,0.08)",
        accentSoft: t ? "rgba(143,183,204,0.1)" : "rgba(143,183,204,0.18)",
        btnBg: t ? "#8FB7CC" : "#2C3E50",
        btnColor: t ? "#2C3E50" : "#ffffff",
    };

    const inputStyle = {
        width: "100%", padding: "9px 13px", background: th.bg,
        border: `1px solid ${th.border}`, borderRadius: 9,
        fontFamily: "'DM Sans', sans-serif", fontSize: 14,
        color: th.text, outline: "none", boxSizing: "border-box",
    };
    const secLabel = {
        fontFamily: "'Syne', sans-serif", fontSize: 10.5, fontWeight: 700,
        letterSpacing: ".14em", textTransform: "uppercase", color: th.muted,
        marginBottom: ".9rem", paddingBottom: ".5rem",
        borderBottom: `1px solid ${th.border}`, display: "block",
    };
    const fieldLabel = { display: "block", fontSize: 12.8, fontWeight: 500, color: th.text, marginBottom: 7 };

    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: th.bg, transition: "background .3s, color .3s" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap'); @keyframes spin { to { transform: rotate(360deg); } }`}</style>

            <div style={{ flex: 1, overflowY: "auto", height: "100vh", fontFamily: "'DM Sans', sans-serif", color: th.text }}>
                <div style={{ maxWidth: 660, margin: "0 auto", padding: "2rem 2rem 4rem" }}>

                    {/* Back */}
                    <button
                        onClick={() => navigate("/library")}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, color: th.muted, cursor: "pointer", border: "none", background: "none", fontFamily: "'DM Sans', sans-serif", padding: 0, marginBottom: "1.5rem" }}
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M9 2L5 7l4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Back to Library
                    </button>

                    <div style={{ marginBottom: "1.25rem" }}>
                        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.65rem", color: th.text, marginBottom: ".4rem" }}>Contribute a Resource</h1>
                        <p style={{ color: th.muted, fontSize: 14, lineHeight: 1.6 }}>Share a course, video, article, or tool with the community. Your submission will be reviewed by an admin before going live.</p>
                    </div>

                    {/* Info banner */}
                    <div style={{ background: th.accentSoft, border: "1px solid rgba(143,183,204,.3)", borderRadius: 12, padding: "11px 14px", display: "flex", alignItems: "flex-start", gap: 9, marginBottom: "1.5rem", fontSize: 13, color: th.text, lineHeight: 1.55 }}>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: 2, color: "#8FB7CC" }}>
                            <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M7.5 6.5v4M7.5 4.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                        <span>Submissions are <strong>reviewed before publishing</strong>. This keeps the library high-quality and organized for everyone.</span>
                    </div>

                    <div style={{ background: th.surface, border: `1px solid ${th.cardBorder}`, borderRadius: 18, overflow: "hidden" }}>
                        <div style={{ height: 3, background: "linear-gradient(90deg, #2C3E50, #8FB7CC)" }} />
                        <div style={{ padding: "1.75rem" }}>

                            {/* Basic Info */}
                            <span style={secLabel}>Basic Info</span>
                            <div style={{ marginBottom: "1.1rem" }}>
                                <label style={fieldLabel}>Title <span style={{ color: "#dc2626" }}>*</span></label>
                                <input style={inputStyle} value={form.title} onChange={e => set("title")(e.target.value)} placeholder="e.g. React for Beginners — Full Course" />
                            </div>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={fieldLabel}>Description</label>
                                <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 85 }} value={form.description} onChange={e => set("description")(e.target.value)} placeholder="What will students learn? Why is this resource valuable?" />
                            </div>

                            <div style={{ height: 1, background: th.border, margin: "1.5rem 0" }} />

                            {/* Category */}
                            <span style={secLabel}>Category / Track <span style={{ color: "#dc2626" }}>*</span></span>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <ToggleList options={CATEGORIES} value={form.categoryId} onChange={set("categoryId")} isDarkMode={isDarkMode} columns={2} iconMap={CATEGORY_ICONS} />
                            </div>

                            <div style={{ height: 1, background: th.border, margin: "1.5rem 0" }} />

                            {/* Resource Type */}
                            <span style={secLabel}>Resource Type <span style={{ color: "#dc2626" }}>*</span></span>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <ToggleList options={RESOURCE_TYPES} value={form.resourceTypeId} onChange={set("resourceTypeId")} isDarkMode={isDarkMode} columns={3} iconMap={RESOURCE_TYPE_ICONS} />
                            </div>

                            <div style={{ height: 1, background: th.border, margin: "1.5rem 0" }} />

                            {/* Pricing */}
                            <span style={secLabel}>Pricing</span>
                            <div style={{ marginBottom: "1.5rem" }}>
                                <ToggleList options={PRICING_OPTIONS} value={form.pricing} onChange={set("pricing")} isDarkMode={isDarkMode} columns={2} iconMap={PRICING_ICONS} />
                            </div>

                            <div style={{ height: 1, background: th.border, margin: "1.5rem 0" }} />

                            {/* Links */}
                            <span style={secLabel}>Links & Files</span>
                            <div style={{ marginBottom: "1.1rem" }}>
                                <label style={fieldLabel}>Resource URL <span style={{ color: "#dc2626" }}>*</span></label>
                                <input
                                    style={inputStyle} type="url"
                                    value={form.url} onChange={e => set("url")(e.target.value)}
                                    placeholder={
                                        form.resourceTypeId == 1 ? "https://youtube.com/playlist?list=..."
                                            : form.resourceTypeId == 3 ? "https://... or /uploads/book.pdf"
                                                : "https://..."
                                    }
                                />
                                <div style={{ fontSize: 11.5, color: th.muted, marginTop: 4 }}>
                                    {form.resourceTypeId == 1 && "YouTube playlist, Vimeo course link, etc."}
                                    {form.resourceTypeId == 2 && "Article URL, blog post, documentation link, etc."}
                                    {form.resourceTypeId == 3 && "eBook URL, PDF link, or online textbook URL."}
                                    {!form.resourceTypeId && "YouTube playlist, course link, article URL, etc."}
                                </div>
                            </div>

                            {/* File Path + device file picker */}
                            <div style={{ marginBottom: "1.1rem" }}>
                                <label style={fieldLabel}>File Path <span style={{ fontWeight: 400, color: th.muted }}>(optional)</span></label>

                                {/* Hidden native file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.epub,.txt"
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
                                />

                                <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
                                    <input
                                        style={{ ...inputStyle, flex: 1 }}
                                        value={form.filePath}
                                        onChange={e => { setSelectedFile(null); set("filePath")(e.target.value); }}
                                        placeholder="/uploads/resource.pdf"
                                    />
                                    <button
                                        type="button"
                                        onClick={handlePickFile}
                                        style={{
                                            display: "flex", alignItems: "center", gap: 7,
                                            padding: "0 16px", borderRadius: 9,
                                            border: `1px solid ${th.border}`,
                                            background: t ? "rgba(255,255,255,0.04)" : "rgba(44,62,80,0.04)",
                                            color: th.text, fontFamily: "'DM Sans', sans-serif",
                                            fontSize: 13, fontWeight: 600, cursor: "pointer",
                                            whiteSpace: "nowrap", flexShrink: 0,
                                        }}
                                    >
                                        <IconUpload />
                                        Choose from device
                                    </button>
                                </div>

                                {selectedFile ? (
                                    <div style={{
                                        display: "flex", alignItems: "center", gap: 8,
                                        marginTop: 8, padding: "8px 12px", borderRadius: 9,
                                        background: th.accentSoft, border: "1px solid rgba(143,183,204,.3)",
                                    }}>
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "#8FB7CC", flexShrink: 0 }}>
                                            <path d="M3.5 1.5h5L11 4.5v8a1 1 0 01-1 1h-6.5a1 1 0 01-1-1v-10a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                                            <path d="M8.5 1.5v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                                        </svg>
                                        <span style={{ fontSize: 12.5, color: th.text, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {selectedFile.name} <span style={{ color: th.muted }}>({formatFileSize(selectedFile.size)})</span>
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleClearFile}
                                            style={{
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                width: 18, height: 18, borderRadius: "50%", border: "none",
                                                background: t ? "rgba(255,255,255,0.08)" : "rgba(44,62,80,0.08)",
                                                color: th.muted, cursor: "pointer", flexShrink: 0, padding: 0,
                                            }}
                                        >
                                            <IconClose />
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ fontSize: 11.5, color: th.muted, marginTop: 4 }}>
                                        Pick a PDF or document from your device, or type a server path manually (e.g. /uploads/book.pdf). Only the file name is sent — actual file upload isn't supported by the server yet.
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: "1.5rem" }}>
                                <button
                                    onClick={() => navigate("/library")}
                                    disabled={loading}
                                    style={{ padding: "9px 20px", borderRadius: 10, background: "transparent", border: `1px solid ${th.border}`, color: th.muted, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 14, cursor: "pointer", opacity: loading ? 0.5 : 1 }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submit}
                                    disabled={loading}
                                    style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: th.btnBg, color: th.btnColor, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.75 : 1, display: "flex", alignItems: "center", gap: 8, transition: "opacity .2s" }}
                                >
                                    {loading ? (
                                        <>
                                            <span style={{ width: 14, height: 14, border: `2px solid ${th.btnColor}44`, borderTop: `2px solid ${th.btnColor}`, borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                                            Submitting…
                                        </>
                                    ) : (
                                        <>
                                            Submit for Review
                                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                                <path d="M2 6.5h9M7 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <Toast message={toast.message} type={toast.type} visible={toast.visible} />
        </div>
    );
}

// ─── Export ───────────────────────────────────────────────
export default function ShareResource({ onBack, onNavigate }) {
    const { id } = useParams();
    if (id) return <ResourceDetail onBack={onBack} onNavigate={onNavigate} />;
    return <ShareForm />;
}