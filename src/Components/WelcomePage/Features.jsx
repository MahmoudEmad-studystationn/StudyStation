import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useTheme } from "@mui/material";

const featuresData = [
    {
        icon: "fa-solid fa-calendar-days",
        title: "Study Planner",
        description: "Organize your weekly tasks and mark them as done",
    },
    {
        icon: "fa-solid fa-headphones",
        title: "Focus Mode",
        description: "Start solo study sessions with timers, calm backgrounds, and to-do lists",
    },
    {
        icon: "fa-solid fa-users",
        title: "Study Rooms",
        description: "Create or join group rooms with timers and live chat",
    },
    {
        icon: "fa-solid fa-folder-open",
        title: "Library",
        description: "Access shared materials and resources for easier studying",
    },
];

export default function Features() {
    const theme = useTheme();

    // إضافة Key بناءً على الـ Theme لإعادة Render
    const themeKey = theme.palette.mode;

    useEffect(() => {
        // لضمان إعادة تطبيق الأنماط عند تغيير الـ Theme
        document.getElementById("features").style.backgroundColor = theme.palette.mode === "dark" ? "#171717" : "#F8F9FA";
    }, [theme.palette.mode]);

    return (
        <div id="features" key={themeKey} style={{ backgroundColor: theme.palette.mode === "dark" ? "#171717" : "#F8F9FA" }}>
            <div className="container py-4">
                <h2
                    key={themeKey} // إضافة Key للعنوان
                    className="text-center py-3 fw-bolder py-5 fs-1"
                    style={{
                        background: `linear-gradient(135deg, ${theme.palette.mode === "dark" ? "#B0D9FF" : "#A4D1F2"
                            }, ${theme.palette.mode === "dark" ? "#8AB6D6" : "#7AA5C4"})`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        transition: "all 0.6s ease-in-out",
                    }}
                >
                    What You Can Do
                </h2>
                <div className="row justify-content-center">
                    {featuresData.map((feature, index) => (
                        <FeatureCard key={index} feature={feature} index={index} themeKey={themeKey} />
                    ))}
                </div>
            </div>
        </div>
    );
}

const FeatureCard = ({ feature, index, themeKey }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });
    const theme = useTheme();

    const cardContainerStyle = {
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(30px)",
        transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
        transitionDelay: `${index * 0.3}s`,
        width: "100%",
    };

    const cardStyle = {
        minHeight: "320px",
        transition: "all 0.4s ease-in-out",
        cursor: "pointer",
        border: theme.palette.mode === "dark" ? "1px solid #2A2A2A" : "1px solid #E9ECEF",
        transform: isHovered ? "scale(1.05)" : "scale(1)",
        boxShadow: isHovered ? "0 10px 20px rgba(0, 0, 0, 0.2)" : "",
        backgroundColor: theme.palette.mode === "dark" ? "#2A2A2A" : "#ffffff",
    };

    const iconStyle = {
        color: isHovered ? (theme.palette.mode === "dark" ? "#B0D9FF" : "#95B8D1") : (theme.palette.mode === "dark" ? "#8AB6D6" : "#7AA5C4"),
        transition: "color 0.4s ease-in-out, transform 0.4s ease-in-out",
        transform: isHovered ? "scale(1.1)" : "scale(1)",
        WebkitBackgroundClip: "unset",
        WebkitTextFillColor: "unset",
        backgroundClip: "unset",
    };

    return (
        <div className="col-12 col-sm-6 col-lg-3 d-flex pb-5">
            <div ref={ref} style={cardContainerStyle}>
                <div
                    className="card shadow border-0 rounded-5 m-2 flex-fill"
                    style={cardStyle}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    key={themeKey} // إضافة Key للكارد
                >
                    <div className="card-body text-center d-flex flex-column justify-content-center align-items-center">
                        <i className={`${feature.icon} fs-1 py-3`} style={iconStyle} />
                        <h4 style={{ color: theme.palette.mode === "dark" ? "#c1c0c0ff" : "#555555" }}>
                            {feature.title}
                        </h4>
                        <p className="px-4" style={{ color: theme.palette.mode === "dark" ? "#c1c0c0ff" : "#555555" }}>
                            {feature.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};