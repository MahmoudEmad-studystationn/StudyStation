import { useState } from "react";
import { useThemeContext } from "../Theme/ThemeContext";
import SidebarDashboard from "./SidebarDashboard";
import TopbarDashboard from "./Topbardashboard";

// ── Initial Data ───────────────────────────────────────────────────────────
const initialUsers = [
    { id: 1, name: "Sara Ahmed", email: "sara.ahmed@email.com", initials: "SA", av: "a", role: "Admin", status: "Active" },
    { id: 2, name: "Khaled Mostafa", email: "khaled.m@email.com", initials: "KM", av: "b", role: "User", status: "Active" },
    { id: 3, name: "Nour Omar", email: "nour.omar@email.com", initials: "NO", av: "c", role: "User", status: "Active" },
    { id: 4, name: "Mohamed Yasser", email: "m.yasser@email.com", initials: "MY", av: "d", role: "User", status: "Suspended" },
    { id: 5, name: "Layla Hassan", email: "layla.h@email.com", initials: "LH", av: "e", role: "User", status: "Active" },
    { id: 6, name: "Omar Sherif", email: "omar.sherif@email.com", initials: "OS", av: "f", role: "Admin", status: "Active" },
];

const avColors = {
    a: "#3D718D",
    b: "#658FA5",
    c: "#2C3E50",
    d: "#8FB7CC",
    e: "rgba(61,113,141,0.85)",
    f: "rgba(101,143,165,0.75)",
};

// ── Badge ──────────────────────────────────────────────────────────────────
function Badge({ type }) {
    const styles = {
        Active: { bg: "rgba(34,197,94,.12)", color: "#16a34a", dot: "#22c55e" },
        Suspended: { bg: "rgba(248,113,113,.12)", color: "#dc2626", dot: "#f87171" },
        Admin: { bg: "rgba(61,113,141,.15)", color: "#3D718D", dot: "#3D718D" },
        User: { bg: "rgba(104,104,104,.1)", color: "#686868", dot: "#686868" },
    };
    const s = styles[type];
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 999, fontSize: ".68rem", fontWeight: 700, whiteSpace: "nowrap", background: s.bg, color: s.color }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
            {type}
        </span>
    );
}

