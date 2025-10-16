// File Description
//File Name: About.jsx
//Author: Mariam Hamdy
//Date of creation: 23/9/2025
//Version information: v1.0
// Dependencies:  
// React – for building the component and rendering JSX  
// TailwindCSS – for utility-based responsive styling  
// React Intersection Observer – for fade-in on scroll  
// Font Awesome – for feature icons

// Contributors: [Mariam Hamdy]  
// Last Modified Date [Mariam Hamdy, 27/9/2025, 10:00PM]  
// Description:  
// This file defines the About component, which introduces the StudyStation platform.  
// It includes an image, a gradient-styled heading, intro text, and a list of animated features  
// (with icons, titles, and descriptions). Responsive design ensures proper layout on all screen sizes.  

import React from "react";
import { useInView } from "react-intersection-observer";
import AboutImage from "../../assets/images/About.jpg";
import AboutImage2 from "../../assets/images/About2.jpg";

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
// ===================================================================

function About() {
    const startColor = "#A4D1F2";
    const endColor = "#7AA5C4";

    const bodyTextColor = "text-[#868686]";
    const featureTitleColor = bodyTextColor;

    const gradientTextStyle = {
        background: `linear-gradient(135deg, ${startColor}, ${endColor})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: endColor,
    };

    const textBaseClasses = "text-base md:text-lg leading-relaxed";

    const features = [
        { iconClass: "fa-solid fa-crosshairs", title: "Motivation", description: "Stay focused with timers and tools." },
        { iconClass: "fa-solid fa-folder-open", title: "Organization", description: "Plan tasks and track progress." },
        { iconClass: "fa-solid fa-handshake", title: "Connection", description: "Join study rooms and collaborate." },
        { iconClass: "fa-solid fa-file-alt", title: "Support", description: "Learn together in a student community." },
    ];

    return (
        <section
            id="about"
            className="w-full bg-white flex flex-col md:flex-row items-center justify-center px-6 py-16 md:py-24 lg:px-20"
        >
            { }
            <FadeInComponent
                className="w-full md:w-1/2 flex justify-center md:justify-start mb-10 md:mb-0"
                delay={0}
            >
                <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg aspect-[4/3] [perspective:1000px] group">
                    <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">

                        { }
                        <img
                            src={AboutImage}
                            alt="Books and glasses"
                            className="absolute inset-0 w-full h-full object-cover rounded-xl shadow-xl"
                            style={{ backfaceVisibility: "hidden" }}
                        />

                        { }

                        <img
                            src={AboutImage2}
                            alt="Creative books"
                            className="absolute inset-0 w-full h-full object-cover rounded-xl shadow-xl [transform:rotateY(180deg)_scale(0.9)]"
                            style={{ backfaceVisibility: "hidden" }}
                        />


                    </div>
                </div>
            </FadeInComponent>


            { }
            <div className="w-full md:w-1/2 flex flex-col md:pl-12">
                <FadeInComponent className="mb-5" delay={100}>
                    <h1
                        className="font-extrabold md:text-lg lg:text-5xl text-left mb-4 md:mb-10 leading-normal pb-2"
                        style={gradientTextStyle}
                    >
                        Why Study Station?
                    </h1>
                </FadeInComponent>

                <FadeInComponent className="mb-8" delay={300}>
                    <p className={`${textBaseClasses} ${bodyTextColor}`}>
                        Study Station is built to make studying easier and more fun. We provide all the tools you need to stay on track, connect with peers, and achieve your academic goals.
                    </p>
                </FadeInComponent>

                { }
                <div className="space-y-6">
                    {features.map((feature, index) => (
                        <FadeInComponent key={index} delay={500 + index * 200}>
                            <div className="flex items-start space-x-4">
                                {/* Icon */}
                                <div className="flex-shrink-0 p-3 rounded-full bg-[#E0EBF5] bg-opacity-70 text-2xl md:text-3xl">
                                    <i className={feature.iconClass} style={gradientTextStyle} />
                                </div>
                                {/* Title & Description */}
                                <div className="pt-1 text-left">
                                    <p className={`text-lg font-bold mb-1 leading-snug ${featureTitleColor}`}>
                                        {feature.title}:
                                    </p>
                                    <p className={`text-base leading-snug ${bodyTextColor}`}>
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