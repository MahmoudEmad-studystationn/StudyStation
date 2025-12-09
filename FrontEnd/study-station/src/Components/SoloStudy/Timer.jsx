import React, { useEffect, useState } from "react";
import { useThemeContext } from "../Theme/ThemeContext";

const Timer = () => {
    const { isDarkMode } = useThemeContext();

    const [timeLeft, setTimeLeft] = useState(() => {
        const saved = localStorage.getItem('timerTimeLeft');
        return saved ? parseInt(saved) : 25 * 60;
    });
    
    const [isRunning, setIsRunning] = useState(false);
    const [intervalId, setIntervalId] = useState(null);
    
    const [mode, setMode] = useState(() => {
        const saved = localStorage.getItem('timerMode');
        return saved || "focus";
    });
    
    const [currentSession, setCurrentSession] = useState(() => {
        const saved = localStorage.getItem('timerSession');
        return saved ? parseInt(saved) : 1;
    });
    
    const [showBreakModal, setShowBreakModal] = useState(false);
    const [showFocusModal, setShowFocusModal] = useState(false);
    const [showLongBreakModal, setShowLongBreakModal] = useState(false);

    const textPrimary = isDarkMode ? "#E5E7EB" : "#394f65ff";
    const textSecondary = isDarkMode ? "#B0B0B0" : "#6b6f76";
    const cardBg = isDarkMode ? "#2a2a2a36" : "transparent";
    const timerBorder = isDarkMode ? "#2C3E50" : "#E5E7EB";
    const buttonGradientFrom = isDarkMode ? "#2C3E50" : "#394f65ff";
    const buttonGradientTo = isDarkMode ? "#435363" : "#495d70ff";
    const buttonStopBg = isDarkMode ? "#404040" : "#E5E7EB";
    const buttonStopText = isDarkMode ? "#E5E7EB" : "#394f65ff";

    const durations = {
        focus: 25 * 60,
        shortBreak: 5 * 60,
        longBreak: 15 * 60,
    };

    // حفظ البيانات في localStorage كل ما تتغير
    useEffect(() => {
        localStorage.setItem('timerTimeLeft', timeLeft.toString());
    }, [timeLeft]);

    useEffect(() => {
        localStorage.setItem('timerMode', mode);
    }, [mode]);

    useEffect(() => {
        localStorage.setItem('timerSession', currentSession.toString());
    }, [currentSession]);

    const toggleTimer = () => {
        if (isRunning) {
            clearInterval(intervalId);
            setIntervalId(null);
            setIsRunning(false);
            return;
        }

        const id = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(id);
                    setIsRunning(false);
                    setIntervalId(null);

                    if (mode === "focus") {
                        if (currentSession < 4) {
                            setMode("shortBreak");
                            setTimeLeft(durations.shortBreak);
                            setShowBreakModal(true);
                        } else {
                            setMode("longBreak");
                            setTimeLeft(durations.longBreak);
                            setShowLongBreakModal(true);
                        }
                    } else if (mode === "shortBreak") {
                        setCurrentSession(currentSession + 1);
                        setMode("focus");
                        setTimeLeft(durations.focus);
                        setShowFocusModal(true);
                    } else if (mode === "longBreak") {
                        setCurrentSession(1);
                        setMode("focus");
                        setTimeLeft(durations.focus);
                        setShowFocusModal(true);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        setIntervalId(id);
        setIsRunning(true);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    const restartCycle = () => {
        setCurrentSession(1);
        setMode("focus");
        setTimeLeft(durations.focus);
        setShowBreakModal(false);
        setShowFocusModal(false);
        setShowLongBreakModal(false);
        if (isRunning) {
            clearInterval(intervalId);
            setIntervalId(null);
            setIsRunning(false);
        }
    };

    const getSessionText = () => {
        if (mode === "longBreak") return "Long Break";
        return `Session ${currentSession} of 4`;
    };

    useEffect(() => {
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [intervalId]);

    return (
        <div className="timer flex justify-start w-full max-w-[280px] md:max-w-[300px] lg:max-w-[320px] py-3 md:py-4 lg:py-4">
            <div className="container w-full">
                <div
                    className="flex flex-col justify-center items-center rounded-xl px-4 py-4 md:px-5 md:py-5 lg:px-6 lg:py-6 shadow-md backdrop-blur-md"
                    style={{
                        backgroundColor: cardBg,
                        boxShadow: isDarkMode
                            ? "0 10px 10px rgba(0, 0, 0, 0.3)"
                            : "0 10px 10px rgba(0, 0, 0, 0.08)",
                    }}
                >
                    <div
                        className="flex flex-col justify-center items-center w-36 h-36 md:w-44 md:h-44 lg:w-48 lg:h-48 rounded-full border-3 backdrop-blur-sm"
                        style={{
                            borderColor: timerBorder,
                            color: textPrimary,
                        }}
                    >
                        <h4 className="text-xs md:text-sm lg:text-sm mt-1" style={{ color: textPrimary, margin: 0 }}>
                            {mode === "focus" ? "Focus Session" :
                                mode === "shortBreak" ? "Short Break" :
                                    "Long Break"}
                        </h4>
                        <p className="text-2xl md:text-3xl lg:text-3xl font-bold my-1" style={{ color: textPrimary }}>
                            {formatTime(timeLeft)}
                        </p>
                        <p className="text-[10px] md:text-xs lg:text-xs" style={{ color: textSecondary }}>
                            {getSessionText()}
                        </p>
                        <button
                            onClick={toggleTimer}
                            className="w-8 h-8 md:w-9 md:h-9 lg:w-9 lg:h-9 rounded-full text-white shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                            style={{
                                background: `linear-gradient(to top right, ${buttonGradientFrom}, ${buttonGradientTo})`,
                                boxShadow: "0 4px 10px rgba(44, 62, 80, 0.4)",
                            }}
                        >
                            {isRunning ? (
                                <i className="fa-solid fa-pause text-xs md:text-sm"></i>
                            ) : (
                                <i className="fa-solid fa-play text-xs md:text-sm"></i>
                            )}
                        </button>
                    </div>

                    <div className="pt-3 flex flex-row gap-2 w-full">
                        <button
                            onClick={restartCycle}
                            className="flex items-center justify-center rounded-lg px-2 py-1.5 md:px-3 md:py-2 lg:px-3 lg:py-2 text-white shadow-md transition-all hover:shadow-md active:opacity-85 text-[11px] md:text-xs lg:text-xs flex-1"
                            style={{
                                background: `linear-gradient(to top right, ${buttonGradientFrom}, ${buttonGradientTo})`,
                                boxShadow: "0 4px 12px rgba(44, 62, 80, 0.35)",
                            }}
                        >
                            <div className="flex items-center gap-1">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-4 lg:h-4"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="font-semibold">Restart</span>
                            </div>
                        </button>

                        <button
                            onClick={() => {
                                setIsRunning(false);
                                clearInterval(intervalId);
                                setIntervalId(null);
                                setTimeLeft(durations.focus);
                                setMode("focus");
                                setShowBreakModal(false);
                                setShowFocusModal(false);
                                setShowLongBreakModal(false);
                            }}
                            className="flex items-center justify-center rounded-lg px-2 py-1.5 md:px-3 md:py-2 lg:px-3 lg:py-2 shadow-md transition-all hover:shadow-lg active:opacity-85 text-[11px] md:text-xs lg:text-xs flex-1"
                            style={{
                                backgroundColor: buttonStopBg,
                                color: buttonStopText,
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                            }}
                        >
                            <div className="flex items-center gap-1">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-4 lg:h-4"
                                >
                                    <path d="M5.25 3A2.25 2.25 0 0 0 3 5.25v9.5A2.25 2.25 0 0 0 5.25 17h9.5A2.25 2.25 0 0 0 17 14.75v-9.5A2.25 2.25 0 0 0 14.75 3h-9.5Z" />
                                </svg>
                                <span className="font-semibold">Stop</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timer;