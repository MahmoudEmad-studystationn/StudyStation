import React from "react";
import { useThemeContext } from "../Theme/ThemeContext";

export default function LoadingScreen() {
    const { isDarkMode } = useThemeContext();
    
    const cardBg = isDarkMode ? "#2A2A2A" : "white";
    const skeletonBg = isDarkMode ? "#363636" : "#e4e6eb";

    return (
        <div className="rounded-lg shadow-sm p-4 sm:p-5 md:p-6 transition-colors duration-300 animate-pulse" style={{ backgroundColor: cardBg }}>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex-shrink-0" style={{ backgroundColor: skeletonBg }}></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 rounded" style={{ backgroundColor: skeletonBg, width: '40%' }}></div>
                    <div className="h-3 rounded" style={{ backgroundColor: skeletonBg, width: '20%' }}></div>
                </div>
            </div>

            <div className="space-y-2 mb-3 sm:mb-4">
                <div className="h-4 rounded" style={{ backgroundColor: skeletonBg, width: '100%' }}></div>
                <div className="h-4 rounded" style={{ backgroundColor: skeletonBg, width: '75%' }}></div>
            </div>

            <div className="h-40 sm:h-44 md:h-48 rounded mb-3 sm:mb-4" style={{ backgroundColor: skeletonBg }}></div>

            <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderBottom: `1px solid ${isDarkMode ? "#404040" : "#e5e7eb"}` }}>
                <div className="h-4 rounded" style={{ backgroundColor: skeletonBg, width: '80px' }}></div>
            </div>

            <div className="flex items-center gap-4 sm:gap-5 md:gap-6 pt-2">
                <div className="h-6 rounded" style={{ backgroundColor: skeletonBg, width: '60px' }}></div>
                <div className="h-6 rounded" style={{ backgroundColor: skeletonBg, width: '80px' }}></div>
            </div>
        </div>
    );
}