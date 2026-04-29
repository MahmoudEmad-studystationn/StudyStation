import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
    {
        section: "Overview",
        items: [
            {
                label: "Dashboard",
                path: "/dashboard",
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                    </svg>
                ),
            },
        ],
    },
    {
        section: "Management",
        items: [
            {
                label: "Users",
                path: "/dashboard/users",
                badge: "128",
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                ),
            },
            {
                label: "Resources",
                path: "/dashboard/resources",
                badge: "47",
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                ),
            },
            {
                label: "Moderation",
                path: "/dashboard/moderation",
                badge: "6",
                icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                ),
            },
        ],
    },
];

export default function SidebarDashboard() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to logout?")) {
            alert("Logged out successfully!");
        }
    };

    return (
        <aside style={styles.sidebar}>
            {/* Logo */}
            <div style={styles.sidebarLogo}>
                <div style={styles.logoIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ width: 16, height: 16, color: "#fff" }}>
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                </div>
                <div>
                    <div style={styles.logoTitle}>Study Station</div>
                    <div style={styles.logoSub}>Admin Panel</div>
                </div>
            </div>

            {/* Nav */}
            <nav style={styles.sidebarNav}>
                {NAV_ITEMS.map((group) => (
                    <div key={group.section}>
                        <div style={styles.navSectionLabel}>{group.section}</div>
                        {group.items.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <div
                                    key={item.label}
                                    onClick={() => navigate(item.path)}
                                    style={{
                                        ...styles.navItem,
                                        ...(isActive ? styles.navItemActive : {}),
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                                            e.currentTarget.style.color = "rgba(255,255,255,0.9)";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.background = "transparent";
                                            e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                                        }
                                    }}
                                >
                                    <span style={{ width: 16, height: 16, flexShrink: 0 }}>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                    {item.badge && (
                                        <span style={{
                                            ...styles.badge,
                                            ...(isActive ? styles.badgeActive : {}),
                                        }}>
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div style={styles.sidebarFooter}>
                <div style={styles.sidebarAdmin}>
                    <div style={styles.adminAv}>MM</div>
                    <div>
                        <div style={styles.adminName}>Mariam Mohammed</div>
                        <div style={styles.adminRole}>Super Admin</div>
                    </div>
                </div>
                <button
                    style={styles.sidebarLogout}
                    onClick={handleLogout}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(248,113,113,0.1)";
                        e.currentTarget.style.color = "#f87171";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ width: 14, height: 14, flexShrink: 0 }}>
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                </button>
            </div>
        </aside>
    );
}

const styles = {
    sidebar: {
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: 230,
        background: "#2C3E50",
        display: "flex",
        flexDirection: "column",
        zIndex: 200,
    },
    sidebarLogo: {
        height: 60,
        display: "flex",
        alignItems: "center",
        gap: "0.65rem",
        padding: "0 1.25rem",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        flexShrink: 0,
    },
    logoIcon: {
        width: 32,
        height: 32,
        background: "#3D718D",
        borderRadius: 9,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    logoTitle: {
        fontSize: "0.82rem",
        fontWeight: 800,
        color: "#fff",
        letterSpacing: "-0.01em",
    },
    logoSub: {
        fontSize: "0.6rem",
        fontWeight: 600,
        color: "rgba(255,255,255,0.35)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
    },
    sidebarNav: {
        flex: 1,
        padding: "1rem 0.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
        overflowY: "auto",
    },
    navSectionLabel: {
        fontSize: "0.6rem",
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.25)",
        padding: "0.5rem 0.5rem 0.25rem",
        marginTop: "0.25rem",
    },
    navItem: {
        display: "flex",
        alignItems: "center",
        gap: "0.65rem",
        padding: "0.6rem 0.75rem",
        borderRadius: 10,
        color: "rgba(255,255,255,0.6)",
        fontSize: "0.82rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s",
        border: "1px solid transparent",
        userSelect: "none",
    },
    navItemActive: {
        background: "rgba(255,255,255,0.2)",
        color: "#fff",
        borderColor: "rgba(255,255,255,0.15)",
    },
    badge: {
        marginLeft: "auto",
        background: "rgba(255,255,255,0.15)",
        color: "rgba(255,255,255,0.8)",
        fontSize: "0.6rem",
        fontWeight: 700,
        padding: "2px 7px",
        borderRadius: 999,
    },
    badgeActive: {
        background: "rgba(255,255,255,0.25)",
    },
    sidebarFooter: {
        padding: "0.75rem",
        borderTop: "1px solid rgba(255,255,255,0.07)",
    },
    sidebarAdmin: {
        display: "flex",
        alignItems: "center",
        gap: "0.65rem",
        padding: "0.5rem 0.75rem",
        borderRadius: 10,
    },
    adminAv: {
        width: 36,
        height: 36,
        background: "#3D718D",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.7rem",
        fontWeight: 800,
        color: "#fff",
        flexShrink: 0,
        border: "2px solid rgba(255,255,255,0.2)",
    },
    adminName: {
        fontSize: "0.78rem",
        fontWeight: 700,
        color: "#fff",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    adminRole: {
        fontSize: "0.62rem",
        color: "rgba(255,255,255,0.35)",
        fontWeight: 500,
    },
    sidebarLogout: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        width: "100%",
        padding: "0.55rem 0.75rem",
        borderRadius: 10,
        background: "transparent",
        border: "none",
        color: "rgba(255,255,255,0.4)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: "0.78rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s",
        marginTop: "0.35rem",
    },
};