import React, { useState, useEffect, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaHeadphones,
  FaUsers,
  FaFolder,
  FaSignOutAlt,
} from "react-icons/fa";
import { FaFilePen } from "react-icons/fa6";
import { IoBookSharp } from "react-icons/io5";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";

const API_BASE = "https://study-station.runasp.net/api";

function getInitials(firstName, lastName) {
  const f = (firstName || "").trim()[0] || "";
  const l = (lastName  || "").trim()[0] || "";
  return (f + l).toUpperCase() || "??";
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [profile, setProfile] = useState(null);
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

  // Fetch profile for the sidebar avatar + name
  useEffect(() => {
    const token = localStorage.getItem("accessToken") || "";
    fetch(`${API_BASE}/Profile`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setProfile(data); })
      .catch(() => {});
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
    toast.success("Logged out successfully!");
    navigate("/", { replace: true });
  };

  const firstName = profile?.firstName || "";
  const lastName  = profile?.lastName  || "";
  const fullName  = [firstName, lastName].filter(Boolean).join(" ") || "Student";
  const initials  = getInitials(firstName, lastName);
  const track     = profile?.track || "Student";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');

        .sidebar-root { font-family: 'Sora', sans-serif; }

        .sidebar-desktop {
          position: -webkit-sticky; 
          position: sticky; 
          top: 20px;
          z-index: 10;
          height: calc(100vh - 40px); 
          margin: 20px;
          border-radius: 20px;
          background: #2C3E50;
          box-shadow: 0 6px 18px rgba(9,30,40,0.15);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          flex-shrink: 0; 
          transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          overflow: hidden;
          transition: padding 0.35s ease, justify-content 0.35s ease;
        }

        .brand-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: white;
          flex-shrink: 0;
        }

        .brand-text {
          font-size: 16px;
          font-weight: 700;
          color: white;
          letter-spacing: 0.02em;
          white-space: nowrap;
          overflow: hidden;
          transition: opacity 0.3s ease, max-width 0.35s ease;
        }

        .brand-sub {
          font-size: 10px;
          font-weight: 400;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          display: block;
          margin-top: 1px;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          margin: 20px 16px;
        }

        .nav-list {
          list-style: none;
          margin: 0;
          padding: 0 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .nav-link {
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 12px;
          color: rgba(255,255,255,0.55);
          font-size: 14px;
          font-weight: 500;
          position: relative;
          transition: background 0.2s ease, color 0.2s ease;
          white-space: nowrap;
          overflow: hidden;
        }

        .nav-link:hover {
          color: white;
          background: rgba(255,255,255,0.07);
        }

        .nav-link.active {
          color: white;
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.15);
        }

        .nav-link.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: white;
          border-radius: 0 4px 4px 0;
        }

        .nav-icon {
          font-size: 17px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }

        .nav-label {
          overflow: hidden;
          white-space: nowrap;
          transition: opacity 0.3s ease, max-width 0.35s ease;
        }

        .tooltip {
          display: none;
          position: absolute;
          left: calc(100% + 12px);
          top: 50%;
          transform: translateY(-50%);
          background: #1e3a4f;
          color: white;
          font-size: 12px;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 8px;
          white-space: nowrap;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 8px 16px rgba(0,0,0,0.3);
          pointer-events: none;
          z-index: 9999;
        }

        .sidebar-desktop.collapsed .nav-link:hover .tooltip {
          display: block;
        }

        /* ── Profile Card in Sidebar ── */
        .sidebar-profile-card {
          margin: 0 12px 12px;
          border-radius: 14px;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
          overflow: hidden;
        }

        .sidebar-profile-card:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.1);
          transform: translateY(-1px);
        }

        .sidebar-profile-inner {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
        }

        .sidebar-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #658FA5, #2C3E50);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          color: white;
          flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.2);
          letter-spacing: 0.02em;
        }

        .sidebar-profile-info {
          overflow: hidden;
          white-space: nowrap;
          transition: opacity 0.3s ease, max-width 0.35s ease;
        }

        .sidebar-profile-name {
          font-size: 13px;
          font-weight: 700;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-profile-track {
          font-size: 10px;
          font-weight: 500;
          color: rgba(255,255,255,0.45);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 1px;
        }

        .sidebar-profile-chevron {
          margin-left: auto;
          color: rgba(255,255,255,0.35);
          flex-shrink: 0;
          transition: opacity 0.3s ease, max-width 0.35s ease;
        }

        /* collapsed: show only avatar centered */
        .sidebar-desktop.collapsed .sidebar-profile-inner {
          justify-content: center;
          padding: 10px 0;
        }

        .sidebar-desktop.collapsed .sidebar-profile-info {
          max-width: 0;
          opacity: 0;
        }

        .sidebar-desktop.collapsed .sidebar-profile-chevron {
          max-width: 0;
          opacity: 0;
        }

        /* tooltip for collapsed profile */
        .sidebar-desktop.collapsed .sidebar-profile-card:hover::after {
          content: attr(data-name);
          position: absolute;
          left: calc(84px + 12px);
          background: #1e3a4f;
          color: white;
          font-size: 12px;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 8px;
          white-space: nowrap;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 8px 16px rgba(0,0,0,0.3);
          pointer-events: none;
          z-index: 9999;
          font-family: 'Sora', sans-serif;
        }

        .sidebar-desktop.collapsed .sidebar-profile-card {
          position: relative;
        }

        .bottom-area {
          padding: 0 0 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 12px;
        }

        .logout-row {
          display: flex;
          align-items: center;
          padding: 0 12px;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 11px 14px;
          border-radius: 12px;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.45);
          font-size: 14px;
          font-weight: 500;
          font-family: 'Sora', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          overflow: hidden;
        }

        .logout-btn:hover {
          color: #f87171;
          background: rgba(248,113,113,0.08);
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .toggle-btn:hover {
          background: rgba(255,255,255,0.12);
          color: white;
        }

        /* MOBILE */
        .sidebar-mobile {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 68px;
          background: #2C3E50;
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          padding: 0 4px;
          z-index: 1000;
          font-family: 'Sora', sans-serif;
          box-shadow: 0 -4px 12px rgba(0,0,0,0.2);
        }

        .mobile-nav {
          display: flex;
          flex: 1;
          justify-content: space-around;
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .mobile-nav-link {
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          border-radius: 12px;
          color: rgba(255,255,255,0.4);
          transition: all 0.2s ease;
          position: relative;
        }

        .mobile-nav-link.active { color: white; }

        .mobile-nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 2px;
          background: white;
          border-radius: 2px;
        }

        .mobile-icon { font-size: 20px; }
        .mobile-label { font-size: 10px; font-weight: 500; letter-spacing: 0.02em; }

        .mobile-logout-btn {
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.4);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          border-radius: 12px;
          cursor: pointer;
          font-family: 'Sora', sans-serif;
          transition: all 0.2s ease;
        }

        .mobile-logout-btn:hover { color: #f87171; }

        /* Mobile profile button */
        .mobile-profile-btn {
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.4);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          border-radius: 12px;
          cursor: pointer;
          font-family: 'Sora', sans-serif;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .mobile-profile-btn.active { color: white; }

        .mobile-profile-avatar {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, #658FA5, #2C3E50);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          font-weight: 800;
          color: white;
          border: 1.5px solid rgba(255,255,255,0.3);
        }
      `}</style>

      {/* DESKTOP */}
      {!isMobile && (
        <aside
          className={`sidebar-root sidebar-desktop${collapsed ? " collapsed" : ""}`}
          style={{ width: collapsed ? "84px" : "260px" }}
        >
          <div>
            <div
              className="brand"
              style={{
                padding: collapsed ? "28px 0 0 0" : "28px 24px 0 24px",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
            >
              <div className="brand-icon-wrap">
                <IoBookSharp />
              </div>
              <div
                className="brand-text"
                style={{
                  maxWidth: collapsed ? "0px" : "200px",
                  opacity: collapsed ? 0 : 1,
                }}
              >
                Study Station
                <span className="brand-sub">Focus & Learn</span>
              </div>
            </div>

            <div className="divider" />

            <ul className="nav-list">
              {items.map((item, index) => (
                <li key={index}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                    style={{ justifyContent: collapsed ? "center" : "flex-start" }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span
                      className="nav-label"
                      style={{
                        maxWidth: collapsed ? "0px" : "200px",
                        opacity: collapsed ? 0 : 1,
                      }}
                    >
                      {item.label}
                    </span>
                    <span className="tooltip">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* BOTTOM AREA */}
          <div className="bottom-area">

            {/* ── Profile Card ── */}
            <div
              className="sidebar-profile-card"
              data-name={fullName}
              onClick={() => navigate("/profile")}
            >
              <div className="sidebar-profile-inner">
                <div className="sidebar-avatar">{initials}</div>

                <div
                  className="sidebar-profile-info"
                  style={{
                    maxWidth: collapsed ? "0px" : "160px",
                    opacity: collapsed ? 0 : 1,
                  }}
                >
                  <div className="sidebar-profile-name">{fullName}</div>
                  <div className="sidebar-profile-track">{track}</div>
                </div>

                <div
                  className="sidebar-profile-chevron"
                  style={{
                    maxWidth: collapsed ? "0px" : "20px",
                    opacity: collapsed ? 0 : 1,
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    width={13} height={13}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Logout + Toggle */}
            <div className="logout-row" style={{ justifyContent: collapsed ? "center" : "space-between", marginTop: 8 }}>
              <button
                className="logout-btn"
                onClick={handleLogout}
                style={{
                  flex: collapsed ? "0" : "1",
                  maxWidth: collapsed ? "0px" : "200px",
                  opacity: collapsed ? 0 : 1,
                  padding: collapsed ? "0" : "11px 14px",
                  transition: "all 0.35s ease",
                  overflow: "hidden",
                }}
              >
                <FaSignOutAlt />
                Logout
              </button>
              <button
                className="toggle-btn"
                onClick={() => setCollapsed(!collapsed)}
                title="Toggle Sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  width={14} height={14}
                  style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.35s ease" }}>
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* MOBILE */}
      {isMobile && (
        <nav className="sidebar-root sidebar-mobile">
          <ul className="mobile-nav">
            {items.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `mobile-nav-link${isActive ? " active" : ""}`}
                >
                  <span className="mobile-icon">{item.icon}</span>
                  <span className="mobile-label">{item.label}</span>
                </NavLink>
              </li>
            ))}

            {/* Profile button in mobile nav */}
            <li>
              <NavLink
                to="/profile"
                className={({ isActive }) => `mobile-nav-link${isActive ? " active" : ""}`}
              >
                <div className="mobile-profile-avatar">{initials}</div>
                <span className="mobile-label">Profile</span>
              </NavLink>
            </li>
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