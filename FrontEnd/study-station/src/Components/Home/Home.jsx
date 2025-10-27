import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faHouse,
  faHeadphones,
  faUsers,
  faUser,
  faFolder,
  faPenToSquare,
  faRightFromBracket,
  faMoon,
  faBell,
  faUserGroup,
  faFloppyDisk,
} from "@fortawesome/free-solid-svg-icons";
import postsImage from "./posts.jpg";


function Home() {
  return (
    <div className="max-w-[1200px] mx-auto px-4">
      {/* Main */}
      <main className="flex-1 min-w-0">
        {/* Header */}
        <header
          style={{ marginTop: "20px" }}
          className="flex justify-between items-start mb-3 flex-wrap gap-4"
        >
          <div>
            <h1 className="m-0 text-[28px] font-semibold text-[#2f3b48]">
              <span className="text-[#4e87a8] font-semibold">Welcome, User</span>
            </h1>
            <p className="mt-1.5 text-[#6b6f76] text-sm">
              Your goals are waiting for you.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button className="border-0 bg-white rounded-xl p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center shadow-[0_10px_16px_rgba(0,0,0,0.08)] cursor-pointer text-[#2f3b48] border border-[#d6d8dc] text-sm hover:bg-[#f5f6f7] transition-colors">
              <FontAwesomeIcon icon={faMoon} />
            </button>
            <button className="border-0 bg-white rounded-xl p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center shadow-[0_10px_16px_rgba(0,0,0,0.08)] cursor-pointer text-[#2f3b48] border border-[#d6d8dc] text-sm hover:bg-[#f5f6f7] transition-colors">
              <FontAwesomeIcon icon={faBell} />
            </button>
            <button className="border-0 bg-white rounded-xl p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center shadow-[0_10px_16px_rgba(0,0,0,0.08)] cursor-pointer text-[#2f3b48] border border-[#d6d8dc] text-sm hover:bg-[#f5f6f7] transition-colors">
              <FontAwesomeIcon icon={faUser} />
            </button>
          </div>
        </header>

        {/* Top cards */}
        <section className="grid gap-8 grid-cols-1 md:grid-cols-2">
          <div className="bg-white rounded-2xl p-3 shadow-[0_8px_16px_rgba(0,0,0,0.07)] border-b border-[#d1d5db] relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-[10px] bg-[#eef1f4] border border-[#d5d9de] flex items-center justify-center text-lg text-[#2C3E50] font-medium">
                <FontAwesomeIcon icon={faHeadphones} />
              </div>
              <h3 className="m-0 text-[19px] font-semibold text-[#2f3b48] tracking-[-0.03em] uppercase">
                SOLO STUDY
              </h3>
            </div>
            <p className="my-2.5 mb-4 text-[#6b6f76] leading-relaxed text-sm max-w-[90%]">
              Start a focused solo session with built-in timers and sounds.
            </p>
            <button className="bg-[#2c3e50] text-white border-0 py-2.5 px-3.5 rounded-lg text-sm font-medium cursor-pointer shadow-[0_10px_16px_rgba(0,0,0,0.15)] hover:bg-[#3a4958] transition-colors">
              Start Focus Mode
            </button>
          </div>

          <div className="bg-white rounded-2xl p-3 shadow-[0_8px_16px_rgba(0,0,0,0.07)] border-b border-[#d1d5db] relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-[10px] bg-[#eef1f4] border border-[#d5d9de] flex items-center justify-center text-lg text-[#2C3E50] font-medium">
                <FontAwesomeIcon icon={faUserGroup} />
              </div>
              <h3 className="m-0 text-[19px] font-semibold text-[#2f3b48] tracking-[-0.03em] uppercase">
                STUDY WITH FRIENDS
              </h3>
            </div>
            <p className="my-2.5 mb-4 text-[#6b6f76] leading-relaxed text-sm max-w-[90%]">
              Join or create a group study room and stay productive together.
            </p>
            <button className="bg-[#2c3e50] text-white border-0 py-2.5 px-3.5 rounded-lg text-sm font-medium cursor-pointer shadow-[0_10px_16px_rgba(0,0,0,0.15)] hover:bg-[#3a4958] transition-colors">
              Start Now
            </button>
          </div>
        </section>

        {/* Library wide card */}
        <section id="library" className="grid gap-8 mt-10 mb-10">
          <div className="bg-white rounded-2xl p-4 shadow-[0_8px_16px_rgba(0,0,0,0.07)] border-b border-[#d1d5db] relative flex flex-row justify-between items-start flex-nowrap gap-4">
            <div className="flex-1 min-w-[220px] flex flex-col justify-start max-w-[60%]">
              <h3
                className="text-[#4e87a8] text-base font-semibold my-0 mb-1"
                style={{ color: "#8FB7CC", fontWeight: "700" }}
              >
                YOUR ALL-IN-ONE STUDY LIBRARY
              </h3>
              <p className="text-[#6b6f76] text-sm leading-relaxed mt-1.5 mb-2">
                Explore courses, resources, and roadmap all in one place to make
                learning smooth and focused.
              </p>
              <p className="m-0 flex-0-0-auto" style={{ marginTop: "20px" }}>
                <button className="bg-[#2c3e50] text-white border-0 py-2.5 px-3.5 rounded-lg text-sm font-medium cursor-pointer shadow-[0_10px_16px_rgba(0,0,0,0.15)] hover:bg-[#3a4958] transition-colors">
                  Explore Now
                </button>
              </p>
            </div>

            <div className="flex flex-row flex-nowrap items-start gap-2.5 min-w-[290px] flex-0-0-auto">
              <p className="m-0 flex-0-0-auto">
                <span className="bg-[#6d96ad] border border-black/10 text-white py-2 px-3 rounded-lg text-[13px] leading-[1.3] font-medium inline-block flex-shrink-0 shadow-[0_8px_14px_rgba(0,0,0,0.15)] text-center">
                  Playlists & Courses
                  <p
                    style={{
                      marginTop: "6px",
                      color: "#fff",
                      width: "130px",
                      padding: "2px",
                      height: "52px",
                      textAlign: "center",
                      fontSize: "11px",
                      fontWeight: "300",
                    }}
                  >
                    Ready-made playlists of top courses to guide you from
                    beginner to pro.
                  </p>
                </span>
              </p>

              <p className="m-0 flex-0-0-auto">
                <span className="bg-[#f5f6f7] border border-[#d6d8dc] text-[#686868] py-2 px-3 rounded-lg text-[13px] leading-[1.3] font-medium inline-block flex-shrink-0">
                  Resources &amp; Roadmaps
                  <p
                    style={{
                      marginTop: "6px",
                      color: "#686868",
                      width: "130px",
                      padding: "2px",
                      height: "auto",
                      textAlign: "center",
                      fontSize: "11px",
                      fontWeight: "300",
                    }}
                  >
                    Study materials and track roadmaps to stay on the right
                    path.
                  </p>
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* Bottom cards */}
        <section className="grid gap-8 grid-cols-1 md:grid-cols-2">
          <div
            className="bg-white rounded-2xl p-3 shadow-[0_8px_16px_rgba(0,0,0,0.07)] border-b border-[#d1d5db] relative flex items-start justify-between gap-4 overflow-hidden"
            id="posts"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 rounded-[10px] bg-[#eef1f4] border border-[#d5d9de] flex items-center justify-center text-lg text-[#2C3E50] font-medium">
                  <FontAwesomeIcon icon={faPenToSquare} />
                </div>
                <h3 className="m-0 text-[19px] font-semibold text-[#2f3b48] tracking-[-0.03em] uppercase">
                  POSTS
                </h3>
              </div>

              <p className="my-2.5 mb-4 text-[#6b6f76] leading-relaxed text-sm max-w-[80%]" style={{ width: "350px" }}>
                Explore study tips, quick resources, and interactive posts to
                join live study rooms and share your progress.
              </p>

              <button className="bg-[#2c3e50] text-white border-0 py-2.5 px-3.5 rounded-lg text-sm font-medium cursor-pointer shadow-[0_10px_16px_rgba(0,0,0,0.15)] hover:bg-[#3a4958] transition-colors">
                Start Exploring
              </button>
            </div>

            <div className="w-[190px] flex-shrink-0 flex items-end justify-center">
              <img
                src={postsImage}
                alt="Posts preview"
                className="w-full h-auto object-contain block"
              />
            </div>
          </div>

          <div
            className="bg-white rounded-2xl p-3 shadow-[0_8px_16px_rgba(0,0,0,0.07)] border-b border-[#d1d5db] relative"
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              className="flex items-center gap-3 mb-2"
              style={{ justifyContent: "center", marginLeft: "-10px" }}
            >
              <div className="w-11 h-11 rounded-[10px] bg-[#eef1f4] border border-[#d5d9de] flex items-center justify-center text-lg text-[#2C3E50] font-medium">
                <FontAwesomeIcon icon={faFloppyDisk} />
              </div>
              <h3 className="m-0 text-[19px] font-semibold text-[#2f3b48] tracking-[-0.03em] uppercase">
                My Saves
              </h3>
            </div>
            <p
              className="my-2.5 mb-4 text-[#6b6f76] leading-relaxed text-sm max-w-[90%]"
              style={{ textAlign: "center", margin: "8px auto" }}
            >
              Your go-to spot for everything you've marked to check later.
            </p>
            <button
              className="bg-[#2c3e50] text-white border-0 py-2.5 px-3.5 rounded-lg text-sm font-medium cursor-pointer shadow-[0_10px_16px_rgba(0,0,0,0.15)] hover:bg-[#3a4958] transition-colors"
              style={{ padding: "10px 30px", margin: "10px auto" }}
            >
              Open Saved
            </button>
          </div>
        </section>
      </main>
    </div>
  );


}

export default Home;
