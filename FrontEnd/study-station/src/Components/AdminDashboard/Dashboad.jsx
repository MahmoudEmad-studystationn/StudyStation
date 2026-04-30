import { useState, useEffect } from "react";
import { useThemeContext } from "../Theme/ThemeContext";
import SidebarDashboard from "./SidebarDashboard";
import TopbarDashboard from "./Topbardashboard";
import { getDashboardData } from "../Services/adminServices";

const cssVars = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
  body { font-family: 'Sora', sans-serif; -webkit-font-smoothing: antialiased; }
  .db-stat-card { transition: box-shadow 0.2s, transform 0.2s; }
  .db-stat-card:hover { transform: translateY(-2px); }
  .db-activity-item { transition: background 0.15s; }
  @media (max-width: 900px) { .db-stats-grid { grid-template-columns: repeat(2, 1fr) !important; } .db-dashboard-grid { grid-template-columns: 1fr !important; } }
  @media (max-width: 580px) { .db-stats-grid { grid-template-columns: 1fr !important; } }
`;

const TrendUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}><polyline points="18 15 12 9 6 15" /></svg>;
const TrendFlatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}><line x1="5" y1="12" x2="19" y2="12" /></svg>;

export default function Dashboard() {
    const { isDarkMode } = useThemeContext();
    const [dashData, setDashData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboardData()
            .then(data => { setDashData(data); setLoading(false); })
            .catch(err => { console.error("Dashboard fetch error:", err); setLoading(false); });
    }, []);

    const cardBg = isDarkMode ? "#2A2A2A" : "#ffffff";
    const bgColor = isDarkMode ? "#171717" : "#F3F4F6";
    const borderFaint = isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(44,62,80,0.08)";
    const textPrimary = isDarkMode ? "#E0E0E0" : "#2f3b48";
    const textMuted = isDarkMode ? "#B0B0B0" : "#6b6f76";
    const surface3 = isDarkMode ? "#363636" : "#eef1f4";
    const cardShadow = isDarkMode ? "0 8px 16px rgba(0,0,0,0.3)" : "0 8px 16px rgba(0,0,0,0.07)";

    const DashboardSkeleton = ({ bgColor, cardBg, borderFaint, cardShadow, surface3 }) => {
        const sk = {
            background: `linear-gradient(90deg, ${cardBg} 25%, ${surface3} 50%, ${cardBg} 75%)`,
            backgroundSize: "400px 100%",
            animation: "sk-shimmer 1.4s infinite",
            borderRadius: 8,
        };
        const card = {
            background: cardBg,
            border: `1px solid ${borderFaint}`,
            borderRadius: 14,
            padding: "1.25rem",
            position: "relative",
            overflow: "hidden",
        };
        return (
            <>
                <style>{`
                @keyframes sk-shimmer {
                    0%   { background-position: -400px 0; }
                    100% { background-position:  400px 0; }
                }
            `}</style>
                <main style={{ marginLeft: 230, marginTop: 60, height: "calc(100vh - 60px)", overflowY: "auto", padding: "1.75rem", background: bgColor }}>
                    {/* Heading */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <div style={{ ...sk, width: 120, height: 20, marginBottom: 8 }} />
                        <div style={{ ...sk, width: 200, height: 13 }} />
                    </div>

                    {/* 4 stat cards */}
                    <div className="db-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "1.75rem" }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ ...card, minHeight: 140 }}>
                                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: borderFaint }} />
                                <div style={{ ...sk, width: 38, height: 38, borderRadius: 10, marginBottom: 14 }} />
                                <div style={{ ...sk, width: 65, height: 28, marginBottom: 8 }} />
                                <div style={{ ...sk, width: 100, height: 11, marginBottom: 10 }} />
                                <div style={{ ...sk, width: 80, height: 11 }} />
                            </div>
                        ))}
                    </div>

                    {/* Bottom grid */}
                    <div className="db-dashboard-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1rem" }}>
                        {/* Recent Activity skeleton */}
                        <div style={{ ...card, padding: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", borderBottom: `1px solid ${borderFaint}` }}>
                                <div style={{ ...sk, width: 120, height: 14 }} />
                                <div style={{ ...sk, width: 48, height: 22, borderRadius: 999 }} />
                            </div>
                            <div style={{ padding: "0.5rem 0" }}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.65rem 1.25rem" }}>
                                        <div style={{ ...sk, width: 8, height: 8, borderRadius: "50%", flexShrink: 0 }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ ...sk, width: `${55 + i * 7}%`, height: 12, marginBottom: 5 }} />
                                            <div style={{ ...sk, width: `${25 + i * 4}%`, height: 10 }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Stats skeleton */}
                        <div style={{ ...card, padding: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", borderBottom: `1px solid ${borderFaint}` }}>
                                <div style={{ ...sk, width: 90, height: 14 }} />
                                <div style={{ ...sk, width: 60, height: 22, borderRadius: 999 }} />
                            </div>
                            <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: surface3, borderRadius: 10, border: `1px solid ${borderFaint}` }}>
                                        <div style={{ ...sk, width: 100, height: 12 }} />
                                        <div style={{ ...sk, width: 38, height: 14 }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </>
        );
    };

    const STATS = dashData ? [
        {
            accentColor: "#3D718D", iconBg: "rgba(61,113,141,0.12)", iconColor: "#3D718D",
            number: dashData.globalStats.totalUsers.toLocaleString(),
            label: "Total Users", trend: "up",
            trendText: `${dashData.globalStats.totalUsersPercentChange > 0 ? "+" : ""}${dashData.globalStats.totalUsersPercentChange}% this month`,
            icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
        },
        {
            accentColor: "#658FA5", iconBg: "rgba(101,143,165,0.12)", iconColor: "#658FA5",
            number: dashData.globalStats.totalResources.toLocaleString(),
            label: "Total Resources", trend: "up",
            trendText: `${dashData.globalStats.totalResourcesPercentChange > 0 ? "+" : ""}${dashData.globalStats.totalResourcesPercentChange}% this month`,
            icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
        },
        {
            accentColor: "#8FB7CC", iconBg: "rgba(143,183,204,0.2)", iconColor: "#4f8fad",
            number: dashData.globalStats.activeSessions.toLocaleString(),
            label: "Active Sessions", trend: "stable", trendText: "Live right now",
            icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
        },
        {
            accentColor: "#686868", iconBg: "rgba(104,104,104,0.1)", iconColor: "#686868",
            number: dashData.globalStats.postsCount?.toLocaleString() ?? "—",
            label: "Posts Count", trend: "up",
            trendText: `${(dashData.globalStats.postsCountPercentChange ?? 0) > 0 ? "+" : ""}${dashData.globalStats.postsCountPercentChange ?? 0}% this month`,
            icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
        },
    ] : [];

    const QUICK_STATS = dashData ? [
        { label: "Active Users", value: dashData.quickStats.activeUsers.toLocaleString(), icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg> },
        { label: "Study Rooms Open", value: dashData.quickStats.studyRoomsOpen.toLocaleString(), icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg> },
        { label: "Flagged Content", value: dashData.quickStats.flaggedContent.toLocaleString(), icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
        { label: "Avg. Session (min)", value: dashData.quickStats.avgSessionMinutes.toLocaleString(), icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg> },
        { label: "Resources Today", value: `+${dashData.quickStats.resourcesToday}`, icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /></svg> },
        { label: "New Signups Today", value: (dashData.quickStats.newSignupsToday ?? 0).toLocaleString(), icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg> },
    ] : [];

    if (loading) return (
        <>
            <style>{cssVars}</style>
            <SidebarDashboard />
            <TopbarDashboard />
            <DashboardSkeleton
                bgColor={bgColor}
                cardBg={cardBg}
                borderFaint={borderFaint}
                cardShadow={cardShadow}
                surface3={surface3}
            />
        </>
    );

    return (
        <>
            <style>{cssVars}</style>
            <SidebarDashboard />
            <TopbarDashboard />
            <main style={{ marginLeft: 230, marginTop: 60, height: "calc(100vh - 60px)", overflowY: "auto", padding: "1.75rem", background: bgColor, }}>

                <div style={{ marginBottom: "1.5rem" }}>
                    <div style={{ fontSize: "1.3rem", fontWeight: 700, color: textPrimary, letterSpacing: "-0.02em" }}>Dashboard</div>
                    <div style={{ fontSize: "0.8rem", color: textMuted, fontWeight: 500, marginTop: 3 }}>Welcome back — here's what's going on.</div>
                </div>

                {/* Stat Cards */}
                <div className="db-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.75rem" }}>
                    {STATS.map((s) => (
                        <div key={s.label} className="db-stat-card" style={{ background: cardBg, border: `1px solid ${borderFaint}`, borderRadius: 14, padding: "1.25rem", boxShadow: cardShadow, position: "relative", overflow: "hidden", cursor: "default" }}>
                            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.accentColor }} />
                            <div style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.9rem", background: s.iconBg, color: s.iconColor }}>
                                <span style={{ width: 18, height: 18 }}>{s.icon}</span>
                            </div>
                            <div style={{ fontSize: "2rem", fontWeight: 700, color: textPrimary, letterSpacing: "-0.04em", lineHeight: 1 }}>{s.number}</div>
                            <div style={{ fontSize: "0.73rem", fontWeight: 600, color: textMuted, marginTop: "0.3rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                            <div style={{ marginTop: "0.65rem", display: "flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 700, color: s.trend === "up" ? "#658FA5" : "#658FA5" }}>
                                {s.trend === "up" ? <TrendUpIcon /> : <TrendFlatIcon />}
                                {s.trendText}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Dashboard Grid */}
                <div className="db-dashboard-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1rem" }}>

                    {/* Recent Activity */}
                    <div style={{ background: cardBg, border: `1px solid ${borderFaint}`, borderRadius: 14, boxShadow: cardShadow, overflow: "hidden" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", borderBottom: `1px solid ${borderFaint}` }}>
                            <div style={{ fontSize: "0.88rem", fontWeight: 700, color: textPrimary }}>Recent Activity</div>
                            <span style={{ fontSize: "0.68rem", fontWeight: 600, padding: "3px 9px", borderRadius: 999, background: surface3, color: textMuted }}>Today</span>
                        </div>
                        <div style={{ padding: "0.5rem 0" }}>
                            {dashData?.recentActivities?.length > 0 ? (
                                dashData.recentActivities.map((a, i) => (
                                    <div key={i} className="db-activity-item" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 1.25rem" }}
                                        onMouseEnter={e => e.currentTarget.style.background = surface3}
                                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                        <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: "#3D718D" }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: textPrimary }}>{a.description ?? a.text ?? JSON.stringify(a)}</div>
                                            <div style={{ fontSize: "0.7rem", color: textMuted, marginTop: 1 }}>{a.time ?? a.createdAt ?? ""}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: "2rem", textAlign: "center", color: textMuted, fontSize: "0.8rem" }}>
                                    No recent activity.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div style={{ background: cardBg, border: `1px solid ${borderFaint}`, borderRadius: 14, boxShadow: cardShadow, overflow: "hidden" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", borderBottom: `1px solid ${borderFaint}` }}>
                            <div style={{ fontSize: "0.88rem", fontWeight: 700, color: textPrimary }}>Quick Stats</div>
                            <span style={{ fontSize: "0.68rem", fontWeight: 600, padding: "3px 9px", borderRadius: 999, background: surface3, color: textMuted }}>Overview</span>
                        </div>
                        <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {QUICK_STATS.map((q) => (
                                <div key={q.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.65rem 0.75rem", background: surface3, borderRadius: 10, border: `1px solid ${borderFaint}` }}>
                                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: textMuted, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <span style={{ width: 14, height: 14, color: "#658FA5" }}>{q.icon}</span>
                                        {q.label}
                                    </span>
                                    <span style={{ fontSize: "0.88rem", fontWeight: 700, color: textPrimary }}>{q.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>
        </>
    );
}