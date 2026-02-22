import React, { useState, useEffect } from "react";
import Timer from './Timer';
import Quotes from './Quotes';
import BackgroundWidget, { BackgroundProvider, BackgroundImage } from './Background';
import Sound from './Sound';
import MaximizeButton from "./MaximizeButton";
import ToDoList from './ToDoList';
import { useThemeContext } from "../Theme/ThemeContext";


function RotatePrompt() {
  const { isDarkMode } = useThemeContext();
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-[9999]"
      style={{ backgroundColor: isDarkMode ? "#171717" : "#f3f4f6" }}
    >
      <div style={{ animation: "rotateHint 2s ease-in-out infinite", fontSize: "64px" }}>
        📱
      </div>
      <div className="text-center px-8">
        <p className="text-lg font-semibold mb-1" style={{ color: isDarkMode ? "#E0E0E0" : "#2f3b48" }}>
          Rotate your device
        </p>
        <p className="text-sm" style={{ color: isDarkMode ? "#B0B0B0" : "#6b6f76" }}>
          Solo Study works best in landscape mode
        </p>
      </div>
      <style>{`
        @keyframes rotateHint {
          0%, 100% { transform: rotate(0deg); }
          40%       { transform: rotate(90deg); }
          60%       { transform: rotate(90deg); }
        }
      `}</style>
    </div>
  );
}

function useOrientation() {
  const getState = () => ({
    isMobile: window.innerWidth < 1024,
    isLandscape: window.innerWidth > window.innerHeight,
  });

  const [state, setState] = useState(getState);

  useEffect(() => {
    const update = () => setState(getState());
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return state;
}

const SoloStudy = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { isMobile, isLandscape } = useOrientation();

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (isMobile && !isLandscape) {
    return (
      <BackgroundProvider>
        {/* ✅ absolute بدل fixed عشان ميغطيش السايدبار */}
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <BackgroundImage />
          <RotatePrompt />
        </div>
      </BackgroundProvider>
    );
  }

  return (
    <BackgroundProvider>
      {/* ✅ شيلنا min-h-screen وخليناها h-full بس عشان تاخد المساحة المتبقية */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          minHeight: "100%",
          backgroundColor: "transparent",
        }}
      >
        <BackgroundImage />

        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "row",
            gap: "12px",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: isMobile ? "12px" : "24px 32px",
            minHeight: "100%",
          }}
        >
          {/* ── Left Column ── */}
          <div className="flex flex-col gap-3 w-auto">
            <div style={isMobile ? { transform: "scale(0.82)", transformOrigin: "top left" } : {}}>
              <Timer />
            </div>
            <div style={isMobile ? { transform: "scale(0.82)", transformOrigin: "top left" } : {}}>
              <ToDoList />
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="flex flex-col gap-3 w-auto items-end">
            <MaximizeButton />

            <div className="flex flex-row gap-3 justify-end items-start flex-wrap">
              <div style={isMobile ? { transform: "scale(0.82)", transformOrigin: "top right" } : {}}>
                <Quotes />
              </div>
              {!isFullscreen && (
                <div style={isMobile ? { transform: "scale(0.82)", transformOrigin: "top right" } : {}}>
                  <BackgroundWidget />
                </div>
              )}
            </div>

            <div style={isMobile ? { transform: "scale(0.82)", transformOrigin: "top right" } : {}}>
              <Sound isFullscreen={isFullscreen} />
            </div>
          </div>
        </div>
      </div>
    </BackgroundProvider>
  );
};

export default SoloStudy;