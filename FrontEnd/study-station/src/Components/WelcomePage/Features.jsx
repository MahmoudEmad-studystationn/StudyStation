// File Description
//File Name: Features
//Author: Mariam Mohammed
//Date of creation: 22/9/2025
//Version information: v1.0
// Dependencies:  
// React – for building the component and rendering JSX  
// CSS Modules (Features.module.css) – for scoped styling of the Features section  
// Bootstrap – for grid system, cards, and spacing utilities  
// Font Awesome – for feature icons
//Contributors: [Mariam Mohammed]
//Last Modified Date [Mariam Mohammed, 22/9/2025, 9:43PM]
//Description:  
//This file defines the Features component, which displays the main features
//of the StudyStation platform. Each feature is presented as a styled card
//with an icon, title, and short description. Responsive layout ensures 
//proper display across different screen sizes.
import React from "react";
import { useInView } from "react-intersection-observer";

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
    return (
        <div id="features" style={{ backgroundColor: '#F8F9FA' }}>
            <div className="container py-4">
                <h2
                    className="text-center py-3 fw-bolder py-5 fs-1"
                    style={{
                        background: 'linear-gradient(135deg, #A4D1F2, #7AA5C4)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        transition: 'all 0.6s ease-in-out'
                    }}
                >
                    What You Can Do
                </h2>
                <div className="row justify-content-center">
                    {featuresData.map((feature, index) => (
                        <FeatureCard key={index} feature={feature} index={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}

const FeatureCard = ({ feature, index }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.2,
    });

    const cardContainerStyle = {
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
        transitionDelay: `${index * 0.3}s`,
        width: '100%'
    };

    const cardStyle = {
        minHeight: '320px',
        transition: 'all 0.4s ease-in-out',
        cursor: 'pointer',
        border: '1px solid #E9ECEF',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isHovered ? '0 10px 20px rgba(0, 0, 0, 0.1)' : ''
    };

    const iconStyle = {
        color: isHovered ? '#95B8D1' : '#7AA5C4', 
        transition: 'color 0.4s ease-in-out, transform 0.4s ease-in-out',
        transform: isHovered ? 'scale(1.1)' : 'scale(1)', 
        WebkitBackgroundClip: 'unset', 
        WebkitTextFillColor: 'unset', 
        backgroundClip: 'unset',
    };

    return (
        <div className="col-12 col-sm-6 col-lg-3 d-flex pb-5">
            <div
                ref={ref}
                style={cardContainerStyle}
            >
                <div
                    className="card shadow border-0 rounded-5 m-2 flex-fill"
                    style={cardStyle}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="card-body text-center d-flex flex-column justify-content-center align-items-center">
                        <i
                            className={`${feature.icon} fs-1 py-3`}
                            style={iconStyle}
                        />
                        <h4 style={{ color: '#555555' }}>{feature.title}</h4>
                        <p className="px-4" style={{ color: '#555555' }}>{feature.description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};