import { useEffect, useRef, useState } from "react";
import { useThemeContext } from "../Theme/ThemeContext";

// ── sessionStorage helpers ──────────────────────────────────────────────────
const STORAGE_KEY = (roomId) => `timer_${roomId}`;

function loadState(roomId) {
    try {
        const saved = sessionStorage.getItem(STORAGE_KEY(roomId));
        if (saved) return JSON.parse(saved);
    } catch {}
    return null;
}

function saveState(roomId, state) {
    try {
        sessionStorage.setItem(STORAGE_KEY(roomId), JSON.stringify(state));
    } catch {}
}

export default function TimerStudyRoom({ roomId, onStart, onStop, isActive }) {
    const { isDarkMode } = useThemeContext();

    const DURATIONS = {
        focus:      25 * 60,
        shortBreak:  5 * 60,
        longBreak:  15 * 60,
    };

    // ─── Load saved state on first render ────────────────────────────────────
    const saved = loadState(roomId);

    const [timeLeft,       setTimeLeft]       = useState(saved?.timeLeft       ?? DURATIONS.focus);
    const [mode,           setMode]           = useState(saved?.mode           ?? "focus");
    const [currentSession, setCurrentSession] = useState(saved?.currentSession ?? 1);
    const [isRunning,      setIsRunning]      = useState(false); // دايمًا false عند refresh

    const prevRoomRef = useRef(roomId);

    // ─── Save state on every change ──────────────────────────────────────────
    useEffect(() => {
        saveState(roomId, { timeLeft, mode, currentSession });
    }, [timeLeft, mode, currentSession, roomId]);

    // ─── Reset when roomId changes ────────────────────────────────────────────
    useEffect(() => {
        if (prevRoomRef.current !== roomId) {
            prevRoomRef.current = roomId;
            const newSaved = loadState(roomId);
            setTimeLeft(newSaved?.timeLeft       ?? DURATIONS.focus);
            setMode(    newSaved?.mode           ?? "focus");
            setCurrentSession(newSaved?.currentSession ?? 1);
            setIsRunning(false);
        }
    }, [roomId]);

    // ─── Tick ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isRunning) return;
        if (timeLeft <= 0) { handleSwitch(); return; }
        const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(id);
    }, [isRunning, timeLeft]);

    // ─── Auto-switch after mode ends ─────────────────────────────────────────
    function handleSwitch() {
        setIsRunning(false);
        if (mode === "focus") {
            if (currentSession < 4) {
                setMode("shortBreak");
                setTimeLeft(DURATIONS.shortBreak);
            } else {
                setMode("longBreak");
                setTimeLeft(DURATIONS.longBreak);
            }
        } else {
            const nextSess = mode === "longBreak" ? 1 : currentSession + 1;
            setCurrentSession(nextSess);
            setMode("focus");
            setTimeLeft(DURATIONS.focus);
        }
    }

    // ─── Toggle run ───────────────────────────────────────────────────────────
    function toggleRun() {
        if (!isRunning) {
            if (onStart) onStart(Math.floor(timeLeft / 60));
        } else {
            if (onStop) onStop();
        }
        setIsRunning(r => !r);
    }

    // ─── Restart ──────────────────────────────────────────────────────────────
    function restart() {
        if (onStop && isRunning) onStop();
        setIsRunning(false);
        setTimeLeft(DURATIONS.focus);
        setMode("focus");
        setCurrentSession(1);
        // امسح الـ saved state عشان يبدأ من الأول
        try { sessionStorage.removeItem(STORAGE_KEY(roomId)); } catch {}
    }

    // ─── Format ───────────────────────────────────────────────────────────────
    const fmt = (s) =>
        `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

    // ─── Tokens ───────────────────────────────────────────────────────────────
    const textPrimary = isDarkMode ? "#E5E7EB"     : "#1C2B38";
    const mutedColor  = isDarkMode ? "#8A9BAA"     : "#8A9BAA";
    const border      = isDarkMode ? "rgba(255,255,255,0.07)" : "rgba(44,62,80,0.08)";
    const btnBg       = isDarkMode ? "#3D718D"     : "#2C3E50";
    const restartBg   = isDarkMode ? "#252525"     : "#EAECF0";
    const restartClr  = isDarkMode ? "#A0AEC0"     : "#4A5568";

    const modeLabel = mode === "focus" ? "Focus" : mode === "shortBreak" ? "Short Break" : "Long Break";

    return (
        <div style={{ padding: "1.25rem", borderBottom: `1px solid ${border}` }}>
            {/* Section label */}
            <div style={{
                fontSize: ".68rem", fontWeight: 800, letterSpacing: ".06em",
                textTransform: "uppercase", color: mutedColor, marginBottom: "1rem",
                display: "flex", alignItems: "center", gap: 6,
            }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                Pomodoro Timer
            </div>

            {/* Circle clock */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
                <div style={{
                    width: 136, height: 136, borderRadius: "50%",
                    border: `3px solid ${isDarkMode ? "#2C3E50" : "#E2E8F0"}`,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    position: "relative",
                }}>
                    {isRunning && (
                        <div style={{
                            position: "absolute", inset: -4, borderRadius: "50%",
                            border: "3px solid #3D718D",
                            animation: "timerPulse 2s ease-in-out infinite",
                        }} />
                    )}
                    <span style={{ fontSize: ".62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: mutedColor, marginBottom: 2 }}>
                        {modeLabel}
                    </span>
                    <span style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-.03em", color: textPrimary, lineHeight: 1 }}>
                        {fmt(timeLeft)}
                    </span>
                    <span style={{ fontSize: ".62rem", color: mutedColor, marginTop: 4 }}>
                        Session {currentSession}/4
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", gap: 8 }}>
                <button
                    onClick={toggleRun}
                    style={{
                        flex: 1, padding: "8px 0", borderRadius: 10, border: "none",
                        background: btnBg, color: "#fff",
                        fontFamily: "inherit", fontSize: ".8rem", fontWeight: 700,
                        cursor: "pointer", display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 6, transition: "background .2s",
                    }}
                >
                    {isRunning ? (
                        <>
                            <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                            Pause
                        </>
                    ) : (
                        <>
                            <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                            {timeLeft === DURATIONS[mode === "shortBreak" ? "shortBreak" : mode === "longBreak" ? "longBreak" : "focus"] ? "Start" : "Resume"}
                        </>
                    )}
                </button>

                <button
                    onClick={restart}
                    title="Restart"
                    style={{
                        width: 36, height: 36, borderRadius: 10, border: "none",
                        background: restartBg, color: restartClr,
                        cursor: "pointer", display: "flex", alignItems: "center",
                        justifyContent: "center", transition: "background .2s", flexShrink: 0,
                    }}
                >
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                    </svg>
                </button>
            </div>

            <style>{`
                @keyframes timerPulse {
                    0%,100% { opacity: 1; transform: scale(1); }
                    50%     { opacity: .4; transform: scale(1.04); }
                }
            `}</style>
        </div>
    );
}