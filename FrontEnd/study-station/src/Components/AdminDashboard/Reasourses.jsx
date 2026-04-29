import { useState } from "react";
import { useThemeContext } from "../Theme/ThemeContext";
import SidebarDashboard from "./SidebarDashboard";
import TopbarDashboard from "./Topbardashboard";

// ── Initial Data ─────────────────────────────────────────────────────────────
const initialResources = [
    { id: 1, title: "Algorithms Cheat Sheet", category: "Algorithms" },
    { id: 2, title: "Data Structures Deep Dive", category: "Data Structures" },
    { id: 3, title: "Discrete Mathematics Notes", category: "Mathematics" },
    { id: 4, title: "Python Crash Course PDF", category: "Programming" },
    { id: 5, title: "OS Concepts — Silberschatz", category: "Operating Systems" },
    { id: 6, title: "SQL Fundamentals Guide", category: "Databases" },
];

const CATEGORIES = [
    "Algorithms", "Data Structures", "Mathematics",
    "Programming", "Operating Systems", "Databases", "Networks", "Other",
];

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconSearch = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const IconPlus = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);
const IconTrash = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ width: 12, height: 12, display: "inline", marginRight: 3 }}>
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6" /><path d="M14 11v6" />
    </svg>
);
const IconClose = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

// ── ResourcesPage ─────────────────────────────────────────────────────────────
export default function ResourcesPage() {
    const { isDarkMode } = useThemeContext();
    const [resources, setResources] = useState(initialResources);
    const [query, setQuery] = useState("");
    const [deletingIds, setDeletingIds] = useState(new Set());
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ title: "", category: "", link: "" });

    // ── Theme tokens ──
    const bgColor     = isDarkMode ? "#111820" : "#F3F4F6";
    const surface     = isDarkMode ? "#1a2330" : "#ffffff";
    const surface2    = isDarkMode ? "#1f2d3d" : "#EAECF0";
    const surface3    = isDarkMode ? "#162030" : "#f5f6f8";
    const border      = isDarkMode ? "rgba(143,183,204,0.1)" : "rgba(44,62,80,0.08)";
    const border2     = isDarkMode ? "rgba(143,183,204,0.06)" : "rgba(44,62,80,0.05)";
    const textPrimary = isDarkMode ? "#e8edf2" : "#1C2B38";
    const text2       = isDarkMode ? "#9eb4c4" : "#4A5568";
    const muted       = isDarkMode ? "#5a7a8e" : "#8A9BAA";
    const ocean       = "#3D718D";
    const shadow      = isDarkMode
        ? "0 1px 3px rgba(0,0,0,0.3), 0 3px 10px rgba(0,0,0,0.2)"
        : "0 1px 3px rgba(44,62,80,0.06), 0 3px 10px rgba(44,62,80,0.06)";

    const filtered = resources.filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.category.toLowerCase().includes(query.toLowerCase())
    );

    const handleDelete = (id) => {
        setDeletingIds(prev => new Set([...prev, id]));
        setTimeout(() => {
            setResources(prev => prev.filter(r => r.id !== id));
            setDeletingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
        }, 250);
    };

    const handleAdd = () => {
        if (!form.title.trim() || !form.category) return;
        setResources(prev => [{ id: Date.now(), title: form.title.trim(), category: form.category }, ...prev]);
        setModalOpen(false);
        setForm({ title: "", category: "", link: "" });
    };

    const inputStyle = {
        width: "100%", padding: ".65rem .85rem", borderRadius: 10,
        border: `1px solid ${border}`, background: surface3,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: ".82rem", color: textPrimary, outline: "none",
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <SidebarDashboard />
            <TopbarDashboard breadcrumb="Resources" />

            <main style={{
                marginLeft: 230,
                marginTop: 60,
                height: "calc(100vh - 60px)",
                overflowY: "auto",
                padding: "1.75rem",
                background: bgColor,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                WebkitFontSmoothing: "antialiased",
            }}>
                {/* Page Header */}
                <div style={{ marginBottom: "1.5rem" }}>
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: textPrimary, letterSpacing: "-.03em" }}>
                        Resources
                    </div>
                    <div style={{ fontSize: ".8rem", color: muted, fontWeight: 500, marginTop: 3 }}>
                        All learning materials on the platform.
                    </div>
                </div>

                {/* Toolbar */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem" }}>
                    <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
                        <span style={{ position: "absolute", left: ".75rem", top: "50%", transform: "translateY(-50%)", color: muted, pointerEvents: "none" }}>
                            <IconSearch />
                        </span>
                        <input
                            type="text"
                            placeholder="Search resources..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            style={{
                                width: "100%", padding: ".6rem .75rem .6rem 2.25rem",
                                borderRadius: 10, border: `1px solid ${border}`,
                                background: surface, fontFamily: "'Plus Jakarta Sans', sans-serif",
                                fontSize: ".82rem", color: textPrimary, outline: "none",
                            }}
                        />
                    </div>
                    <button
                        onClick={() => setModalOpen(true)}
                        style={{
                            display: "flex", alignItems: "center", gap: ".4rem",
                            padding: ".6rem 1.1rem", borderRadius: 10,
                            background: ocean, color: "#fff", border: "none",
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontSize: ".8rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                        }}
                    >
                        <IconPlus /> Add Resource
                    </button>
                </div>

                {/* Table Card */}
                <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, boxShadow: shadow, overflow: "hidden" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".82rem" }}>
                            <thead>
                                <tr style={{ background: surface3, borderBottom: `1px solid ${border}` }}>
                                    {["Title", "Category", "Status", "Actions"].map(h => (
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
                                {filtered.map((r, i) => (
                                    <tr
                                        key={r.id}
                                        style={{
                                            borderBottom: i < filtered.length - 1 ? `1px solid ${border2}` : "none",
                                            opacity: deletingIds.has(r.id) ? 0 : 1,
                                            transition: "opacity .25s, background .15s",
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = surface3}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        <td style={{ padding: ".85rem 1rem", color: text2, verticalAlign: "middle" }}>
                                            <div style={{ fontWeight: 700, color: textPrimary, fontSize: ".82rem" }}>{r.title}</div>
                                        </td>
                                        <td style={{ padding: ".85rem 1rem", verticalAlign: "middle" }}>
                                            <span style={{
                                                display: "inline-flex", alignItems: "center", gap: 4,
                                                padding: "3px 9px", borderRadius: 999,
                                                fontSize: ".68rem", fontWeight: 700,
                                                background: "rgba(61,113,141,.1)", color: ocean,
                                            }}>
                                                {r.category}
                                            </span>
                                        </td>
                                        <td style={{ padding: ".85rem 1rem", verticalAlign: "middle" }}>
                                            <span style={{
                                                display: "inline-flex", alignItems: "center", gap: 4,
                                                padding: "3px 9px", borderRadius: 999,
                                                fontSize: ".68rem", fontWeight: 700,
                                                background: "rgba(61,113,141,.12)", color: ocean,
                                            }}>
                                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#658FA5", display: "inline-block" }} />
                                                Published
                                            </span>
                                        </td>
                                        <td style={{ padding: ".85rem 1rem", verticalAlign: "middle" }}>
                                            <button
                                                onClick={() => handleDelete(r.id)}
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
                                                <IconTrash />Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: muted, fontSize: ".82rem" }}>
                                            No resources found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Add Resource Modal */}
            {modalOpen && (
                <div
                    onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}
                    style={{
                        position: "fixed", inset: 0,
                        background: "rgba(28,43,56,.45)", backdropFilter: "blur(4px)",
                        zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                >
                    <div style={{
                        background: surface, borderRadius: 20,
                        boxShadow: "0 20px 60px rgba(28,43,56,.25)",
                        width: "100%", maxWidth: 440, padding: "1.75rem",
                        animation: "slideUp .25s ease",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>
                        {/* Modal Header */}
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                            <div>
                                <div style={{ fontSize: "1rem", fontWeight: 800, color: textPrimary }}>Add New Resource</div>
                                <div style={{ fontSize: ".75rem", color: muted, marginTop: 2 }}>Fill in the details below to publish.</div>
                            </div>
                            <button
                                onClick={() => setModalOpen(false)}
                                style={{
                                    width: 28, height: 28, borderRadius: 8, background: surface2,
                                    border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: "pointer", color: muted, flexShrink: 0,
                                }}
                            >
                                <IconClose />
                            </button>
                        </div>

                        {/* Form */}
                        <div style={{ marginBottom: "1rem" }}>
                            <label style={{ display: "block", fontSize: ".75rem", fontWeight: 700, color: text2, marginBottom: ".4rem", letterSpacing: ".02em" }}>
                                Title
                            </label>
                            <input
                                style={inputStyle}
                                type="text"
                                placeholder="e.g. Data Structures Cheat Sheet"
                                value={form.title}
                                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            />
                        </div>
                        <div style={{ marginBottom: "1rem" }}>
                            <label style={{ display: "block", fontSize: ".75rem", fontWeight: 700, color: text2, marginBottom: ".4rem", letterSpacing: ".02em" }}>
                                Category
                            </label>
                            <select
                                style={inputStyle}
                                value={form.category}
                                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                            >
                                <option value="">Select category...</option>
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div style={{ marginBottom: "1rem" }}>
                            <label style={{ display: "block", fontSize: ".75rem", fontWeight: 700, color: text2, marginBottom: ".4rem", letterSpacing: ".02em" }}>
                                Link / URL
                            </label>
                            <input
                                style={inputStyle}
                                type="url"
                                placeholder="https://example.com/resource"
                                value={form.link}
                                onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                            />
                        </div>

                        {/* Modal Footer */}
                        <div style={{ display: "flex", gap: ".65rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
                            <button
                                onClick={() => setModalOpen(false)}
                                style={{
                                    padding: "7px 14px", borderRadius: 8,
                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                    fontSize: ".78rem", fontWeight: 700, cursor: "pointer",
                                    border: `1px solid ${border}`, background: surface2, color: text2,
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAdd}
                                style={{
                                    padding: "7px 14px", borderRadius: 8,
                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                    fontSize: ".78rem", fontWeight: 700, cursor: "pointer",
                                    border: `1px solid ${ocean}`, background: ocean, color: "#fff",
                                }}
                            >
                                Publish Resource
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}