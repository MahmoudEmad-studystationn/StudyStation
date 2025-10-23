import React, { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FaHome, FaBook, FaUsers, FaCog, FaBars, FaSignOutAlt } from "react-icons/fa";
import "./Sidebar.css"; // خليه لستايلات بسيطة، مثال تحت

export default function Sidebar() {
  // collapse state محفوظ في localStorage عشان يفضل بين الزيارات
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const val = localStorage.getItem("sidebar-collapsed");
      return val ? JSON.parse(val) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  const navItems = [
    { to: "/", label: "Home", icon: <FaHome /> },
    { to: "/courses", label: "Courses", icon: <FaBook /> },
    { to: "/community", label: "Community", icon: <FaUsers /> },
    { to: "/settings", label: "Settings", icon: <FaCog /> },
  ];

  return (
    <div className={`dashboard-shell ${collapsed ? "collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-top">
          <button
            className="btn-toggle"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed(c => !c)}
          >
            <FaBars />
          </button>

          <div className="brand">
            <img src="/logo192.png" alt="logo" className="logo" />
            {!collapsed && <span className="brand-text">StudyStation</span>}
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"} // make home match exactly
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="icon">{item.icon}</span>
              {!collapsed && <span className="label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <NavLink to="/logout" className="nav-item">
            <span className="icon"><FaSignOutAlt /></span>
            {!collapsed && <span className="label">Logout</span>}
          </NavLink>
        </div>
      </aside>

      <main className="content">
        {/* Outlet لعرض الـ Nested Routes داخل الـ Dashboard */}
        <Outlet />
      </main>
    </div>
  );
}
