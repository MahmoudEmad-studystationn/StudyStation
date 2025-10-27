import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useTheme } from "@mui/material";
import AboutImage from "../../assets/images/About.jpg";
import AboutImage2 from "../../assets/images/About2.jpg";

// FadeInComponent remains unchanged as it's a utility
const FadeInComponent = ({ children, delay = 0, className = "" }) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const baseClasses = `transition duration-1000 ease-out ${className}`;
    const animationClasses = inView
        ? "opacity-100 transform translate-y-0"
        : "opacity-0 transform translate-y-6";

    return (
        <div
            ref={ref}
            className={`${baseClasses} ${animationClasses}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

function About() {
    const theme = useTheme();
    const themeKey = theme.palette.mode;

    useEffect(() => {
        // لضمان إعادة تطبيق الأنماط عند تغيير الـ Theme
        document.getElementById("about").className = `w-full flex flex-col md:flex-row items-center justify-center px-6 py-16 md:py-24 lg:px-20 ${theme.palette.mode === "dark" ? "bg-[#171717]" : "bg-white"
            }`;
    }, [theme.palette.mode]);

    const startColor = theme.palette.mode === "dark" ? "#B0D9FF" : "#A4D1F2";
    const endColor = theme.palette.mode === "dark" ? "#8AB6D6" : "#7AA5C4";
    const bodyTextColor = theme.palette.mode === "dark" ? "text-[#c1c0c0ff]" : "text-[#868686]";
    const featureTitleColor = bodyTextColor;

    const gradientTextStyle = {
        background: `linear-gradient(135deg, ${startColor}, ${endColor})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: endColor,
    };

    const textBaseClasses = "text-md lg:text-base leading-relaxed";

    const features = [
        { iconClass: "fa-solid fa-crosshairs", title: "Motivation", description: "Stay focused with timers and tools." },
        { iconClass: "fa-solid fa-folder-open", title: "Organization", description: "Plan tasks and track progress." },
        { iconClass: "fa-solid fa-handshake", title: "Connection", description: "Join study rooms and collaborate." },
        { iconClass: "fa-solid fa-file-alt", title: "Support", description: "Learn together in a student community." },
    ];

    return (
        <section
            id="about"
            key={themeKey}
            className={`w-full flex flex-col md:flex-row items-center justify-center px-6 py-16 md:py-24 lg:px-20 ${theme.palette.mode === "dark" ? "bg-[#171717]" : "bg-white"
                }`}
        >
            {/* Image Column */}
            <FadeInComponent
                className="w-full md:w-1/2 flex justify-center mb-10 md:mb-0"
                delay={0}
            >
                <div className="relative w-full max-w-md lg:max-w-xl aspect-[4/3] [perspective:1000px] group">
                    <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                        <img
                            src={AboutImage}
                            alt="Books and glasses"
                            className="absolute inset-0 w-full h-full object-cover rounded-xl shadow-xl"
                            style={{ backfaceVisibility: "hidden" }}
                        />
                        <img
                            src={AboutImage2}
                            alt="Creative books"
                            className="absolute inset-0 w-full h-full object-cover rounded-xl shadow-xl [transform:rotateY(180deg)_scale(0.9)]"
                            style={{ backfaceVisibility: "hidden" }}
                        />
                    </div>
                </div>
            </FadeInComponent>

            {/* Text Column: تم تقليل الهوامش هنا */}
            <div className="w-full md:w-1/2 flex flex-col md:pl-16">
                <FadeInComponent className="mb-5" delay={100}>
                    <h1
                        key={themeKey}
                        className="font-extrabold text-3xl md:text-4xl lg:text-4xl text-left **mb-6** leading-normal pb-2"
                        style={gradientTextStyle}
                    >
                        Why Study Station?
                    </h1>
                </FadeInComponent>

                <FadeInComponent className="**mb-6**" delay={300}>
                    <p className={`${textBaseClasses} ${bodyTextColor}`}>
                        Study Station is built to make studying easier and more fun. We provide all the tools you need to stay on track, connect with peers, and achieve your academic goals.
                    </p>
                </FadeInComponent>

                <div className="**space-y-4**">
                    {features.map((feature, index) => (
                        <FadeInComponent key={index} delay={500 + index * 200}>
                            <div className="flex items-start space-x-4">
                                <div
                                    className={`flex-shrink-0 p-3 rounded-full ${theme.palette.mode === "dark" ? "bg-[#2d2d2d]" : "bg-[#E0EBF5]"
                                        } bg-opacity-70 text-2xl md:text-3xl`}
                                >
                                    <i className={feature.iconClass} style={gradientTextStyle} />
                                </div>
                                <div className="pt-1 text-left">
                                    <p className={`text-lg font-bold mb-1 leading-snug ${featureTitleColor}`}>
                                        {feature.title}:
                                    </p>
                                    <p className={`**text-sm** leading-snug ${bodyTextColor}`}>
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </FadeInComponent>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default About;