import { useState, useEffect, useContext } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaHeadphones, FaUsers, FaFolder, FaSignOutAlt } from "react-icons/fa";
import { FaFilePen } from "react-icons/fa6";
import { IoBookSharp } from "react-icons/io5";
import { AuthContext } from "../../context/AuthContext";
import { toast as toastify } from "react-toastify";
import { useThemeContext } from '../Theme/ThemeContext';

// ─── Sidebar ───────────────────────────────────────────────
function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const items = [
    { icon: <FaHome />, label: "Home", path: "/home" },
    { icon: <FaHeadphones />, label: "Solo Study", path: "/solo-study" },
    { icon: <FaUsers />, label: "Study With Friends", path: "/study-with-friends" },
    { icon: <FaFolder />, label: "Library", path: "/library" },
    { icon: <FaFilePen />, label: "Posts", path: "/posts" },
  ];

  const handleLogout = () => {
    logout();
    toastify.success("Logged out successfully!");
    navigate("/", { replace: true });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
        .sidebar-root { font-family: 'Sora', sans-serif; }
        .sidebar-desktop { position:relative; z-index:10; height:calc(100vh - 40px); margin:20px; border-radius:20px; background:#2C3E50; box-shadow:0 6px 18px rgba(9,30,40,0.15); display:flex; flex-direction:column; justify-content:space-between; overflow:hidden; flex-shrink:0; transition:width 0.35s cubic-bezier(0.4,0,0.2,1); }
        .brand { display:flex; align-items:center; gap:12px; overflow:hidden; transition:padding 0.35s ease, justify-content 0.35s ease; }
        .brand-icon-wrap { width:40px; height:40px; border-radius:12px; background:rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; font-size:18px; color:white; flex-shrink:0; }
        .brand-text { font-size:16px; font-weight:700; color:white; letter-spacing:0.02em; white-space:nowrap; overflow:hidden; transition:opacity 0.3s ease, max-width 0.35s ease; }
        .brand-sub { font-size:10px; font-weight:400; color:rgba(255,255,255,0.4); letter-spacing:0.08em; text-transform:uppercase; display:block; margin-top:1px; }
        .sb-divider { height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent); margin:20px 16px; }
        .nav-list { list-style:none; margin:0; padding:0 12px; display:flex; flex-direction:column; gap:4px; flex:1; }
        .nav-link { text-decoration:none; display:flex; align-items:center; gap:12px; padding:11px 14px; border-radius:12px; color:rgba(255,255,255,0.55); font-size:14px; font-weight:500; position:relative; transition:background 0.2s ease,color 0.2s ease; white-space:nowrap; overflow:hidden; }
        .nav-link:hover { color:white; background:rgba(255,255,255,0.07); }
        .nav-link.active { color:white; background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.15); }
        .nav-link.active::before { content:''; position:absolute; left:0; top:50%; transform:translateY(-50%); width:3px; height:60%; background:white; border-radius:0 4px 4px 0; }
        .nav-icon { font-size:17px; flex-shrink:0; display:flex; align-items:center; }
        .nav-label { overflow:hidden; white-space:nowrap; transition:opacity 0.3s ease, max-width 0.35s ease; }
        .tooltip { display:none; position:absolute; left:calc(100% + 12px); top:50%; transform:translateY(-50%); background:#1e3a4f; color:white; font-size:12px; font-weight:500; padding:6px 12px; border-radius:8px; white-space:nowrap; border:1px solid rgba(255,255,255,0.1); box-shadow:0 8px 16px rgba(0,0,0,0.3); pointer-events:none; z-index:9999; }
        .sidebar-desktop.collapsed .nav-link:hover .tooltip { display:block; }
        .bottom-area { padding:16px 12px; border-top:1px solid rgba(255,255,255,0.06); }
        .logout-btn { display:flex; align-items:center; gap:12px; width:100%; padding:11px 14px; border-radius:12px; background:transparent; border:none; color:rgba(255,255,255,0.45); font-size:14px; font-weight:500; font-family:'Sora',sans-serif; cursor:pointer; transition:all 0.2s ease; white-space:nowrap; overflow:hidden; }
        .logout-btn:hover { color:#f87171; background:rgba(248,113,113,0.08); }
        .toggle-btn { display:flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:8px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08); color:rgba(255,255,255,0.5); cursor:pointer; font-size:13px; transition:all 0.2s ease; flex-shrink:0; }
        .toggle-btn:hover { background:rgba(255,255,255,0.12); color:white; }
        .sidebar-mobile { position:fixed; bottom:0; left:0; right:0; height:68px; background:#2C3E50; border-top:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; padding:0 4px; z-index:1000; font-family:'Sora',sans-serif; box-shadow:0 -4px 12px rgba(0,0,0,0.2); }
        .mobile-nav { display:flex; flex:1; justify-content:space-around; align-items:center; list-style:none; margin:0; padding:0; }
        .mobile-nav-link { text-decoration:none; display:flex; flex-direction:column; align-items:center; gap:4px; padding:8px 12px; border-radius:12px; color:rgba(255,255,255,0.4); transition:all 0.2s ease; position:relative; }
        .mobile-nav-link.active { color:white; }
        .mobile-nav-link.active::after { content:''; position:absolute; bottom:-2px; left:50%; transform:translateX(-50%); width:20px; height:2px; background:white; border-radius:2px; }
        .mobile-icon { font-size:20px; }
        .mobile-label { font-size:10px; font-weight:500; letter-spacing:0.02em; }
        .mobile-logout-btn { background:transparent; border:none; color:rgba(255,255,255,0.4); display:flex; flex-direction:column; align-items:center; gap:4px; padding:8px 12px; border-radius:12px; cursor:pointer; font-family:'Sora',sans-serif; transition:all 0.2s ease; }
        .mobile-logout-btn:hover { color:#f87171; }
      `}</style>

      {!isMobile && (
        <aside className={`sidebar-root sidebar-desktop${collapsed ? " collapsed" : ""}`} style={{ width: collapsed ? "84px" : "260px" }}>
          <div>
            <div className="brand" style={{ padding: collapsed ? "28px 0 0 0" : "28px 24px 0 24px", justifyContent: collapsed ? "center" : "flex-start" }}>
              <div className="brand-icon-wrap"><IoBookSharp /></div>
              <div className="brand-text" style={{ maxWidth: collapsed ? "0px" : "200px", opacity: collapsed ? 0 : 1 }}>
                Study Station
                <span className="brand-sub">Focus & Learn</span>
              </div>
            </div>
            <div className="sb-divider" />
            <ul className="nav-list">
              {items.map((item, index) => (
                <li key={index}>
                  <NavLink to={item.path} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} style={{ justifyContent: collapsed ? "center" : "flex-start" }}>
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label" style={{ maxWidth: collapsed ? "0px" : "200px", opacity: collapsed ? 0 : 1 }}>{item.label}</span>
                    <span className="tooltip">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="bottom-area">
            <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between" }}>
              <button className="logout-btn" onClick={handleLogout} style={{ flex: collapsed ? "0" : "1", maxWidth: collapsed ? "0px" : "200px", opacity: collapsed ? 0 : 1, padding: collapsed ? "0" : "11px 14px", transition: "all 0.35s ease", overflow: "hidden" }}>
                Logout
              </button>
              <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
                <FaSignOutAlt style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.35s ease" }} />
              </button>
            </div>
          </div>
        </aside>
      )}

      {isMobile && (
        <nav className="sidebar-root sidebar-mobile">
          <ul className="mobile-nav">
            {items.map((item, index) => (
              <li key={index}>
                <NavLink to={item.path} className={({ isActive }) => `mobile-nav-link${isActive ? " active" : ""}`}>
                  <span className="mobile-icon">{item.icon}</span>
                  <span className="mobile-label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
          <button className="mobile-logout-btn" onClick={handleLogout}>
            <span className="mobile-icon"><FaSignOutAlt /></span>
            <span className="mobile-label">Logout</span>
          </button>
        </nav>
      )}
    </>
  );
}

// ─── Icons ─────────────────────────────────────────────────
const CoursesIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
  </svg>
);

const ResourcesIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

const RoadmapIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
    <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
  </svg>
);

const TYPES = [
  { id: "courses",   color: "#658FA5", label: "Courses and Playlist",    Icon: CoursesIcon },
  { id: "resources", color: "#3D718D", label: "Resources\nand Materials", Icon: ResourcesIcon },
  { id: "roadmaps",  color: "#8FB7CC", label: "Roadmaps",                Icon: RoadmapIcon },
];

// ─── Main Page ──────────────────────────────────────────────
export default function ShareResource() {
  const { isDarkMode } = useThemeContext();

  const [resType, setResType] = useState("resources");
  const [showToast, setShowToast] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", track: "", typeId: "", url: "", filePath: "" });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const submit = () => { setShowToast(true); setTimeout(() => setShowToast(false), 3500); };

  const t = isDarkMode ? {
    bg: "#171717", surface: "#1f1f1f", text: "#f0f0f0", muted: "#9a9a9a",
    border: "rgba(255,255,255,0.07)", cardBorder: "rgba(255,255,255,0.06)",
    accentSoft: "rgba(143,183,204,0.1)", btnBg: "#8FB7CC", btnColor: "#2C3E50",
    toastBg: "#8FB7CC", toastColor: "#2C3E50",
  } : {
    bg: "#F3F4F6", surface: "#ffffff", text: "#1a1a2e", muted: "#686868",
    border: "rgba(44,62,80,0.1)", cardBorder: "rgba(44,62,80,0.08)",
    accentSoft: "rgba(143,183,204,0.18)", btnBg: "#2C3E50", btnColor: "#ffffff",
    toastBg: "#2C3E50", toastColor: "#ffffff",
  };

  const inputStyle = {
    width: "100%", padding: "9px 13px", background: t.bg,
    border: `1px solid ${t.border}`, borderRadius: 9,
    fontFamily: "'DM Sans', sans-serif", fontSize: 14,
    color: t.text, outline: "none", boxSizing: "border-box",
    WebkitAppearance: "none", appearance: "none",
  };

  const secLabel = {
    fontFamily: "'Syne', sans-serif", fontSize: 10.5, fontWeight: 700,
    letterSpacing: ".14em", textTransform: "uppercase", color: t.muted,
    marginBottom: ".9rem", paddingBottom: ".5rem",
    borderBottom: `1px solid ${t.border}`, display: "block",
  };

  const fieldLabel = { display: "block", fontSize: 12.8, fontWeight: 500, color: t.text, marginBottom: 5 };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: t.bg, transition: "background .3s, color .3s" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');`}</style>

      <Sidebar />

      <div style={{ flex: 1, overflowY: "auto", height: "100vh", fontFamily: "'DM Sans', sans-serif", color: t.text }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "2rem 2rem 4rem" }}>

          <button style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, color: t.muted, cursor: "pointer", border: "none", background: "none", fontFamily: "'DM Sans', sans-serif", padding: 0, marginBottom: "1.5rem" }}>
            ← Back to Library
          </button>

          <div style={{ marginBottom: "1.25rem" }}>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.65rem", color: t.text, marginBottom: ".4rem" }}>Contribute a Resource</h1>
            <p style={{ color: t.muted, fontSize: 14, lineHeight: 1.6 }}>Share a course, video, article, or tool with the community. Your submission will be reviewed by an admin before going live.</p>
          </div>

          <div style={{ background: t.accentSoft, border: "1px solid rgba(143,183,204,.3)", borderRadius: 12, padding: "11px 14px", display: "flex", alignItems: "flex-start", gap: 9, marginBottom: "1.5rem", fontSize: 13, color: t.text, lineHeight: 1.55 }}>
            <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>💡</span>
            <span>Submissions are <strong>reviewed before publishing</strong>. This keeps the library high-quality and organized for everyone.</span>
          </div>

          <div style={{ background: t.surface, border: `1px solid ${t.cardBorder}`, borderRadius: 18, overflow: "hidden" }}>
            <div style={{ height: 3, background: "linear-gradient(90deg, #2C3E50, #8FB7CC)" }} />
            <div style={{ padding: "1.75rem" }}>

              <span style={secLabel}>Resource Type</span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: "1.5rem" }}>
                {TYPES.map(({ id, color, label, Icon }) => {
                  const active = resType === id;
                  return (
                    <div key={id} onClick={() => setResType(id)} style={{
                      background: color, borderRadius: 12, padding: "12px 8px",
                      cursor: "pointer", display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center", gap: 8, minHeight: 80,
                      boxShadow: active ? `0 4px 16px ${color}88` : "none",
                      opacity: active ? 1 : 0.78, transition: "all .2s",
                      border: active ? "2px solid rgba(255,255,255,0.5)" : "2px solid transparent",
                    }}>
                      <Icon />
                      <div style={{ color: "white", fontWeight: 600, fontSize: 12, lineHeight: 1.3, textAlign: "center", whiteSpace: "pre-line" }}>{label}</div>
                    </div>
                  );
                })}
              </div>

              <div style={{ height: 1, background: t.border, margin: "1.5rem 0" }} />
              <span style={secLabel}>Basic Info</span>

              <div style={{ marginBottom: "1.1rem" }}>
                <label style={fieldLabel}>Title <span style={{ color: "#dc2626" }}>*</span></label>
                <input style={inputStyle} value={form.title} onChange={set("title")} placeholder="e.g. React for Beginners — Full Course" />
              </div>

              <div style={{ marginBottom: "1.1rem" }}>
                <label style={fieldLabel}>Description</label>
                <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 95 }} value={form.description} onChange={set("description")} placeholder="What will students learn? Why is this resource valuable?" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={fieldLabel}>Track / Category <span style={{ color: "#dc2626" }}>*</span></label>
                  <select style={{ ...inputStyle, color: form.track ? t.text : t.muted }} value={form.track} onChange={set("track")}>
                    <option value="">Select a track…</option>
                    <option>Frontend</option>
                    <option>AI / ML</option>
                    <option>Cyber Security</option>
                    <option>UI/UX</option>
                  </select>
                </div>
                <div>
                  <label style={fieldLabel}>Resource Type ID</label>
                  <input style={inputStyle} type="number" value={form.typeId} onChange={set("typeId")} placeholder="e.g. 1" />
                  <div style={{ fontSize: 11.5, color: t.muted, marginTop: 4 }}>Numerical ID in the system</div>
                </div>
              </div>

              <div style={{ height: 1, background: t.border, margin: "1.5rem 0" }} />
              <span style={secLabel}>Links & Files</span>

              <div style={{ marginBottom: "1.1rem" }}>
                <label style={fieldLabel}>Resource URL <span style={{ color: "#dc2626" }}>*</span></label>
                <input style={inputStyle} type="url" value={form.url} onChange={set("url")} placeholder="https://…" />
                <div style={{ fontSize: 11.5, color: t.muted, marginTop: 4 }}>YouTube playlist, course link, article URL, etc.</div>
              </div>

              <div style={{ marginBottom: "1.1rem" }}>
                <label style={fieldLabel}>File Path <span style={{ fontWeight: 400, color: t.muted }}>(optional)</span></label>
                <input style={inputStyle} value={form.filePath} onChange={set("filePath")} placeholder="/uploads/resource.pdf" />
                <div style={{ fontSize: 11.5, color: t.muted, marginTop: 4 }}>If uploading a file directly (PDF, Doc…)</div>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: "1.5rem" }}>
                <button style={{ padding: "9px 20px", borderRadius: 10, background: "transparent", border: `1px solid ${t.border}`, color: t.muted, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 14, cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={submit} style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: t.btnBg, color: t.btnColor, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                  Submit for Review →
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div style={{
        position: "fixed", bottom: "2rem", right: "2rem", zIndex: 999,
        background: t.toastBg, color: t.toastColor,
        padding: "12px 18px", borderRadius: 12, fontSize: 13.5, fontWeight: 500,
        boxShadow: "0 8px 28px rgba(0,0,0,.22)",
        transform: showToast ? "translateY(0)" : "translateY(80px)",
        opacity: showToast ? 1 : 0,
        transition: "all .35s cubic-bezier(.34,1.56,.64,1)",
        pointerEvents: "none",
      }}>
        ✅ Resource submitted! Pending admin review.
      </div>

    </div>
  );
}