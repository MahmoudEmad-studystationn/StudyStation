import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addSavedItem } from "../Services/savedItemsService";
import { ExternalLinkIcon } from "lucide-react";

const ITEM_TYPE_MAP = {
    roadmap: 1,
    video: 2,
    playlist: 2,
    resource: 3,
};

function getItemType(type) {
    return 1; // All library resources = LibraryResource
}

// ── localStorage helpers ──────────────────────────────────────────────────────
const STORAGE_KEY = "savedLibraryResources";

function getSavedSet() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
        return new Set();
    }
}

function addToSavedSet(id) {
    try {
        const set = getSavedSet();
        set.add(String(id));
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
    } catch {}
}

export function isResourceSaved(id) {
    return getSavedSet().has(String(id));
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const TYPE_STYLES = {
    roadmap: { color: "#8FB7CC", darkBg: "rgba(143,183,204,0.18)", bg: "rgba(143,183,204,0.15)", label: "Roadmap", icon: "M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" },
    resource: { color: "#3D718D", darkBg: "rgba(61,113,141,0.2)", bg: "rgba(61,113,141,0.12)", label: "Resource", icon: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" },
    video: { color: "#658FA5", darkBg: "rgba(101,143,165,0.2)", bg: "rgba(101,143,165,0.12)", label: "Video", icon: "M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" },
    default: { color: "#3D718D", darkBg: "rgba(61,113,141,0.2)", bg: "rgba(61,113,141,0.12)", label: "Resource", icon: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" },
};

const SECTIONS = {
    roadmap: { label: "Roadmaps" },
    resource: { label: "Resources & Materials" },
    video: { label: "Videos & Playlists" },
};

const CATEGORY_MAP = { 1: "Frontend", 2: "Backend", 3: "AI / ML", 4: "Cyber Security", 5: "UI/UX" };
const RESOURCE_TYPE_MAP = { 1: "Videos", 2: "Articles", 3: "Books" };

function getTypeStyle(type) {
    if (!type) return TYPE_STYLES.default;
    const t = type.toLowerCase();
    if (t === "roadmap") return TYPE_STYLES.roadmap;
    if (t === "video" || t === "playlist") return TYPE_STYLES.video;
    return TYPE_STYLES.resource;
}

function getSectionKey(type) {
    if (!type) return "resource";
    const t = type.toLowerCase();
    if (t === "roadmap") return "roadmap";
    if (t === "video" || t === "playlist") return "video";
    return "resource";
}

// ── Save Button ───────────────────────────────────────────────────────────────
function SaveButton({ resourceId, resourceType, isDarkMode }) {
    const [saved, setSaved] = useState(() => isResourceSaved(resourceId));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    async function handleSave(e) {
        e.stopPropagation();
        if (saved || loading) return;

        setLoading(true);
        try {
            await addSavedItem(resourceId, getItemType(resourceType));
            addToSavedSet(resourceId); // persist to localStorage
            setSaved(true);
        } catch {
            setError(true);
            setTimeout(() => setError(false), 2000);
        } finally {
            setLoading(false);
        }
    }

    const idle   = isDarkMode ? "#9a9a9a" : "#686868";
    const bgIdle  = isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
    const bgSaved = isDarkMode ? "rgba(143,183,204,0.18)" : "rgba(143,183,204,0.2)";
    const bgError = isDarkMode ? "rgba(239,68,68,0.15)"  : "rgba(239,68,68,0.1)";

    const bg    = saved ? bgSaved : error ? bgError : bgIdle;
    const color = saved ? "#8FB7CC" : error ? "#ef4444" : idle;
    const title = saved ? "Saved!" : error ? "Failed — try again" : "Save";

    return (
        <button
            onClick={handleSave}
            title={title}
            disabled={loading || saved}
            style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 30, height: 30, borderRadius: 8, border: "none",
                background: bg, color, cursor: saved ? "default" : "pointer",
                transition: "all .2s", flexShrink: 0,
                opacity: loading ? 0.6 : 1,
            }}
        >
            {loading ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ animation: "spin .7s linear infinite" }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
            ) : saved ? (
                /* filled bookmark */
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 3h14a1 1 0 0 1 1 1v17l-8-4-8 4V4a1 1 0 0 1 1-1Z" />
                </svg>
            ) : (
                /* outline bookmark */
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3h14a1 1 0 0 1 1 1v17l-8-4-8 4V4a1 1 0 0 1 1-1Z" />
                </svg>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </button>
    );
}

// ── Resource Card ─────────────────────────────────────────────────────────────
export default function ResourceCard({ resource, isDarkMode }) {
    const [hovered, setHovered] = useState(false);
    const navigate = useNavigate();
    const t = getTypeStyle(resource.type);

    const cardBg     = isDarkMode ? "#1f1f1f" : "#ffffff";
    const cardBorder = hovered ? t.color + "80" : isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(44,62,80,0.08)";
    const titleColor = isDarkMode ? "#f0f0f0" : "#1a1a2e";
    const mutedColor = isDarkMode ? "#9a9a9a" : "#686868";
    const arrowBg    = hovered ? t.color : (isDarkMode ? "#2a2a2a" : "#e8eaed");
    const arrowColor = hovered ? "#ffffff" : mutedColor;

    const catLabel     = resource.categoryName || CATEGORY_MAP[resource.categoryId] || resource.category || null;
    const resTypeLabel = resource.resourceTypeName || RESOURCE_TYPE_MAP[resource.resourceTypeId] || null;
    const isPaid = resource.type?.toLowerCase() === "paid";
    const isFree = resource.type?.toLowerCase() === "free";

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => navigate(`/library/${resource.id}`)}
            style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: "14px",
                padding: "1.25rem",
                cursor: "pointer",
                transition: "all .25s",
                position: "relative",
                overflow: "hidden",
                transform: hovered ? "translateY(-3px)" : "translateY(0)",
                boxShadow: hovered ? `0 10px 36px ${t.color}25` : "none",
            }}
        >
            {/* top accent */}
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "3px",
                background: `linear-gradient(90deg, ${t.color}, ${t.color}66)`,
                opacity: hovered ? 1 : 0, transition: "opacity .2s",
            }} />

            {/* Badges row */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: ".65rem" }}>
                <span style={{
                    display: "inline-flex", alignItems: "center", gap: "5px",
                    padding: "3px 9px", borderRadius: "999px",
                    fontSize: ".68rem", fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: ".05em",
                    background: isDarkMode ? t.darkBg : t.bg, color: t.color,
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "11px", height: "11px" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
                    </svg>
                    {t.label}
                </span>

                {resTypeLabel && (
                    <span style={{
                        display: "inline-flex", alignItems: "center",
                        padding: "3px 9px", borderRadius: "999px",
                        fontSize: ".68rem", fontWeight: 600,
                        textTransform: "uppercase", letterSpacing: ".05em",
                        background: isDarkMode ? "rgba(100,120,140,0.25)" : "rgba(100,120,140,0.1)",
                        color: isDarkMode ? "#a0b4c4" : "#4a6578",
                    }}>
                        {resTypeLabel}
                    </span>
                )}

                {catLabel && (
                    <span style={{
                        display: "inline-flex", alignItems: "center",
                        padding: "3px 9px", borderRadius: "999px",
                        fontSize: ".68rem", fontWeight: 600,
                        textTransform: "uppercase", letterSpacing: ".05em",
                        background: isDarkMode ? "rgba(44,62,80,0.4)" : "rgba(44,62,80,0.08)",
                        color: isDarkMode ? "#B0B0B0" : "#2C3E50",
                    }}>
                        {catLabel}
                    </span>
                )}

                {(isFree || isPaid) && (
                    <span style={{
                        display: "inline-flex", alignItems: "center",
                        padding: "3px 9px", borderRadius: "999px",
                        fontSize: ".68rem", fontWeight: 700,
                        textTransform: "uppercase", letterSpacing: ".05em",
                        background: isFree
                            ? (isDarkMode ? "rgba(34,197,94,0.15)" : "rgba(34,197,94,0.1)")
                            : (isDarkMode ? "rgba(251,191,36,0.15)" : "rgba(251,191,36,0.12)"),
                        color: isFree ? "#22c55e" : "#f59e0b",
                    }}>
                        {isFree ? "✦ Free" : "★ Paid"}
                    </span>
                )}
            </div>

            {/* Title */}
            <div style={{ fontWeight: 700, fontSize: ".95rem", color: titleColor, marginBottom: ".35rem", lineHeight: 1.3 }}>
                {resource.title}
            </div>

            {/* Description */}
            <div style={{
                fontSize: ".82rem", color: mutedColor, lineHeight: 1.55, marginBottom: ".9rem",
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
                {resource.description || "No description provided."}
            </div>

            {/* Footer */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                    fontSize: ".72rem", fontWeight: 500, color: t.color,
                    background: isDarkMode ? t.darkBg : t.bg,
                    padding: "2px 9px", borderRadius: "999px",
                }}>
                    {SECTIONS[getSectionKey(resource.type)]?.label || "Resource"}
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={e => e.stopPropagation()}>
                    <SaveButton
                        resourceId={resource.id}
                        resourceType={resource.type}
                        isDarkMode={isDarkMode}
                    />
                    <div
                        style={{
                            width: "26px", height: "26px", borderRadius: "7px",
                            background: arrowBg, display: "flex", alignItems: "center", justifyContent: "center",
                            color: arrowColor, transition: "all .2s", cursor: "pointer",
                        }}
                        onClick={e => { e.stopPropagation(); navigate(`/library/${resource.id}`); }}
                    >
                        <ExternalLinkIcon size={13} color={arrowColor} />
                    </div>
                </div>
            </div>
        </div>
    );
}