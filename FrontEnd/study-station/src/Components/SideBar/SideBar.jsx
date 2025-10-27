import React, { useState, useEffect } from "react";
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

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const items = [
    { icon: <FaHome />, label: "Home", path: "/home" },
    { icon: <FaHeadphones />, label: "Solo Study", path: "/solo-study" },
    { icon: <FaUsers />, label: "Study With Friends", path: "/study-with-friends" },
    { icon: <FaFolder />, label: "Library", path: "/library" },
    { icon: <FaFilePen />, label: "Posts", path: "/posts" },
  ];

  const styles = {
    sidebar: {
      margin: isMobile ? '10px' : 20,
      width: collapsed ? "80px" : (isMobile ? "100%" : "275px"),
      padding: isMobile ? "10px" : "17px",
      backgroundColor: "#2C3E50",
      borderRadius: "16px",
      height: isMobile ? "auto" : "calc(100vh - 32px)",
      minHeight: isMobile ? "60px" : "auto",
      display: "flex",
      flexDirection: isMobile ? "row" : "column",
      justifyContent: isMobile ? "space-between" : "space-between",
      alignItems: isMobile ? "center" : "stretch",
      boxShadow: "0 6px 18px rgba(9, 30, 40, 0.08)",
      color: "white",
      transition: "all 0.3s ease",
      overflow: isMobile ? "visible" : "hidden",
      position: isMobile ? "fixed" : "relative",
      bottom: isMobile ? "0" : "auto",
      left: "0",
      right: "0",
      zIndex: 1000,
      fontFamily: "'Open Sans', sans-serif",
      fontWeight: "600",
    },
    brand: {
      display: collapsed && isMobile ? "none" : "flex",
      alignItems: "center",
      gap: "12px",
      justifyContent: collapsed ? "center" : "flex-start",
      marginTop: isMobile ? "0" : "35px",
      marginLeft: collapsed ? "0" : "16px",
    },
    menuList: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: isMobile ? (collapsed ? "none" : "flex") : "flex",
      flexDirection: isMobile ? "row" : "column",
      gap: isMobile ? "15px" : "22px",
      marginTop: isMobile ? "0" : "35px",
      marginLeft: collapsed ? "0" : "16px",
      flexWrap: isMobile ? "wrap" : "nowrap",
      justifyContent: isMobile ? "center" : "flex-start",
    },
    baseNavLink: {
      textDecoration: "none",
      color: "white", 
      display: "flex",
      alignItems: "center",
      gap: isMobile ? "8px" : "16px",
      padding: isMobile ? "4px" : "6px 4px",
      borderRadius: "5px",
      justifyContent: collapsed ? "center" : "flex-start",
      position: "relative",
      transition: "all 0.2s ease",
    },
    activeNavLink: {
      textDecoration: "underline",
      textUnderlineOffset: "6px",
      textDecorationThickness: "2px",
      textDecorationColor: "#ffffff",
      backgroundColor: "rgba(255,255,255,0.05)",
      borderRadius: "8px",
    },
    icon: {
      fontSize: isMobile ? "20px" : "22px",
    },
    label: {
      fontSize: isMobile ? "14px" : "16px",
      display: collapsed ? "none" : "inline",
      position: "relative",
    },
    bottomArea: {
      display: "flex",
      justifyContent: collapsed ? "center" : "flex-start",
      alignItems: "center",
      margin: isMobile ? "0" : "20px 0 15px 16px",
    },
    toggleBtn: {
      background: "transparent",
      border: "none",
      color: "white",
      fontSize: isMobile ? "22px" : "26px",
      cursor: "pointer",
      padding: "8px",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
    },
    logoutText: {
      fontSize: "16px",
      marginLeft: "8px",
      cursor: "pointer",
      color: "white",
      transition: "color 0.2s ease",
      fontFamily: "'Open Sans', sans-serif",
      fontWeight: "500",
      letterSpacing: "0.3px",
    },
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login", { replace: true });
  };

  return (
    <aside style={styles.sidebar}>
      <div>
        <div style={styles.brand}>
          <span style={styles.icon}><IoBookSharp /></span>
          {!collapsed && (
            <span style={{ fontSize: "20px", fontWeight: "600" }}>
              Study Station
            </span>
          )}
        </div>

        <ul style={styles.menuList}>
          {items.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.path}
                style={({ isActive }) => ({
                  ...styles.baseNavLink,
                  ...(isActive ? styles.activeNavLink : {}),
                })}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)"; 
                  e.currentTarget.style.transform = "translateX(2px)"; 
                  e.currentTarget.style.padding = "15px 10px"; 
                  e.currentTarget.style.transition = "all 0.3s ease"; 
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "";
                  e.currentTarget.style.transform = "translateX(0px)";
                  e.currentTarget.style.padding = "6px 4px"; 
                  e.currentTarget.style.transition = "all 0.3s ease";
                }}
              >
                <span style={styles.icon}>{item.icon}</span>
                <span style={styles.label}>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div style={styles.bottomArea}>
        <button
          style={styles.toggleBtn}
          onClick={() => setCollapsed(!collapsed)}
        >
          <FaSignOutAlt
            style={{
              transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          />
        </button>

        {!collapsed && (
          <span
            style={styles.logoutText}
            onClick={handleLogout}
            onMouseEnter={(e) => (e.target.style.color = "#ddd")}
            onMouseLeave={(e) => (e.target.style.color = "white")}
          >
            Logout
          </span>
        )}
      </div>
    </aside>
  );
}