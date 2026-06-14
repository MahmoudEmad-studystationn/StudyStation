import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useTheme } from "@mui/material";

const featuresData = [
    {
        icon: "fa-solid fa-calendar-days",
        title: "Plan Your Journey",
        description: "Set goals, organize tasks, and stay on top of your studies.",
    },
    {
        icon: "fa-solid fa-headphones",
        title: "Study Your Way",
        description: "Focus alone or collaborate with friends in real-time study rooms.",
    },
    {
        icon: "fa-solid fa-folder-open",
        title: "Discover & Share Knowledge",
        description: "Explore resources, save materials, and connect through educational posts.",
    },
    {
        icon: "fa-solid fa-robot",
        title: "Learn With AI",
        description: "Ask questions, get explanations, and receive personalized study support anytime.",
    },
];

export default function Features() {
    const theme = useTheme();
    const themeKey = theme.palette.mode;

    useEffect(() => {
        document.getElementById("features").style.backgroundColor = theme.palette.mode === "dark" ? "#171717" : "#F8F9FA";
    }, [theme.palette.mode]);

    return (
        <div id="features" key={themeKey} style={{ backgroundColor: theme.palette.mode === "dark" ? "#171717" : "#F8F9FA" }}>
            <div className="container mx-auto py-16 px-4 sm:px-6">
                <h2
                    key={themeKey}
                    className="text-center font-bold py-5"
                    style={{
                        fontSize: "clamp(1.6rem, 5vw, 3rem)",
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
                <div className="flex flex-wrap justify-center">
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
        <div className="w-1/2 sm:w-1/2 lg:w-1/4 flex pb-4">
            <div ref={ref} style={cardContainerStyle}>
                <div
                    className="shadow border-0 rounded-[1.25rem] m-2 flex-1 flex"
                    style={cardStyle}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    key={themeKey}
                >
                    <div className="p-3 sm:p-6 text-center flex flex-col justify-center items-center w-full">
                        <i
                            className={`${feature.icon} py-3`}
                            style={{
                                ...iconStyle,
                                fontSize: "clamp(1.5rem, 4vw, 3rem)",
                            }}
                        />
                        <h4
                            className="font-semibold mt-2 mb-3"
                            style={{
                                color: theme.palette.mode === "dark" ? "#c1c0c0ff" : "#555555",
                                fontSize: "clamp(0.85rem, 2.5vw, 1.25rem)",
                            }}
                        >
                            {feature.title}
                        </h4>
                        <p
                            className="px-1 sm:px-4 leading-relaxed"
                            style={{
                                color: theme.palette.mode === "dark" ? "#c1c0c0ff" : "#555555",
                                fontSize: "clamp(0.75rem, 2vw, 1rem)",
                            }}
                        >
                            {feature.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};