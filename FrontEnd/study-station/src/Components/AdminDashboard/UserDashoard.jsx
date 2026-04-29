import { useState, useEffect } from "react";

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

// ── SVG Icons ──────────────────────────────────────────────────────────────
const BookIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, color: "#fff" }}>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
);

const DashboardIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
);

const UsersIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const ResourcesIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
);

const ShieldIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const SearchIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15, color: "var(--muted)", position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const LogoutIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

const MoonIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

const SunIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);

// ── Badge Component ────────────────────────────────────────────────────────
function Badge({ type }) {
    const styles = {
        Active: { bg: "rgba(34,197,94,.12)", color: "#16a34a", dot: "#22c55e", label: "Active" },
        Suspended: { bg: "rgba(248,113,113,.12)", color: "#dc2626", dot: "#f87171", label: "Suspended" },
        Admin: { bg: "rgba(61,113,141,.15)", color: "#3D718D", dot: "#3D718D", label: "Admin" },
        User: { bg: "rgba(104,104,104,.1)", color: "#686868", dot: "#686868", label: "User" },
    };
    const s = styles[type];
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 999, fontSize: ".68rem", fontWeight: 700, whiteSpace: "nowrap", background: s.bg, color: s.color }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
            {s.label}
        </span>
    );
}

// ── UserRow Component ──────────────────────────────────────────────────────
function UserRow({ user, onRoleChange, onToggleStatus }) {
    return (
        <tr style={{ borderBottom: "1px solid var(--border2)", transition: "background .15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--surface3)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <td style={{ padding: ".85rem 1rem", color: "var(--text2)", verticalAlign: "middle" }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".65rem", fontWeight: 800, color: "#fff", flexShrink: 0, background: avColors[user.av] }}>
                        {user.initials}
                    </div>
                    <span style={{ fontWeight: 700, color: "var(--text)", fontSize: ".82rem" }}>{user.name}</span>
                </div>
            </td>
            <td style={{ padding: ".85rem 1rem", color: "var(--muted)", fontSize: ".78rem", verticalAlign: "middle" }}>{user.email}</td>
            <td style={{ padding: ".85rem 1rem", verticalAlign: "middle" }}><Badge type={user.role} /></td>
            <td style={{ padding: ".85rem 1rem", verticalAlign: "middle" }}><Badge type={user.status} /></td>
            <td style={{ padding: ".85rem 1rem", verticalAlign: "middle" }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
                    <select
                        value={user.role}
                        onChange={e => onRoleChange(user.id, e.target.value)}
                        style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface2)", fontFamily: "inherit", fontSize: ".72rem", fontWeight: 600, color: "var(--text)", cursor: "pointer", outline: "none" }}>
                        <option>User</option>
                        <option>Admin</option>
                    </select>
                    <button
                        onClick={() => onToggleStatus(user.id)}
                        style={{
                            padding: "5px 11px", borderRadius: 8, fontFamily: "inherit", fontSize: ".72rem", fontWeight: 700, cursor: "pointer", border: "1px solid transparent", transition: "all .2s", whiteSpace: "nowrap",
                            background: user.status === "Active" ? "rgba(251,191,36,.1)" : "var(--ocean)",
                            color: user.status === "Active" ? "#b45309" : "#fff",
                            borderColor: user.status === "Active" ? "rgba(251,191,36,.2)" : "var(--ocean)",
                        }}>
                        {user.status === "Active" ? "Suspend" : "Activate"}
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function UsersPage() {
    const [dark, setDark] = useState(() => localStorage.getItem("dark") === "1");
    const [users, setUsers] = useState(initialUsers);
    const [query, setQuery] = useState("");
    const [activePage, setActivePage] = useState("users");

    useEffect(() => {
        localStorage.setItem("dark", dark ? "1" : "0");
    }, [dark]);

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
    );

    const handleRoleChange = (id, role) =>
        setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));

    const handleToggleStatus = (id) =>
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" } : u));

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) alert("Logged out successfully!");
    };

    // CSS variables injected via a style tag
    const cssVars = dark ? `
    :root { color-scheme: dark; }
    body { background: #111820; }
    .ss-app {
      --bg:#111820; --surface:#1a2330; --surface2:#1f2d3d; --surface3:#162030;
      --text:#e8edf2; --text2:#9eb4c4; --muted:#5a7a8e;
      --border:rgba(143,183,204,.1); --border2:rgba(143,183,204,.06);
      --ocean:#3D718D; --sh-sm:0 1px 3px rgba(0,0,0,.3),0 3px 10px rgba(0,0,0,.2);
    }
  ` : `
    .ss-app {
      --bg:#F3F4F6; --surface:#ffffff; --surface2:#EAECF0; --surface3:#f5f6f8;
      --text:#1C2B38; --text2:#4A5568; --muted:#8A9BAA;
      --border:rgba(44,62,80,.08); --border2:rgba(44,62,80,.05);
      --ocean:#3D718D; --sh-sm:0 1px 3px rgba(44,62,80,.06),0 3px 10px rgba(44,62,80,.06);
    }
  `;

    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: <DashboardIcon />, badge: null },
        { id: "users", label: "Users", icon: <UsersIcon />, badge: "128" },
        { id: "resources", label: "Resources", icon: <ResourcesIcon />, badge: "47" },
        { id: "moderation", label: "Moderation", icon: <ShieldIcon />, badge: "6" },
    ];

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300&display=swap');
        ${cssVars}
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .ss-app { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); color: var(--text); height: 100vh; overflow: hidden; -webkit-font-smoothing: antialiased; }
      `}</style>

            <div className="ss-app" style={{ display: "flex" }}>

                {/* ── Sidebar ── */}
                <aside style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 230, background: "#2C3E50", display: "flex", flexDirection: "column", zIndex: 200 }}>
                    {/* Logo */}
                    <div style={{ height: 60, display: "flex", alignItems: "center", gap: ".65rem", padding: "0 1.25rem", borderBottom: "1px solid rgba(255,255,255,.07)", flexShrink: 0 }}>
                        <div style={{ width: 32, height: 32, background: "#3D718D", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <BookIcon />
                        </div>
                        <div>
                            <div style={{ fontSize: ".82rem", fontWeight: 800, color: "#fff", letterSpacing: "-.01em" }}>Study Station</div>
                            <div style={{ fontSize: ".6rem", fontWeight: 600, color: "rgba(255,255,255,.35)", letterSpacing: ".08em", textTransform: "uppercase" }}>Admin Panel</div>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav style={{ flex: 1, padding: "1rem .75rem", display: "flex", flexDirection: "column", gap: ".25rem", overflowY: "auto" }}>
                        <div style={{ fontSize: ".6rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(255,255,255,.25)", padding: ".5rem .5rem .25rem", marginTop: ".25rem" }}>Overview</div>
                        {navItems.slice(0, 1).map(item => (
                            <NavItem key={item.id} item={item} active={activePage === item.id} onClick={() => setActivePage(item.id)} />
                        ))}
                        <div style={{ fontSize: ".6rem", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(255,255,255,.25)", padding: ".5rem .5rem .25rem", marginTop: ".25rem" }}>Management</div>
                        {navItems.slice(1).map(item => (
                            <NavItem key={item.id} item={item} active={activePage === item.id} onClick={() => setActivePage(item.id)} />
                        ))}
                    </nav>

                    {/* Footer */}
                    <div style={{ padding: ".75rem", borderTop: "1px solid rgba(255,255,255,.07)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: ".65rem", padding: ".5rem .75rem" }}>
                            <div style={{ width: 36, height: 36, background: "#3D718D", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".7rem", fontWeight: 800, color: "#fff", flexShrink: 0, border: "2px solid rgba(255,255,255,.2)" }}>MM</div>
                            <div>
                                <div style={{ fontSize: ".78rem", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Mariam Mohammed</div>
                                <div style={{ fontSize: ".62rem", color: "rgba(255,255,255,.35)", fontWeight: 500 }}>Super Admin</div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{ display: "flex", alignItems: "center", gap: ".5rem", width: "100%", padding: ".55rem .75rem", borderRadius: 10, background: "transparent", border: "none", color: "rgba(255,255,255,.4)", fontFamily: "inherit", fontSize: ".78rem", fontWeight: 600, cursor: "pointer", marginTop: ".35rem", transition: "all .2s" }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(248,113,113,.1)"; e.currentTarget.style.color = "#f87171"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,.4)"; }}>
                            <LogoutIcon /> Logout
                        </button>
                    </div>
                </aside>

                {/* ── Topbar ── */}
                <header style={{ position: "fixed", top: 0, left: 230, right: 0, height: 60, background: "var(--surface)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 1.5rem", gap: "1rem", zIndex: 100, boxShadow: "var(--sh-sm)" }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: ".5rem" }}>
                        <span style={{ fontSize: ".72rem", fontWeight: 600, color: "var(--muted)" }}>Study Station</span>
                        <span style={{ color: "var(--muted)", fontSize: ".8rem" }}>/</span>
                        <span style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--text)" }}>Users</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: ".65rem" }}>
                        <button
                            onClick={() => setDark(d => !d)}
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text2)", transition: "all .2s" }}>
                            {dark ? <SunIcon /> : <MoonIcon />}
                        </button>
                        <div style={{ display: "flex", alignItems: "center", gap: ".5rem", padding: "6px 12px", borderRadius: 10, background: "var(--surface3)", border: "1px solid var(--border)", fontSize: ".78rem", fontWeight: 600, color: "var(--text2)" }}>
                            <div style={{ width: 26, height: 26, background: "#3D718D", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".6rem", fontWeight: 800, color: "#fff" }}>MM</div>
                            Mariam Mohammed
                        </div>
                    </div>
                </header>

                {/* ── Main Content ── */}
                <main style={{ marginLeft: 230, marginTop: 60, height: "calc(100vh - 60px)", overflowY: "auto", padding: "1.75rem" }}>
                    <div style={{ marginBottom: "1.5rem" }}>
                        <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-.03em" }}>Users Management</div>
                        <div style={{ fontSize: ".8rem", color: "var(--muted)", fontWeight: 500, marginTop: 3 }}>Manage accounts, roles, and access.</div>
                    </div>

                    {/* Search */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1rem" }}>
                        <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
                            <SearchIcon />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                style={{ width: "100%", padding: ".6rem .75rem .6rem 2.25rem", borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)", fontFamily: "inherit", fontSize: ".82rem", color: "var(--text)", outline: "none", transition: "border-color .2s, box-shadow .2s" }}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, boxShadow: "var(--sh-sm)", overflow: "hidden" }}>
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".82rem" }}>
                                <thead>
                                    <tr style={{ background: "var(--surface3)", borderBottom: "1px solid var(--border)" }}>
                                        {["Name", "Email", "Role", "Status", "Actions"].map(h => (
                                            <th key={h} style={{ padding: ".75rem 1rem", textAlign: "left", fontSize: ".68rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".06em", whiteSpace: "nowrap" }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(user => (
                                        <UserRow key={user.id} user={user} onRoleChange={handleRoleChange} onToggleStatus={handleToggleStatus} />
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--muted)", fontSize: ".82rem" }}>No users found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

// ── NavItem helper ─────────────────────────────────────────────────────────
function NavItem({ item, active, onClick }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "flex", alignItems: "center", gap: ".65rem", padding: ".6rem .75rem",
                borderRadius: 10, cursor: "pointer", transition: "all .2s", userSelect: "none",
                fontSize: ".82rem", fontWeight: 600,
                background: active ? "#658FA5" : hovered ? "rgba(255,255,255,.07)" : "transparent",
                color: active ? "#fff" : hovered ? "rgba(255,255,255,.9)" : "rgba(255,255,255,.6)",
                border: active ? "1px solid rgba(255,255,255,.15)" : "1px solid transparent",
            }}>
            {item.icon}
            {item.label}
            {item.badge && (
                <span style={{ marginLeft: "auto", background: active ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.15)", color: "rgba(255,255,255,.8)", fontSize: ".6rem", fontWeight: 700, padding: "2px 7px", borderRadius: 999 }}>
                    {item.badge}
                </span>
            )}
        </div>
    );
}