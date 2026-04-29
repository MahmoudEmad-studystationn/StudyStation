import DarkModeToggle from "../Theme/DarkModeToggle";
import { useThemeContext } from "../Theme/ThemeContext";

export default function TopbarDashboard({ sidebarWidth = 230 }) {
    const { isDarkMode } = useThemeContext();

    const cardBg = isDarkMode ? "#2A2A2A" : "#ffffff";
    const borderColor = isDarkMode ? "#404040" : "#d1d5db";
    const textMuted = isDarkMode ? "#B0B0B0" : "#6b6f76";
    const textPrimary = isDarkMode ? "#E0E0E0" : "#2f3b48";

    return (
        <header
            style={{
                position: "fixed",
                top: 0,
                left: sidebarWidth,
                right: 0,
                height: 60,
                background: cardBg,
                borderBottom: `1px solid ${borderColor}`,
                display: "flex",
                alignItems: "center",
                padding: "0 1.5rem",
                gap: "1rem",
                zIndex: 100,
                boxShadow: isDarkMode
                    ? "0 1px 3px rgba(0,0,0,0.3)"
                    : "0 1px 3px rgba(44,62,80,0.06)",
            }}
        >
            {/* Breadcrumb */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 600, color: textMuted }}>
                    Study Station
                </span>
                <span style={{ color: textMuted, fontSize: "0.8rem" }}>/</span>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: textPrimary }}>
                    Dashboard
                </span>
            </div>

            {/* Dark mode toggle only */}
            <DarkModeToggle />
        </header>
    );
}