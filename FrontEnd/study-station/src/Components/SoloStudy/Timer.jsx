import React, { useEffect, useState } from "react";
import { useThemeContext } from "../Theme/ThemeContext";

const SoloStudy = () => {
    const { isDarkMode } = useThemeContext();

    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [intervalId, setIntervalId] = useState(null);
    const [mode, setMode] = useState("focus");
    const [showBreakModal, setShowBreakModal] = useState(false);
    const [showFocusModal, setShowFocusModal] = useState(false);
    const [showLongBreakModal, setShowLongBreakModal] = useState(false);
    const [currentSession, setCurrentSession] = useState(1);

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

    const startBreak = () => {
        setShowBreakModal(false);
        toggleTimer();
    };

    const startFocus = () => {
        setShowFocusModal(false);
        toggleTimer();
    };

    const startLongBreak = () => {
        setShowLongBreakModal(false);
        toggleTimer();
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
        <>
            <div className="timer flex justify-start w-full lg:w-1/4 lg:h-1/2 py-5">
                <div className="container w-full">
                    <div
                        className="flex flex-col justify-center items-center rounded-xl px-6 sm:px-10 lg:px-16 py-6 sm:py-8 lg:py-10 shadow-md backdrop-blur-md"
                        style={{
                            backgroundColor: cardBg,
                            boxShadow: isDarkMode
                                ? "0 10px 20px rgba(0, 0, 0, 0.3)"
                                : "0 10px 20px rgba(0, 0, 0, 0.08)",
                        }}
                    >
                        <div
                            className="flex flex-col justify-center items-center w-48 h-48 sm:w-56 sm:h-56 md:w-60 md:h-60 lg:w-64 lg:h-64 rounded-full border-4 backdrop-blur-sm"
                            style={{
                                borderColor: timerBorder,
                                color: textPrimary,
                            }}
                        >
                            <h4 className="text-sm sm:text-base lg:text-lg" style={{ color: textPrimary, margin: 0 }}>
                                {mode === "focus" ? "Focus Session" :
                                    mode === "shortBreak" ? "Short Break" :
                                        "Long Break"}
                            </h4>
                            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold my-1 sm:my-2" style={{ color: textPrimary }}>
                                {formatTime(timeLeft)}
                            </p>
                            <p className="text-xs sm:text-sm lg:text-base" style={{ color: textSecondary }}>
                                {getSessionText()}
                            </p>
                            <button
                                onClick={toggleTimer}
                                className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full text-white shadow-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                                style={{
                                    background: `linear-gradient(to top right, ${buttonGradientFrom}, ${buttonGradientTo})`,
                                    boxShadow: "0 4px 10px rgba(44, 62, 80, 0.4)",
                                }}
                            >
                                {isRunning ? (
                                    <i className="fa-solid fa-pause text-sm"></i>
                                ) : (
                                    <i className="fa-solid fa-play text-sm"></i>
                                )}
                            </button>
                        </div>

                        <div className="py-3 flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                            <button
                                onClick={restartCycle}
                                className="flex items-center justify-center rounded-lg px-3 py-2 sm:px-4 text-white shadow-md transition-all hover:shadow-lg active:opacity-85 text-xs sm:text-sm flex-1"
                                style={{
                                    background: `linear-gradient(to top right, ${buttonGradientFrom}, ${buttonGradientTo})`,
                                    boxShadow: "0 4px 12px rgba(44, 62, 80, 0.35)",
                                }}
                            >
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="w-4 h-4 sm:w-5 sm:h-5"
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
                                className="flex items-center justify-center rounded-lg px-3 py-2 sm:px-4 shadow-md transition-all hover:shadow-lg active:opacity-85 text-xs sm:text-sm flex-1"
                                style={{
                                    backgroundColor: buttonStopBg,
                                    color: buttonStopText,
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                                }}
                            >
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="w-4 h-4 sm:w-5 sm:h-5"
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
            {showBreakModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div
                        className="rounded-xl p-6 sm:p-8 max-w-sm w-full shadow-2xl"
                        style={{
                            backgroundColor: isDarkMode ? "#1B1B1B" : "#FFFFFF",
                            color: isDarkMode ? "#FFFFFF" : "#1F2937",
                            boxShadow: isDarkMode
                                ? "0 20px 40px rgba(0, 0, 0, 0.6)"
                                : "0 20px 40px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        <div className="text-center">
                            <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 bg-[#2D3F51]
                                `}>
                                <i className={`fa-solid fa-mug-hot text-2xl text-[#8FB7CC]
                                    `}></i>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Short Break!</h3>
                            <p className={`text-sm mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                Take a quick break!
                            </p>
                            <button
                                onClick={startBreak}
                                className="w-full py-3 px-4 rounded-lg text-white font-semibold transition-all hover:scale-105 active:scale-95"
                                style={{
                                    background: `linear-gradient(to top right, ${buttonGradientFrom}, ${buttonGradientTo})`,
                                }}
                            >
                                Start Break
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showFocusModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div
                        className="rounded-xl p-6 sm:p-8 max-w-sm w-full shadow-2xl"
                        style={{
                            backgroundColor: isDarkMode ? "#1B1B1B" : "#FFFFFF",
                            color: isDarkMode ? "#FFFFFF" : "#1F2937",
                            boxShadow: isDarkMode
                                ? "0 20px 40px rgba(0, 0, 0, 0.6)"
                                : "0 20px 40px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        <div className="text-center">
                            <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 bg-[#2D3F51]
                                `}>
                                <i className={`fa-solid fa-brain text-2xl text-[#8FB7CC]`}></i>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Ready to Focus!</h3>
                            <p className={`text-sm mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                Next session awaits!
                            </p>
                            <button
                                onClick={startFocus}
                                className="w-full py-3 px-4 rounded-lg text-white font-semibold transition-all hover:scale-105 active:scale-95"
                                style={{
                                    background: `linear-gradient(to top right, ${buttonGradientFrom}, ${buttonGradientTo})`,
                                }}
                            >
                                Start Focus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showLongBreakModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div
                        className="rounded-xl p-6 sm:p-8 max-w-sm w-full shadow-2xl"
                        style={{
                            backgroundColor: isDarkMode ? "#1B1B1B" : "#FFFFFF",
                            color: isDarkMode ? "#FFFFFF" : "#1F2937",
                            boxShadow: isDarkMode
                                ? "0 20px 40px rgba(0, 0, 0, 0.6)"
                                : "0 20px 40px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        <div className="text-center">
                            <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 bg-[#2D3F51]`}>
                                <i className={`fa-solid fa-crown text-2xl text-[#8FB7CC]`}></i>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Great Job!</h3>
                            <p className={`text-sm mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                You completed 4 sessions!<br />Take a 15-minute long break!
                            </p>
                            <button
                                onClick={startLongBreak}
                                className="w-full py-3 px-4 rounded-lg text-white font-semibold transition-all hover:scale-105 active:scale-95"
                                style={{
                                    background: `linear-gradient(to top right, ${buttonGradientFrom}, ${buttonGradientTo})`,
                                }}
                            >
                                Enjoy Long Break
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SoloStudy;