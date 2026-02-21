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
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
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
      width: isMobile ? "100%" : (collapsed ? "80px" : "275px"),
      padding: isMobile ? "12px 20px" : "17px",
      backgroundColor: "#2C3E50",
      borderRadius: isMobile ? "16px 16px 0 0" : "16px",
      height: isMobile ? "auto" : "calc(100vh - 40px)",
      margin: isMobile ? "0" : "20px",
      display: "flex",
      flexDirection: isMobile ? "row" : "column",
      justifyContent: "space-between",
      alignItems: isMobile ? "center" : "stretch",
      boxShadow: "0 6px 18px rgba(9, 30, 40, 0.08)",
      color: "white",
      transition: "all 0.3s ease",
      position: isMobile ? "fixed" : "relative",
      bottom: isMobile ? "0" : "auto",
      left: "0",
      right: isMobile ? "0" : "auto",
      zIndex: 1000,
      fontFamily: "'Open Sans', sans-serif",
      fontWeight: "600",
    },
    brand: {
      display: isMobile ? "none" : "flex",
      alignItems: "center",
      gap: "12px",
      justifyContent: collapsed ? "center" : "flex-start",
      marginTop: "35px",
      marginLeft: collapsed ? "0" : "16px",
    },
    menuList: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "flex",
      flexDirection: isMobile ? "row" : "column",
      gap: isMobile ? "10px" : "22px",
      marginTop: isMobile ? "0" : "35px",
      marginLeft: isMobile ? "0" : (collapsed ? "0" : "16px"),
      justifyContent: isMobile ? "space-around" : "flex-start",
      flex: isMobile ? "1" : "0",
      maxWidth: isMobile ? "70%" : "100%",
    },
    baseNavLink: {
      textDecoration: "none",
      color: "white", 
      display: "flex",
      alignItems: "center",
      gap: isMobile ? "0" : "16px",
      padding: isMobile ? "8px" : "10px 12px",
      borderRadius: "8px",
      justifyContent: isMobile ? "center" : "flex-start",
      position: "relative",
      transition: "all 0.2s ease",
      flexDirection: isMobile ? "column" : "row",
    },
    activeNavLink: {
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: "8px",
    },
    hoverNavLink: {
      backgroundColor: "rgba(255,255,255,0.15)",
      transform: "translateX(3px)",
    },
    icon: {
      fontSize: isMobile ? "24px" : "22px",
    },
    label: {
      fontSize: isMobile ? "11px" : "16px",
      display: isMobile ? "block" : (collapsed ? "none" : "inline"),
      marginTop: isMobile ? "4px" : "0",
      whiteSpace: "nowrap",
    },
    bottomArea: {
      display: "flex",
      justifyContent: isMobile ? "center" : "space-between",
      alignItems: "center",
      margin: isMobile ? "0" : "20px 16px 15px 16px",
      flexDirection: isMobile ? "column" : "row",
      gap: isMobile ? "4px" : "0",
    },
    toggleBtn: {
      background: "transparent",
      border: "none",
      color: "white",
      fontSize: isMobile ? "24px" : "26px",
      cursor: "pointer",
      padding: "8px",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
    },
    logoutText: {
      fontSize: isMobile ? "11px" : "16px",
      marginLeft: isMobile ? "0" : "8px",
      marginTop: isMobile ? "4px" : "0",
      cursor: "pointer",
      color: "white",
      transition: "color 0.2s ease",
      fontFamily: "'Open Sans', sans-serif",
      fontWeight: "500",
      letterSpacing: "0.3px",
    },
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    navigate("/", { replace: true });
  };

  return (
    <aside style={styles.sidebar}>
      {!isMobile && (
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
                    if (!e.currentTarget.className.includes('active')) {
                      e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)"; 
                      e.currentTarget.style.transform = "translateX(3px)"; 
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.className.includes('active')) {
                      e.currentTarget.style.backgroundColor = "";
                      e.currentTarget.style.transform = "translateX(0px)";
                    }
                  }}
                >
                  <span style={styles.icon}>{item.icon}</span>
                  <span style={styles.label}>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isMobile && (
        <ul style={styles.menuList}>
          {items.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.path}
                style={({ isActive }) => ({
                  ...styles.baseNavLink,
                  ...(isActive ? styles.activeNavLink : {}),
                })}
              >
                <span style={styles.icon}>{item.icon}</span>
                <span style={styles.label}>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}

      <div style={styles.bottomArea}>
        {(!collapsed && !isMobile) && (
          <span
            style={styles.logoutText}
            onClick={handleLogout}
            onMouseEnter={(e) => (e.target.style.color = "#ddd")}
            onMouseLeave={(e) => (e.target.style.color = "white")}
          >
            Logout
          </span>
        )}

        <button
          style={styles.toggleBtn}
          onClick={() => isMobile ? handleLogout() : setCollapsed(!collapsed)}
          title={isMobile ? "Logout" : "Toggle Sidebar"}
        >
          <FaSignOutAlt
            style={{
              transform: (!isMobile && collapsed) ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          />
        </button>

        {isMobile && (
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