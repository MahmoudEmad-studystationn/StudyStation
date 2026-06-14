import { useState, useEffect, useCallback } from "react";
import { useThemeContext } from "../Theme/ThemeContext";
import SidebarDashboard from "./SidebarDashboard";
import TopbarDashboard from "./Topbardashboard";
import { approveResourceApi, rejectResourceApi } from "../Services/resourceService";

const BASE_URL = "https://study-station.runasp.net/api";

const fetchPendingResources = async () => {
    const res = await fetch(`${BASE_URL}/Admin/resources`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
        },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const all = Array.isArray(data) ? data : data.data ?? [];
    return all.filter(r => r.status === "Pending");
};

const fetchApprovedResources = async () => {
    const res = await fetch(`${BASE_URL}/Admin/resources`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
        },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const all = Array.isArray(data) ? data : data.data ?? [];
    return all.filter(r => r.status === "Approved");
};

const deleteResourceRequest = async (id) => {
    const res = await fetch(`${BASE_URL}/Admin/resources/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
        },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
};

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconSearch = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const IconCheck = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, display: "inline", marginRight: 3 }}>
        <polyline points="20 6 9 17 4 12" />
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
const IconRefresh = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
);
const IconAllDone = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="9 12 11 14 15 10" />
    </svg>
);
const IconEmpty = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
);

const CATEGORY_MAP = { 1: "Frontend", 2: "Backend", 3: "AI / ML", 4: "Cyber Security", 5: "UI/UX" };
const TYPE_MAP     = { 1: "Videos", 2: "Articles", 3: "Books" };

export default function ResourcesPage() {
    const { isDarkMode } = useThemeContext();

    // ── Pending state ──────────────────────────────────────────────────────────
    const [resources, setResources]         = useState([]);
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState(null);

    // ── Approved state ─────────────────────────────────────────────────────────
    const [approvedResources, setApprovedResources] = useState([]);
    const [loadingApproved, setLoadingApproved]     = useState(false);
    const [errorApproved, setErrorApproved]         = useState(null);

    // ── Shared state ───────────────────────────────────────────────────────────
    const [activeTab, setActiveTab]         = useState("pending");
    const [query, setQuery]                 = useState("");
    const [processingIds, setProcessingIds] = useState(new Set());

    // ── Theme ──────────────────────────────────────────────────────────────────
    const bgColor     = isDarkMode ? "#171717" : "#F3F4F6";
    const surface     = isDarkMode ? "#2A2A2A" : "#ffffff";
    const surface2    = isDarkMode ? "#363636" : "#EAECF0";
    const surface3    = isDarkMode ? "#363636" : "#eef1f4";
    const border      = isDarkMode ? "#404040" : "rgba(44,62,80,0.08)";
    const border2     = isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(44,62,80,0.05)";
    const textPrimary = isDarkMode ? "#E0E0E0" : "#2f3b48";
    const muted       = isDarkMode ? "#B0B0B0" : "#6b6f76";
    const ocean       = "#3D718D";
    const shadow      = isDarkMode ? "0 8px 16px rgba(0,0,0,0.3)" : "0 8px 16px rgba(0,0,0,0.07)";

    // ── Loaders ────────────────────────────────────────────────────────────────
    const loadResources = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const pending = await fetchPendingResources();
            setResources(pending);
        } catch {
            setError("Failed to load resources.");
        } finally {
            setLoading(false);
        }
    }, []);

    const loadApproved = useCallback(async () => {
        setLoadingApproved(true);
        setErrorApproved(null);
        try {
            const approved = await fetchApprovedResources();
            setApprovedResources(approved);
        } catch {
            setErrorApproved("Failed to load approved resources.");
        } finally {
            setLoadingApproved(false);
        }
    }, []);

    useEffect(() => { loadResources(); }, [loadResources]);

    useEffect(() => {
        if (activeTab === "approved") loadApproved();
    }, [activeTab, loadApproved]);

    // ── Helpers ────────────────────────────────────────────────────────────────
    const startProcessing = (id) => setProcessingIds(prev => new Set([...prev, id]));
    const stopProcessing  = (id) => setProcessingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    const removeFromList  = (id, listSetter) => setTimeout(() => listSetter(prev => prev.filter(r => r.id !== id)), 300);

    const currentList = activeTab === "pending" ? resources : approvedResources;
    const isLoadingCurrent = activeTab === "pending" ? loading : loadingApproved;

    const filtered = currentList.filter(r =>
        (r.title || "").toLowerCase().includes(query.toLowerCase()) ||
        (CATEGORY_MAP[r.categoryId] || "").toLowerCase().includes(query.toLowerCase())
    );

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleApprove = async (id) => {
        startProcessing(id);
        const result = await approveResourceApi(id);
        if (result.message === "success") {
            removeFromList(id, setResources);
        } else {
            stopProcessing(id);
            alert("Failed to approve. Please try again.");
        }
    };

    const handleReject = async (id) => {
        startProcessing(id);
        const result = await rejectResourceApi(id);
        if (result.message === "success") {
            removeFromList(id, setResources);
        } else {
            stopProcessing(id);
            alert("Failed to reject. Please try again.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this resource?")) return;
        startProcessing(id);
        try {
            await deleteResourceRequest(id);
            removeFromList(id, setApprovedResources);
        } catch {
            stopProcessing(id);
            alert("Failed to delete. Please try again.");
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
                .spin { animation: spin .8s linear infinite; }
            `}</style>

            <SidebarDashboard />
            <TopbarDashboard breadcrumb="Resources" />

            <main style={{
                marginLeft: 230, marginTop: 60,
                height: "calc(100vh - 60px)", overflowY: "auto",
                padding: "1.75rem", background: bgColor,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                WebkitFontSmoothing: "antialiased",
            }}>
                {/* ── Header ── */}
                <div style={{ marginBottom: "1.25rem" }}>
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: textPrimary, letterSpacing: "-.03em" }}>
                        Resources
                    </div>
                    <div style={{ fontSize: ".8rem", color: muted, fontWeight: 500, marginTop: 3 }}>
                        Review, approve, and manage community-submitted resources.
                    </div>
                </div>

                {/* ── Tabs ── */}
                <div style={{ display: "flex", gap: ".5rem", marginBottom: "1.25rem" }}>
                    {[
                        { key: "pending",  label: "Pending",  count: resources.length },
                        { key: "approved", label: "Approved", count: approvedResources.length },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveTab(tab.key); setQuery(""); }}
                            style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                padding: "6px 16px", borderRadius: 10,
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                fontSize: ".78rem", fontWeight: 700, cursor: "pointer",
                                border: activeTab === tab.key ? "none" : `1px solid ${border}`,
                                background: activeTab === tab.key ? ocean : surface2,
                                color: activeTab === tab.key ? "#fff" : muted,
                                transition: "all .2s",
                            }}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span style={{
                                    background: activeTab === tab.key ? "rgba(255,255,255,.25)" : border,
                                    color: activeTab === tab.key ? "#fff" : muted,
                                    borderRadius: 999, padding: "1px 7px",
                                    fontSize: ".65rem", fontWeight: 800,
                                }}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Search + Refresh ── */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem" }}>
                    <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
                        <span style={{ position: "absolute", left: ".75rem", top: "50%", transform: "translateY(-50%)", color: muted, pointerEvents: "none" }}>
                            <IconSearch />
                        </span>
                        <input
                            type="text" placeholder="Search resources..."
                            value={query} onChange={e => setQuery(e.target.value)}
                            style={{
                                width: "100%", padding: ".6rem .75rem .6rem 2.25rem",
                                borderRadius: 10, border: `1px solid ${border}`,
                                background: surface, fontFamily: "'Plus Jakarta Sans', sans-serif",
                                fontSize: ".82rem", color: textPrimary, outline: "none",
                            }}
                        />
                    </div>
                    <button
                        onClick={activeTab === "pending" ? loadResources : loadApproved}
                        title="Refresh"
                        style={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            width: 36, height: 36, borderRadius: 10,
                            background: surface2, border: `1px solid ${border}`,
                            color: muted, cursor: "pointer",
                        }}
                    >
                        <span className={isLoadingCurrent ? "spin" : ""}><IconRefresh /></span>
                    </button>
                </div>

                {/* ── Error banner ── */}
                {(error || errorApproved) && (
                    <div style={{
                        marginBottom: "1rem", padding: ".75rem 1rem", borderRadius: 10,
                        background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.2)",
                        color: "#dc2626", fontSize: ".8rem", fontWeight: 600,
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                        <span>⚠ {error || errorApproved}</span>
                        <button
                            onClick={activeTab === "pending" ? loadResources : loadApproved}
                            style={{ background: "none", border: "none", color: "#dc2626", fontWeight: 700, cursor: "pointer", fontSize: ".78rem" }}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* ── Table ── */}
                <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, boxShadow: shadow, overflow: "hidden" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".82rem" }}>
                            <thead>
                                <tr style={{ background: surface3, borderBottom: `1px solid ${border}` }}>
                                    {["Title", "Category", "Type", "Pricing", "Actions"].map(h => (
                                        <th key={h} style={{
                                            padding: ".75rem 1rem", textAlign: "left",
                                            fontSize: ".68rem", fontWeight: 700, color: muted,
                                            textTransform: "uppercase", letterSpacing: ".06em", whiteSpace: "nowrap",
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {isLoadingCurrent && currentList.length === 0 ? (
                                    <tr><td colSpan={5} style={{ padding: "2.5rem", textAlign: "center", color: muted, fontSize: ".82rem" }}>
                                        <span className="spin" style={{ display: "inline-block", marginRight: 8 }}><IconRefresh /></span>
                                        Loading resources…
                                    </td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: muted, fontSize: ".82rem" }}>
                                        <div style={{ display: "flex", justifyContent: "center", marginBottom: ".5rem", color: muted }}>
                                            {activeTab === "pending" ? <IconAllDone /> : <IconEmpty />}
                                        </div>
                                        {activeTab === "pending"
                                            ? "No pending resources — all caught up!"
                                            : "No approved resources found."}
                                    </td></tr>
                                ) : filtered.map((r, i) => {
                                    const isProcessing = processingIds.has(r.id);
                                    const categoryName = r.category || CATEGORY_MAP[r.categoryId] || "—";
                                    const typeName     = TYPE_MAP[r.resourceTypeId] || "—";
                                    return (
                                        <tr key={r.id} style={{
                                            borderBottom: i < filtered.length - 1 ? `1px solid ${border2}` : "none",
                                            opacity: isProcessing ? 0.4 : 1,
                                            transition: "opacity .3s, background .15s",
                                        }}
                                            onMouseEnter={e => !isProcessing && (e.currentTarget.style.background = surface3)}
                                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                                        >
                                            {/* Title */}
                                            <td style={{ padding: ".85rem 1rem", verticalAlign: "middle", maxWidth: 240 }}>
                                                <a href={r.url} target="_blank" rel="noopener noreferrer"
                                                    style={{ fontWeight: 700, color: ocean, fontSize: ".82rem", textDecoration: "none", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {r.title}
                                                </a>
                                                {r.description && (
                                                    <div style={{ fontSize: ".72rem", color: muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.description}</div>
                                                )}
                                            </td>

                                            {/* Category */}
                                            <td style={{ padding: ".85rem 1rem", verticalAlign: "middle" }}>
                                                <span style={{
                                                    display: "inline-flex", alignItems: "center",
                                                    padding: "3px 9px", borderRadius: 999,
                                                    fontSize: ".68rem", fontWeight: 700,
                                                    background: "rgba(61,113,141,.1)", color: ocean,
                                                }}>{categoryName}</span>
                                            </td>

                                            {/* Type */}
                                            <td style={{ padding: ".85rem 1rem", verticalAlign: "middle" }}>
                                                <span style={{
                                                    display: "inline-flex", alignItems: "center",
                                                    padding: "3px 9px", borderRadius: 999,
                                                    fontSize: ".68rem", fontWeight: 700,
                                                    background: isDarkMode ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.05)",
                                                    color: muted,
                                                }}>{typeName}</span>
                                            </td>

                                            {/* Pricing */}
                                            <td style={{ padding: ".85rem 1rem", verticalAlign: "middle" }}>
                                                <span style={{
                                                    display: "inline-flex", alignItems: "center", gap: 4,
                                                    padding: "3px 9px", borderRadius: 999,
                                                    fontSize: ".68rem", fontWeight: 700,
                                                    background: r.type === "Free" ? "rgba(34,197,94,.1)" : "rgba(245,158,11,.1)",
                                                    color: r.type === "Free" ? "#16a34a" : "#d97706",
                                                }}>
                                                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: r.type === "Free" ? "#16a34a" : "#d97706", display: "inline-block" }} />
                                                    {r.type || "—"}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td style={{ padding: ".85rem 1rem", verticalAlign: "middle" }}>
                                                <div style={{ display: "flex", gap: ".4rem" }}>
                                                    {activeTab === "pending" ? (
                                                        <>
                                                            {/* Accept */}
                                                            <button
                                                                onClick={() => handleApprove(r.id)}
                                                                disabled={isProcessing}
                                                                style={{
                                                                    padding: "5px 11px", borderRadius: 8,
                                                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                                                    fontSize: ".72rem", fontWeight: 700,
                                                                    cursor: isProcessing ? "not-allowed" : "pointer",
                                                                    border: "1px solid rgba(34,197,94,.25)",
                                                                    background: "rgba(34,197,94,.1)", color: "#16a34a",
                                                                    transition: "all .2s", display: "inline-flex", alignItems: "center",
                                                                    opacity: isProcessing ? 0.5 : 1,
                                                                }}
                                                                onMouseEnter={e => !isProcessing && (e.currentTarget.style.background = "rgba(34,197,94,.2)")}
                                                                onMouseLeave={e => (e.currentTarget.style.background = "rgba(34,197,94,.1)")}
                                                            >
                                                                <IconCheck />Accept
                                                            </button>

                                                            {/* Reject */}
                                                            <button
                                                                onClick={() => handleReject(r.id)}
                                                                disabled={isProcessing}
                                                                style={{
                                                                    padding: "5px 11px", borderRadius: 8,
                                                                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                                                                    fontSize: ".72rem", fontWeight: 700,
                                                                    cursor: isProcessing ? "not-allowed" : "pointer",
                                                                    border: "1px solid rgba(248,113,113,.2)",
                                                                    background: "rgba(248,113,113,.1)", color: "#dc2626",
                                                                    transition: "all .2s", display: "inline-flex", alignItems: "center",
                                                                    opacity: isProcessing ? 0.5 : 1,
                                                                }}
                                                                onMouseEnter={e => !isProcessing && (e.currentTarget.style.background = "rgba(248,113,113,.2)")}
                                                                onMouseLeave={e => (e.currentTarget.style.background = "rgba(248,113,113,.1)")}
                                                            >
                                                                <IconTrash />Reject
                                                            </button>
                                                        </>
                                                    ) : (
                                                        /* Delete */
                                                        <button
                                                            onClick={() => handleDelete(r.id)}
                                                            disabled={isProcessing}
                                                            style={{
                                                                padding: "5px 11px", borderRadius: 8,
                                                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                                                fontSize: ".72rem", fontWeight: 700,
                                                                cursor: isProcessing ? "not-allowed" : "pointer",
                                                                border: "1px solid rgba(220,38,38,.25)",
                                                                background: "rgba(220,38,38,.1)", color: "#dc2626",
                                                                transition: "all .2s", display: "inline-flex", alignItems: "center",
                                                                opacity: isProcessing ? 0.5 : 1,
                                                            }}
                                                            onMouseEnter={e => !isProcessing && (e.currentTarget.style.background = "rgba(220,38,38,.2)")}
                                                            onMouseLeave={e => (e.currentTarget.style.background = "rgba(220,38,38,.1)")}
                                                        >
                                                            <IconTrash />Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </>
    );
}