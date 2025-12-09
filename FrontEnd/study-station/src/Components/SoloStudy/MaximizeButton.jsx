import React, { useState, useEffect } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { useThemeContext } from "../Theme/ThemeContext";

const MaximizeButton = () => {
    const { isDarkMode } = useThemeContext();
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    };

    useEffect(() => {
        const handleChange = () => {
            const fullscreenNow = !!document.fullscreenElement;
            setIsFullscreen(fullscreenNow);

            // إخفاء/إظهار الـ sidebar (لو موجود)
            const sidebar = document.querySelector("aside");
            if (sidebar) {
                sidebar.style.display = fullscreenNow ? "none" : "flex";
            }
        };

        document.addEventListener("fullscreenchange", handleChange);
        return () => document.removeEventListener("fullscreenchange", handleChange);
    }, []);

    return (
        <button
            onClick={toggleFullscreen}
            style={{
                padding: "10px",
                borderRadius: "12px",
                minWidth: "auto",
                backgroundColor: isDarkMode ? "#2A2A2A" : "#e5e7eb",
                color: isDarkMode ? "#ffffff" : "#333333ff",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease-in-out",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode ? "#4a4949ff" : "#d1d5db";
                e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode ? "#2A2A2A" : "#e5e7eb";
                e.currentTarget.style.transform = "scale(1)";
            }}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
            {isFullscreen ? (
                <Minimize2 className="w-5 h-5" />
            ) : (
                <Maximize2 className="w-5 h-5" />
            )}
        </button>
    );
};

export default MaximizeButton;