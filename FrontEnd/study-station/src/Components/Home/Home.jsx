import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeadphones,
  faUserGroup,
  faPenToSquare,
  faFloppyDisk,
} from "@fortawesome/free-solid-svg-icons";
import postsImage from "./posts.jpg";
import { useThemeContext } from "../Theme/ThemeContext";
import { useNavigate } from "react-router-dom";
import HeaderIcons from "../Header/Headericons";

function Home() {
  const { isDarkMode } = useThemeContext();
  const navigate = useNavigate();

  // ✅ جيب الاسم من الـ JWT token
  const getFirstName = () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return "User";
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.given_name || payload.firstName || payload.name || "User";
    } catch {
      return "User";
    }
  };
  const firstName = getFirstName();

  const bgColor       = isDarkMode ? "#171717" : "#F3F4F6";
  const cardBg        = isDarkMode ? "#2A2A2A" : "white";
  const textPrimary   = isDarkMode ? "#E0E0E0" : "#2f3b48";
  const textSecondary = isDarkMode ? "#B0B0B0" : "#6b6f76";
  const textAccent    = isDarkMode ? "#8FB7CC" : "#4e87a8";
  const borderColor   = isDarkMode ? "#404040" : "#d1d5db";
  const iconBg        = isDarkMode ? "#363636" : "#eef1f4";
  const iconBorder    = isDarkMode ? "#505050" : "#d5d9de";
  const buttonBg      = "#2c3e50";
  const buttonHover   = "#3a4958";

  const cardStyle = {
    backgroundColor: cardBg,
    borderColor: borderColor,
    boxShadow: isDarkMode ? "0 8px 16px rgba(0,0,0,0.3)" : "0 8px 16px rgba(0,0,0,0.07)",
  };

  const iconStyle = { backgroundColor: iconBg, borderColor: iconBorder, color: textPrimary };

  const Btn = ({ onClick, children, style = {} }) => (
    <button
      onClick={onClick}
      style={{ backgroundColor: buttonBg, color: "white", boxShadow: "0 10px 16px rgba(0,0,0,0.15)", ...style }}
      className="py-2.5 px-4 rounded-lg text-sm font-medium cursor-pointer shadow-md transition-colors"
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = buttonHover)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = buttonBg)}
    >
      {children}
    </button>
  );

  return (
    <>
      <style>{`
        .home-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .home-grid-3 {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
        }
        .library-inner {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }
        .library-badges {
          display: flex;
          flex-direction: row;
          gap: 10px;
          flex-shrink: 0;
        }
        .posts-img {
          display: block;
        }

        @media (max-width: 768px) {
          .home-grid-2 {
            grid-template-columns: 1fr;
          }
          .home-grid-3 {
            grid-template-columns: 1fr;
          }
          .library-inner {
            flex-direction: column;
          }
          .library-badges {
            flex-direction: row;
            width: 100%;
            justify-content: center;
          }
          .library-badges span {
            flex: 1;
            min-width: 0;
          }
          .library-badges p {
            width: auto !important;
          }
          .posts-img {
            display: none;
          }
          .posts-card {
            flex-direction: column !important;
          }
        }
      `}</style>

      <div className="min-h-screen transition-colors duration-300" >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>

          {/* Header */}
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600, color: textPrimary }}>
                {/* ✅ بيعرض اسم اليوزر الحقيقي */}
                <span style={{ color: textAccent, fontWeight: 600 }}>Welcome, {firstName}</span>
              </h1>
              <p style={{ marginTop: 6, fontSize: 16, color: textSecondary }}>Your goals are waiting for you.</p>
            </div>
            <HeaderIcons />
          </header>

          {/* Solo + Friends */}
          <section style={{ marginBottom: 20 }}>
            <div className="home-grid-2">
              {/* Solo Study */}
              <div className="rounded-2xl p-3 shadow-lg border-b relative transition-all duration-300" style={cardStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <div className="w-11 h-11 rounded-[10px] flex items-center justify-center text-lg font-medium" style={iconStyle}>
                    <FontAwesomeIcon icon={faHeadphones} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: textPrimary, textTransform: "uppercase" }}>Solo Study</h3>
                </div>
                <p style={{ margin: "8px 0 16px", color: textSecondary, lineHeight: 1.6, fontSize: 14 }}>
                  Start a focused solo session with built-in timers and sounds.
                </p>
                <Btn onClick={() => navigate("/solo-study")}>Start Focus Mode</Btn>
              </div>

              {/* Study With Friends */}
              <div className="rounded-2xl p-3 shadow-lg border-b relative transition-all duration-300" style={cardStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <div className="w-11 h-11 rounded-[10px] flex items-center justify-center text-lg font-medium" style={iconStyle}>
                    <FontAwesomeIcon icon={faUserGroup} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: textPrimary, textTransform: "uppercase" }}>Study With Friends</h3>
                </div>
                <p style={{ margin: "8px 0 16px", color: textSecondary, lineHeight: 1.6, fontSize: 14 }}>
                  Join or create a group study room and stay productive together.
                </p>
                <Btn onClick={() => navigate("/study-with-friends")}>Start Now</Btn>
              </div>
            </div>
          </section>

          {/* Library */}
          <section style={{ marginBottom: 20 }}>
            <div className="rounded-2xl p-4 shadow-lg border-b transition-all duration-300" style={cardStyle}>
              <div className="library-inner">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: textAccent, textTransform: "uppercase" }}>
                    Your All-in-One Study Library
                  </h3>
                  <p style={{ margin: "0 0 20px", color: textSecondary, lineHeight: 1.6, fontSize: 14 }}>
                    Explore courses, resources, and roadmap all in one place to make learning smooth and focused.
                  </p>
                  <Btn onClick={() => navigate("/library")}>Explore Now</Btn>
                </div>

                <div className="library-badges">
                  <span style={{
                    backgroundColor: "#8FB7CC", color: "#fff",
                    padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500,
                    boxShadow: "0 8px 14px rgba(0,0,0,0.15)",
                    minHeight: 90, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center",
                  }}>
                    Playlists & Courses
                    <p style={{ marginTop: 6, fontSize: 11, fontWeight: 300, lineHeight: 1.4, color: "#fff", width: 120 }}>
                      Ready-made playlists of top courses to guide you from beginner to pro.
                    </p>
                  </span>
                  <span style={{
                    backgroundColor: "rgba(143,183,204,0.15)", color: isDarkMode ? "#8FB7CC" : "#686868",
                    padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500,
                    boxShadow: isDarkMode ? "0 8px 14px rgba(0,0,0,0.3)" : "0 8px 14px rgba(0,0,0,0.08)",
                    minHeight: 90, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center",
                  }}>
                    Resources & Roadmaps
                    <p style={{ marginTop: 6, fontSize: 11, fontWeight: 300, lineHeight: 1.4, color: isDarkMode ? "#8FB7CC" : "#686868", width: 120 }}>
                      Study materials and track roadmaps to stay on the right path.
                    </p>
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Posts + Saves */}
          <section>
            <div className="home-grid-3">
              {/* Posts */}
              <div className="rounded-2xl p-3 shadow-lg border-b transition-all duration-300 posts-card"
                style={{ ...cardStyle, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, overflow: "hidden" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <div className="w-11 h-11 rounded-[10px] flex items-center justify-center text-lg font-medium" style={iconStyle}>
                      <FontAwesomeIcon icon={faPenToSquare} />
                    </div>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: textPrimary, textTransform: "uppercase" }}>Posts</h3>
                  </div>
                  <p style={{ margin: "8px 0 16px", color: textSecondary, lineHeight: 1.6, fontSize: 14, maxWidth: "80%" }}>
                    Explore study tips, quick resources, and interactive posts to join live study rooms and share your progress.
                  </p>
                  <Btn onClick={() => navigate("/posts")}>Start Exploring</Btn>
                </div>
                <div className="posts-img" style={{ width: 170, flexShrink: 0 }}>
                  <img src={postsImage} alt="Posts preview" style={{ width: "100%", height: "auto", objectFit: "contain", display: "block" }} />
                </div>
              </div>

              {/* Saves */}
              <div className="rounded-2xl p-3 shadow-lg border-b transition-all duration-300"
                style={{ ...cardStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 8 }}>
                  <div className="w-11 h-11 rounded-[10px] flex items-center justify-center text-lg font-medium" style={iconStyle}>
                    <FontAwesomeIcon icon={faFloppyDisk} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: textPrimary, textTransform: "uppercase" }}>My Saves</h3>
                </div>
                <p style={{ margin: "8px 0 16px", color: textSecondary, lineHeight: 1.6, fontSize: 14 }}>
                  Your go-to spot for everything you've marked to check later.
                </p>
                <Btn style={{ paddingLeft: 28, paddingRight: 28 }}>Open Saved</Btn>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}

export default Home;