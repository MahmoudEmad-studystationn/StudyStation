import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useThemeContext } from "../Theme/ThemeContext";

export default function SearchBar({ search, setSearch }) {
    const { isDarkMode } = useThemeContext();

    const inputBg = isDarkMode ? "#363636" : "white";
    const textPrimary = isDarkMode ? "#E0E0E0" : "#2f3b48";
    const textSecondary = isDarkMode ? "#B0B0B0" : "#6b6f76";
    const buttonBg = isDarkMode ? "#2C3E50" : "#7daebd";
    const buttonHover = isDarkMode ? "#34495e" : "#6a9ab3";

    return (
        <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-full sm:max-w-xl">
            <div
                className="flex items-center rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm w-full max-w-full sm:max-w-xs transition-colors duration-300"
                style={{ backgroundColor: inputBg }}
            >
                <input
                    type="text"
                    placeholder="Search"
                    className="flex-1 bg-transparent outline-none text-xs sm:text-sm"
                    style={{ color: textPrimary }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <FontAwesomeIcon
                    icon={faSearch}
                    className="text-xs sm:text-sm"
                    style={{ color: textSecondary }}
                />
            </div>
            <button
                className="text-white text-xs sm:text-sm font-medium px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg shadow-sm transition-colors whitespace-nowrap"
                style={{ backgroundColor: buttonBg }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = buttonHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = buttonBg)}
            >
                Search
            </button>
        </div>
    );
}