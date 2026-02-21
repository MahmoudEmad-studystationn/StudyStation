import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUser } from "@fortawesome/free-solid-svg-icons";
import DarkModeToggle from "../Theme/DarkModeToggle";
import { useThemeContext } from "../Theme/ThemeContext";

function HeaderIcons() {
    const { isDarkMode } = useThemeContext();

    const cardBg = isDarkMode ? "#2A2A2A" : "white";
    const textPrimary = isDarkMode ? "#E0E0E0" : "#2f3b48";
    const borderColor = isDarkMode ? "#404040" : "#d1d5db";

    const iconButtonStyle = {
        backgroundColor: cardBg,
        color: textPrimary,
        borderColor: borderColor,
        boxShadow: isDarkMode
            ? "0 10px 16px rgba(0,0,0,0.3)"
            : "0 10px 16px rgba(0,0,0,0.08)",
    };

    return (
        <div className="flex items-center gap-1.5 sm:gap-2.5">
            <DarkModeToggle />

            <button
                className="rounded-xl p-2 sm:p-2.5 min-w-[36px] sm:min-w-[40px] min-h-[36px] sm:min-h-[40px] flex items-center justify-center shadow-lg cursor-pointer transition-all duration-300"
                style={iconButtonStyle}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = isDarkMode ? "#404040" : "#f5f6f7")
                }
                onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = cardBg)
                }
            >
                <FontAwesomeIcon icon={faBell} className="text-xs sm:text-sm" />
            </button>

            <button
                className="rounded-xl p-2 sm:p-2.5 min-w-[36px] sm:min-w-[40px] min-h-[36px] sm:min-h-[40px] flex items-center justify-center shadow-lg cursor-pointer transition-all duration-300"
                style={iconButtonStyle}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = isDarkMode ? "#404040" : "#f5f6f7")
                }
                onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = cardBg)
                }
            >
                <FontAwesomeIcon icon={faUser} className="text-xs sm:text-sm" />
            </button>
        </div>
    );
}

export default HeaderIcons;