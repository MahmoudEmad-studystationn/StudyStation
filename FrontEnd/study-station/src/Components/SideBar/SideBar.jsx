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

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
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
    toast.success("Logged out successfully!");
    navigate("/", { replace: true });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');

        .sidebar-root {
          font-family: 'Sora', sans-serif;
        }

        /* ── DESKTOP ── */
        .sidebar-desktop {
          position: relative;
          z-index: 10;
          width: ${collapsed ? "84px" : "260px"};
          height: calc(100vh - 40px);
          margin: 20px;
          border-radius: 20px;
          background: linear-gradient(160deg, #0f1f2e 0%, #162433 60%, #1a2d40 100%);
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow:
            0 24px 48px rgba(0,0,0,0.35),
            inset 0 1px 0 rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
        }

        .sidebar-desktop::before {
          content: '';
          position: absolute;
          top: -60px;
          right: -40px;
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .sidebar-desktop::after {
          content: '';
          position: absolute;
          bottom: 60px;
          left: -30px;
          width: 140px;
          height: 140px;
          background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Brand */
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: ${collapsed ? "28px 0 0 0" : "28px 24px 0 24px"};
          justify-content: ${collapsed ? "center" : "flex-start"};
          overflow: hidden;
        }

        .brand-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #38bdf8, #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(56,189,248,0.3);
        }

        .brand-text {
          font-size: 16px;
          font-weight: 700;
          color: white;
          letter-spacing: 0.02em;
          white-space: nowrap;
          opacity: ${collapsed ? 0 : 1};
          width: ${collapsed ? 0 : "auto"};
          overflow: hidden;
          transition: opacity 0.2s ease, width 0.2s ease;
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

        /* Divider */
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          margin: 20px 16px;
        }

        /* Nav */
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
          transition: all 0.2s ease;
          justify-content: ${collapsed ? "center" : "flex-start"};
          white-space: nowrap;
          overflow: hidden;
        }

        .nav-link:hover {
          color: white;
          background: rgba(255,255,255,0.07);
        }

        .nav-link.active {
          color: white;
          background: linear-gradient(135deg, rgba(56,189,248,0.18), rgba(99,102,241,0.14));
          border: 1px solid rgba(56,189,248,0.2);
        }

        .nav-link.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: linear-gradient(180deg, #38bdf8, #6366f1);
          border-radius: 0 4px 4px 0;
        }

        .nav-icon {
          font-size: 17px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }

        .nav-label {
          opacity: ${collapsed ? 0 : 1};
          width: ${collapsed ? 0 : "auto"};
          overflow: hidden;
          transition: opacity 0.2s ease, width 0.2s ease;
        }

        /* Tooltip on collapsed */
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

        .nav-link:hover .tooltip {
          display: ${collapsed ? "block" : "none"};
        }

        /* Bottom area */
        .bottom-area {
          padding: 16px 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
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
          justify-content: ${collapsed ? "center" : "flex-start"};
          white-space: nowrap;
          overflow: hidden;
          position: relative;
        }

        .logout-btn:hover {
          color: #f87171;
          background: rgba(248,113,113,0.08);
        }

        .logout-label {
          opacity: ${collapsed ? 0 : 1};
          width: ${collapsed ? 0 : "auto"};
          overflow: hidden;
          transition: opacity 0.2s ease, width 0.2s ease;
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
          margin-left: auto;
        }

        .toggle-btn:hover {
          background: rgba(255,255,255,0.12);
          color: white;
        }

        .toggle-row {
          display: flex;
          align-items: center;
          margin-top: 8px;
          padding: 0 2px;
          justify-content: ${collapsed ? "center" : "flex-end"};
        }

        /* ── MOBILE bottom bar ── */
        .sidebar-mobile {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 68px;
          background: linear-gradient(180deg, rgba(11,22,32,0.97) 0%, rgba(15,31,46,0.99) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          padding: 0 4px;
          z-index: 1000;
          font-family: 'Sora', sans-serif;
          box-shadow: 0 -8px 24px rgba(0,0,0,0.3);
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

        .mobile-nav-link.active {
          color: #38bdf8;
        }

        .mobile-nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 2px;
          background: linear-gradient(90deg, #38bdf8, #6366f1);
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
      `}</style>

      {/* ── DESKTOP ── */}
      {!isMobile && (
        <aside className="sidebar-root sidebar-desktop">
          {/* Brand */}
          <div>
            <div className="brand">
              <div className="brand-icon-wrap">
                <IoBookSharp />
              </div>
              <div className="brand-text">
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
                    className={({ isActive }) =>
                      `nav-link${isActive ? " active" : ""}`
                    }
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                    <span className="tooltip">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom */}
          <div className="bottom-area">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
              {!collapsed && (
                <button className="logout-btn" onClick={handleLogout} style={{ flex: 1 }}>
                  <span className="logout-label">Logout</span>
                </button>
              )}
              <button
                className="toggle-btn"
                onClick={() => setCollapsed(!collapsed)}
                title="Toggle Sidebar"
              >
                <FaSignOutAlt
                  style={{
                    transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s ease",
                  }}
                />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ── MOBILE ── */}
      {isMobile && (
        <nav className="sidebar-root sidebar-mobile">
          <ul className="mobile-nav">
            {items.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `mobile-nav-link${isActive ? " active" : ""}`
                  }
                >
                  <span className="mobile-icon">{item.icon}</span>
                  <span className="mobile-label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          <button className="mobile-logout-btn" onClick={handleLogout}>
            <span className="mobile-icon">
              <FaSignOutAlt />
            </span>
            <span className="mobile-label">Logout</span>
          </button>
        </nav>
      )}
    </>
  );
}