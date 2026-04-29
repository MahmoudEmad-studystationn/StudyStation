import DarkModeToggle from "../Theme/DarkModeToggle";
import { useThemeContext } from "../Theme/ThemeContext";

export default function TopbarDashboard({ sidebarWidth = 230, breadcrumb = "Dashboard" }) {
    const { isDarkMode } = useThemeContext();

    const cardBg = isDarkMode ? "#1a2330" : "#ffffff";
    const borderColor = isDarkMode ? "rgba(143,183,204,0.1)" : "rgba(44,62,80,0.08)";
    const textMuted = isDarkMode ? "#5a7a8e" : "#8A9BAA";
    const textPrimary = isDarkMode ? "#e8edf2" : "#1C2B38";

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
                    ? "0 1px 3px rgba(0,0,0,0.3), 0 3px 10px rgba(0,0,0,0.2)"
                    : "0 1px 3px rgba(44,62,80,0.06), 0 3px 10px rgba(44,62,80,0.06)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
        >
            {/* Breadcrumb */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 600, color: textMuted }}>
                    Study Station
                </span>
                <span style={{ color: textMuted, fontSize: "0.8rem" }}>/</span>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: textPrimary }}>
                    {breadcrumb}
                </span>
            </div>

            {/* Dark mode toggle */}
            <DarkModeToggle />
        </header>
    );
}