// ── UserRow ────────────────────────────────────────────────────────────────
function UserRow({ user, surface3, borderFaint, textPrimary, onRoleChange, onToggleStatus }) {
    return (
        <tr
            style={{ borderBottom: `1px solid ${borderFaint}`, transition: "background .15s" }}
            onMouseEnter={e => e.currentTarget.style.background = surface3}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
            <td style={{ padding: ".85rem 1rem", verticalAlign: "middle" }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".65rem", fontWeight: 800, color: "#fff", flexShrink: 0, background: avColors[user.av] }}>
                        {user.initials}
                    </div>
                    <span style={{ fontWeight: 700, color: textPrimary, fontSize: ".82rem" }}>{user.name}</span>
                </div>
            </td>
            <td style={{ padding: ".85rem 1rem", verticalAlign: "middle", color: "#8A9BAA", fontSize: ".78rem" }}>
                {user.email}
            </td>
            <td style={{ padding: ".85rem 1rem", verticalAlign: "middle" }}>
                <Badge type={user.role} />
            </td>
            <td style={{ padding: ".85rem 1rem", verticalAlign: "middle" }}>
                <Badge type={user.status} />
            </td>
            <td style={{ padding: ".85rem 1rem", verticalAlign: "middle" }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
                    <select
                        value={user.role}
                        onChange={e => onRoleChange(user.id, e.target.value)}
                        style={{ padding: "5px 10px", borderRadius: 8, border: `1px solid ${borderFaint}`, background: surface3, fontFamily: "'Sora', sans-serif", fontSize: ".72rem", fontWeight: 600, color: textPrimary, cursor: "pointer", outline: "none" }}
                    >
                        <option>User</option>
                        <option>Admin</option>
                    </select>
                    <button
                        onClick={() => onToggleStatus(user.id)}
                        style={{
                            padding: "5px 11px", borderRadius: 8, fontFamily: "'Sora', sans-serif",
                            fontSize: ".72rem", fontWeight: 700, cursor: "pointer",
                            border: "1px solid transparent", transition: "all .2s", whiteSpace: "nowrap",
                            background: user.status === "Active" ? "rgba(251,191,36,.1)" : "#3D718D",
                            color: user.status === "Active" ? "#b45309" : "#fff",
                            borderColor: user.status === "Active" ? "rgba(251,191,36,.2)" : "#3D718D",
                        }}
                    >
                        {user.status === "Active" ? "Suspend" : "Activate"}
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function UsersPage() {
    const { isDarkMode } = useThemeContext();
    const [users, setUsers] = useState(initialUsers);
    const [query, setQuery] = useState("");

    // ── Theme tokens — same pattern as Dashboard ──
    const bgColor = isDarkMode ? "#171717" : "#F3F4F6";
    const cardBg = isDarkMode ? "#2A2A2A" : "#ffffff";
    const borderFaint = isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(44,62,80,0.08)";
    const textPrimary = isDarkMode ? "#E0E0E0" : "#2f3b48";
    const textMuted = isDarkMode ? "#B0B0B0" : "#6b6f76";
    const surface3 = isDarkMode ? "#363636" : "#eef1f4";
    const cardShadow = isDarkMode ? "0 8px 16px rgba(0,0,0,0.3)" : "0 8px 16px rgba(0,0,0,0.07)";

    // ── Handlers ──
    const handleRoleChange = (id, role) =>
        setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));

    const handleToggleStatus = (id) =>
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" } : u));

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');`}</style>

            {/* Shared layout — same as Dashboard */}
            <SidebarDashboard />
            <TopbarDashboard />

            {/* ── Main ── */}
            <main style={{
                marginLeft: 230, marginTop: 60,
                height: "calc(100vh - 60px)",
                overflowY: "auto", padding: "1.75rem",
                background: bgColor,
                fontFamily: "'Sora', sans-serif",
            }}>

                {/* Page Header */}
                <div style={{ marginBottom: "1.5rem" }}>
                    <div style={{ fontSize: "1.3rem", fontWeight: 700, color: textPrimary, letterSpacing: "-0.02em" }}>
                        Users Management
                    </div>
                    <div style={{ fontSize: "0.8rem", color: textMuted, fontWeight: 500, marginTop: 3 }}>
                        Manage accounts, roles, and access.
                    </div>
                </div>

                {/* Search */}
                <div style={{ marginBottom: "1rem" }}>
                    <div style={{ position: "relative", maxWidth: 340 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                            style={{ width: 15, height: 15, color: textMuted, position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            style={{
                                width: "100%", padding: ".6rem .75rem .6rem 2.25rem",
                                borderRadius: 10, border: `1px solid ${borderFaint}`,
                                background: cardBg, fontFamily: "'Sora', sans-serif",
                                fontSize: ".82rem", color: textPrimary, outline: "none",
                                transition: "border-color .2s",
                            }}
                        />
                    </div>
                </div>

                {/* Table Card */}
                <div style={{ background: cardBg, border: `1px solid ${borderFaint}`, borderRadius: 14, boxShadow: cardShadow, overflow: "hidden" }}>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".82rem" }}>
                            <thead>
                                <tr style={{ background: surface3, borderBottom: `1px solid ${borderFaint}` }}>
                                    {["Name", "Email", "Role", "Status", "Actions"].map(h => (
                                        <th key={h} style={{ padding: ".75rem 1rem", textAlign: "left", fontSize: ".68rem", fontWeight: 700, color: textMuted, textTransform: "uppercase", letterSpacing: ".06em", whiteSpace: "nowrap" }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(user => (
                                    <UserRow
                                        key={user.id}
                                        user={user}
                                        surface3={surface3}
                                        borderFaint={borderFaint}
                                        textPrimary={textPrimary}
                                        onRoleChange={handleRoleChange}
                                        onToggleStatus={handleToggleStatus}
                                    />
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: textMuted, fontSize: ".82rem" }}>
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </>
    );
}