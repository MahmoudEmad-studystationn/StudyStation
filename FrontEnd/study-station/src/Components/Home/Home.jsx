import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeadphones,
  faUserGroup,
  faPenToSquare,
  faFloppyDisk,
  faBell,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import postsImage from "./posts.jpg";
import DarkModeToggle from "../Theme/DarkModeToggle";
import { useTheme } from "@mui/material/styles";
import { useThemeContext } from "../Theme/ThemeContext";

function Home() {
  const theme = useTheme();
  const { isDarkMode } = useThemeContext();

  const bgColor = isDarkMode ? "#171717" : "#F3F4F6";
  const cardBg = isDarkMode ? "#2A2A2A" : "white";
  const textPrimary = isDarkMode ? "#E0E0E0" : "#2f3b48";
  const textSecondary = isDarkMode ? "#B0B0B0" : "#6b6f76";
  const textAccent = isDarkMode ? "#8FB7CC" : "#4e87a8";
  const borderColor = isDarkMode ? "#404040" : "#d1d5db";
  const iconBg = isDarkMode ? "#363636" : "#eef1f4";
  const iconBorder = isDarkMode ? "#505050" : "#d5d9de";
  const buttonBg = "#2c3e50";
  const buttonHover = "#3a4958";

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: bgColor }}
    >
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex justify-between items-start mb-6 flex-wrap gap-4">
          <div>
            <h1 className="m-0 text-[28px] font-semibold" style={{ color: textPrimary }}>
              <span style={{ color: textAccent, fontWeight: 600 }}>Welcome, User</span>
            </h1>
            <p className="mt-1.5 text-lg" style={{ color: textSecondary }}>
              Your goals are waiting for you.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <DarkModeToggle />
            <button
              className="rounded-xl p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center shadow-lg cursor-pointer transition-all"
              style={{
                backgroundColor: cardBg,
                color: textPrimary,
                borderColor: borderColor,
                boxShadow: isDarkMode ? "0 10px 16px rgba(0,0,0,0.3)" : "0 10px 16px rgba(0,0,0,0.08)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDarkMode ? "#404040" : "#f5f6f7")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = cardBg)}
            >
              <FontAwesomeIcon icon={faBell} />
            </button>
            <button
              className="rounded-xl p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center shadow-lg cursor-pointer transition-all"
              style={{
                backgroundColor: cardBg,
                color: textPrimary,
                borderColor: borderColor,
                boxShadow: isDarkMode ? "0 10px 16px rgba(0,0,0,0.3)" : "0 10px 16px rgba(0,0,0,0.08)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDarkMode ? "#404040" : "#f5f6f7")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = cardBg)}
            >
              <FontAwesomeIcon icon={faUser} />
            </button>
          </div>
        </header>

        {/* Top Cards */}
        <section className="grid gap-8 grid-cols-1 md:grid-cols-2 mb-10">
          {/* Solo Study Card */}
          <div
            className="rounded-2xl p-3 shadow-lg border-b relative transition-all duration-300"
            style={{
              backgroundColor: cardBg,
              borderColor: borderColor,
              boxShadow: isDarkMode ? "0 8px 16px rgba(0,0,0,0.3)" : "0 8px 16px rgba(0,0,0,0.07)",
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-11 h-11 rounded-[10px] flex items-center justify-center text-lg font-medium"
                style={{ backgroundColor: iconBg, borderColor: iconBorder, color: textPrimary }}
              >
                <FontAwesomeIcon icon={faHeadphones} />
              </div>
              <h3 className="m-0 text-[19px] font-semibold tracking-[-0.03em] uppercase" style={{ color: textPrimary }}>
                SOLO STUDY
              </h3>
            </div>
            <p className="my-2.5 mb-4 leading-relaxed text-md max-w-[90%]" style={{ color: textSecondary }}>
              Start a focused solo session with built-in timers and sounds.
            </p>
            <button
              className="py-2.5 px-3.5 rounded-lg text-sm font-medium cursor-pointer shadow-md transition-colors"
              style={{
                backgroundColor: buttonBg,
                color: "white",
                boxShadow: "0 10px 16px rgba(0,0,0,0.15)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = buttonHover)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = buttonBg)}
            >
              Start Focus Mode
            </button>
          </div>

          {/* Study with Friends Card */}
          <div
            className="rounded-2xl p-3 shadow-lg border-b relative transition-all duration-300"
            style={{
              backgroundColor: cardBg,
              borderColor: borderColor,
              boxShadow: isDarkMode ? "0 8px 16px rgba(0,0,0,0.3)" : "0 8px 16px rgba(0,0,0,0.07)",
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-11 h-11 rounded-[10px] flex items-center justify-center text-lg font-medium"
                style={{ backgroundColor: iconBg, borderColor: iconBorder, color: textPrimary }}
              >
                <FontAwesomeIcon icon={faUserGroup} />
              </div>
              <h3 className="m-0 text-[19px] font-semibold tracking-[-0.03em] uppercase" style={{ color: textPrimary }}>
                STUDY WITH FRIENDS
              </h3>
            </div>
            <p className="my-2.5 mb-4 leading-relaxed text-md max-w-[90%]" style={{ color: textSecondary }}>
              Join or create a group study room and stay productive together.
            </p>
            <button
              className="py-2.5 px-3.5 rounded-lg text-sm font-medium cursor-pointer shadow-md transition-colors"
              style={{
                backgroundColor: buttonBg,
                color: "white",
                boxShadow: "0 10px 16px rgba(0,0,0,0.15)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = buttonHover)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = buttonBg)}
            >
              Start Now
            </button>
          </div>
        </section>

        {/* Library Wide Card */}
        <section id="library" className="mb-10">
          <div
            className="rounded-2xl p-4 shadow-lg border-b relative flex flex-row justify-between items-start flex-nowrap gap-4 transition-all duration-300"
            style={{
              backgroundColor: cardBg,
              borderColor: borderColor,
              boxShadow: isDarkMode ? "0 8px 16px rgba(0,0,0,0.3)" : "0 8px 16px rgba(0,0,0,0.07)",
            }}
          >
            <div className="flex-1 min-w-[220px] flex flex-col justify-start max-w-[60%]">
              <h3 className="text-base font-semibold mb-1" style={{ color: textAccent, fontWeight: 700 }}>
                YOUR ALL-IN-ONE STUDY LIBRARY
              </h3>
              <p className="text-md leading-relaxed mt-1.5 mb-2" style={{ color: textSecondary }}>
                Explore courses, resources, and roadmap all in one place to make learning smooth and focused.
              </p>
              <div style={{ marginTop: "20px" }}>
                <button
                  className="py-2.5 px-3.5 rounded-lg text-sm font-medium cursor-pointer shadow-md transition-colors"
                  style={{
                    backgroundColor: buttonBg,
                    color: "white",
                    boxShadow: "0 10px 16px rgba(0,0,0,0.15)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = buttonHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = buttonBg)}
                >
                  Explore Now
                </button>
              </div>
            </div>

            <div className="flex flex-row flex-nowrap items-start gap-2.5 min-w-[290px] flex-0-0-auto">
              {/* Badge 1: Playlists & Courses */}
              <div>
                <span
                  className="py-2 px-3 rounded-lg text-[14px] leading-[1.3] font-medium inline-block flex-shrink-0 shadow-md text-center"
                  style={{
                    backgroundColor: "#8FB7CC",
                    color: "#fff",
                    boxShadow: "0 8px 14px rgba(0,0,0,0.15)",
                    minHeight: "100px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  Playlists & Courses
                  <p
                    style={{
                      marginTop: "6px",
                      color: "#fff",
                      width: "130px",
                      padding: "2px",
                      textAlign: "center",
                      fontSize: "12px",
                      fontWeight: 300,
                      lineHeight: "1.3",
                    }}
                  >
                    Ready-made playlists of top courses to guide you from beginner to pro.
                  </p>
                </span>
              </div>
              <div>
                <span
                  className="py-2 px-3 rounded-lg text-[14px] leading-[1.3] font-medium inline-block flex-shrink-0 shadow-md text-center"
                  style={{
                    backgroundColor: "rgba(143, 183, 204, 0.15)",
                    color: isDarkMode ? "#8FB7CC" : "#686868",
                    boxShadow: isDarkMode
                      ? "0 8px 14px rgba(0,0,0,0.3)"
                      : "0 8px 14px rgba(0,0,0,0.08)",
                    minHeight: "100px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  Resources &amp; Roadmaps
                  <p
                    style={{
                      marginTop: "6px",
                      color: isDarkMode ? "#8FB7CC" : "#686868",
                      width: "130px",
                      padding: "2px",
                      textAlign: "center",
                      fontSize: "12px",
                      fontWeight: 300,
                      lineHeight: "1.3",
                    }}
                  >
                    Study materials and track roadmaps to stay on the right path.
                  </p>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Cards */}
        <section className="grid gap-8 grid-cols-1 md:grid-cols-3">
          <div
            className="rounded-2xl p-3 shadow-lg border-b relative flex items-start justify-between gap-4 overflow-hidden transition-all duration-300 md:col-span-2"
            style={{
              backgroundColor: cardBg,
              borderColor: borderColor,
              boxShadow: isDarkMode ? "0 8px 16px rgba(0,0,0,0.3)" : "0 8px 16px rgba(0,0,0,0.07)",
            }}
            id="posts"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-11 h-11 rounded-[10px] flex items-center justify-center text-lg font-medium"
                  style={{ backgroundColor: iconBg, borderColor: iconBorder, color: textPrimary }}
                >
                  <FontAwesomeIcon icon={faPenToSquare} />
                </div>
                <h3 className="m-0 text-[19px] font-semibold tracking-[-0.03em] uppercase" style={{ color: textPrimary }}>
                  POSTS
                </h3>
              </div>
              <p className="my-2.5 mb-4 leading-relaxed text-md max-w-[80%]" style={{ color: textSecondary }}>
                Explore study tips, quick resources, and interactive posts to join live study rooms and share your progress.
              </p>
              <button
                className="py-2.5 px-3.5 rounded-lg text-sm font-medium cursor-pointer shadow-md transition-colors"
                style={{
                  backgroundColor: buttonBg,
                  color: "white",
                  boxShadow: "0 10px 16px rgba(0,0,0,0.15)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = buttonHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = buttonBg)}
              >
                Start Exploring
              </button>
            </div>
            <div className="w-[190px] flex-shrink-0 flex items-end justify-center">
              <img src={postsImage} alt="Posts preview" className="w-full h-auto object-contain block" />
            </div>
          </div>

          <div
            className="rounded-2xl p-3 shadow-lg border-b relative transition-all duration-300 md:col-span-1"
            style={{
              backgroundColor: cardBg,
              borderColor: borderColor,
              boxShadow: isDarkMode ? "0 8px 16px rgba(0,0,0,0.3)" : "0 8px 16px rgba(0,0,0,0.07)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div className="flex items-center gap-3 mb-2" style={{ justifyContent: "center" }}>
              <div
                className="w-11 h-11 rounded-[10px] flex items-center justify-center text-lg font-medium"
                style={{ backgroundColor: iconBg, borderColor: iconBorder, color: textPrimary }}
              >
                <FontAwesomeIcon icon={faFloppyDisk} />
              </div>
              <h3 className="m-0 text-[19px] font-semibold tracking-[-0.03em] uppercase" style={{ color: textPrimary }}>
                My Saves
              </h3>
            </div>
            <p className="my-2.5 mb-4 leading-relaxed text-md max-w-[90%] text-center" style={{ color: textSecondary }}>
              Your go-to spot for everything you've marked to check later.
            </p>
            <button
              className="py-2.5 px-7 rounded-lg text-sm font-medium cursor-pointer shadow-md transition-colors"
              style={{
                backgroundColor: buttonBg,
                color: "white",
                boxShadow: "0 10px 16px rgba(0,0,0,0.15)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = buttonHover)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = buttonBg)}
            >
              Open Saved
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;