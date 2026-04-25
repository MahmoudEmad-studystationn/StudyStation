import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, List, Map } from "lucide-react";
import { useThemeContext } from "../Theme/ThemeContext";
import { useLibraryResource, useAllLibraryResources } from "../Services/useLibrary";

const BASE_URL = "https://study-station.runasp.net/api/Library";

const TypeIcon = ({ type, iconBg, iconColor }) => {
    const base = "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0";
    const style = { backgroundColor: iconBg, color: iconColor };
    switch (type?.toLowerCase()) {
        case "playlist":
            return <div className={base} style={style}><List size={18} /></div>;
        case "roadmap":
            return <div className={base} style={style}><Map size={18} /></div>;
        default:
            return <div className={base} style={style}><BookOpen size={18} /></div>;
    }
};

export default function ShareResource({ onBack, onNavigate }) {
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();

    // ─── Get resource id from URL params (e.g. /library/:id) ───
    const { id } = useParams();

    // ─── Fetch this resource ────────────────────────────────────
    const { data, isLoading, error } = useLibraryResource(id);

    // ─── Fetch all resources to build "More from Track" list ───
    const { resources: allResources } = useAllLibraryResources();

    // Related = same track, different id (max 3)
    const relatedResources = allResources
        .filter((r) => r.id !== Number(id) && r.track === data?.track)
        .slice(0, 3);

    // ─── Theme ──────────────────────────────────────────────────
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

    const handleBackToLibrary = () => {
        if (onBack) onBack();
        else navigate("/library");
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleOpenResource = () => {
        if (data?.url) window.open(data.url, "_blank", "noopener,noreferrer");
    };

    // ─── Loading skeleton ───────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen px-5 py-6 animate-pulse" style={{ backgroundColor: pageBg }}>
                <div className="h-4 w-28 rounded mb-5" style={{ backgroundColor: pulseBg }} />
                <div className="rounded-2xl p-6 mb-4" style={{ backgroundColor: cardBg }}>
                    <div className="flex gap-2 mb-4">
                        <div className="h-7 w-20 rounded-full" style={{ backgroundColor: pulseBgLight }} />
                        <div className="h-7 w-22 rounded-full" style={{ backgroundColor: pulseBgLight }} />
                        <div className="h-7 w-18 rounded-full" style={{ backgroundColor: pulseBgLight }} />
                    </div>
                    <div className="h-10 rounded w-3/4 mb-3" style={{ backgroundColor: pulseBgLight }} />
                    <div className="space-y-2 mb-6">
                        <div className="h-3.5 rounded w-full" style={{ backgroundColor: pulseBgLight }} />
                        <div className="h-3.5 rounded w-5/6" style={{ backgroundColor: pulseBgLight }} />
                        <div className="h-3.5 rounded w-4/6" style={{ backgroundColor: pulseBgLight }} />
                    </div>
                    <div className="flex gap-2 mb-5">
                        <div className="h-11 w-36 rounded-xl" style={{ backgroundColor: pulseBgLight }} />
                        <div className="h-11 w-28 rounded-xl" style={{ backgroundColor: pulseBgLight }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-16 rounded-xl" style={{ backgroundColor: pulseBgLight }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ─── Error state ────────────────────────────────────────────
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-5" style={{ backgroundColor: pageBg }}>
                <p className="text-sm font-medium" style={{ color: textSecondary }}>
                    ⚠️ Failed to load resource: {error}
                </p>
                <button
                    onClick={handleBackToLibrary}
                    className="text-sm underline"
                    style={{ color: textSecondary }}
                >
                    ← Back to Library
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-5 py-6 flex flex-col items-center" style={{ backgroundColor: pageBg }}>
            <div className="w-full max-w-2xl">

                {/* ← Back */}
                <button
                    onClick={handleBackToLibrary}
                    className="flex items-center gap-1 text-sm transition-colors mb-4 cursor-pointer"
                    style={{ color: textSecondary }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = backHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = textSecondary; }}
                >
                    <ArrowLeft size={13} />
                    Back to Library
                </button>

                {/* ── Main Card ── */}
                <div className="rounded-2xl px-6 pt-6 pb-7 shadow-sm mb-5" style={{ backgroundColor: cardBg }}>

                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                        <span
                            className="flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide"
                            style={isDarkMode
                                ? { color: "#93c5fd", backgroundColor: "rgba(59,130,246,0.2)", border: "1px solid #2563eb" }
                                : { color: "#2563eb", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}
                        >
                            <BookOpen size={11} />
                            {data?.type || "Course"}
                        </span>
                        <span
                            className="flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full"
                            style={isDarkMode
                                ? { color: "#86efac", backgroundColor: "rgba(34,197,94,0.2)", border: "1px solid #15803d" }
                                : { color: "#15803d", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}
                        >
                            ✓ {data?.status || "Approved"}
                        </span>
                        {data?.track && (
                            <span className="text-[11px] font-medium px-3 py-1 rounded-full border" style={{ color: textPrimary, borderColor }}>
                                {data.track}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h1
                        className="leading-tight mb-3"
                        style={{ fontSize: "2rem", fontWeight: 900, fontFamily: "sans-serif", color: textPrimary }}
                    >
                        {data?.title}
                    </h1>

                    {/* Description */}
                    <p className="text-sm leading-relaxed mb-5" style={{ color: textSecondary }}>
                        {data?.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap mb-5">
                        <button
                            onClick={handleOpenResource}
                            className="flex items-center gap-2 bg-[#2C3E50] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1a2530] transition-colors cursor-pointer"
                        >
                            🔗 Open Resource
                        </button>
                        <button
                            onClick={handleCopyLink}
                            className="flex items-center gap-2 border text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                            style={{ borderColor, color: textPrimary, backgroundColor: btnSecondaryBg }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = btnSecondaryHover; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = btnSecondaryBg; }}
                        >
                            {copied ? "✓ Copied!" : "📋 Copy Link"}
                        </button>
                    </div>

                    {/* Meta Grid 2×2 */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: "TRACK", value: data?.track || "—" },
                            { label: "TYPE", value: data?.type || "—" },
                            { label: "RESOURCE TYPE ID", value: data?.resourceTypeId ?? "—" },
                            { label: "ADDED BY", value: data?.addedBy || "Community" },
                        ].map(({ label, value }) => (
                            <div key={label} className="rounded-xl px-4 py-3" style={{ backgroundColor: metaBoxBg }}>
                                <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: textSecondary }}>
                                    {label}
                                </p>
                                <p className="text-sm font-semibold" style={{ color: textPrimary }}>{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── More from Track ── */}
                {relatedResources.length > 0 && (
                    <>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-3 px-1" style={{ color: sectionLabel }}>
                            More from {data?.track} Track
                        </p>
                        <div className="flex flex-col gap-3">
                            {relatedResources.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onNavigate ? onNavigate(item.id) : navigate(`/library/${item.id}`)}
                                    className="rounded-2xl px-5 py-4 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow w-full text-left cursor-pointer"
                                    style={{ backgroundColor: cardBg }}
                                >
                                    <TypeIcon type={item.type} iconBg={typeIconBg} iconColor={typeIconColor} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate" style={{ color: textPrimary }}>
                                            {item.title}
                                        </p>
                                        <p className="text-xs" style={{ color: textSecondary }}>{item.type}</p>
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