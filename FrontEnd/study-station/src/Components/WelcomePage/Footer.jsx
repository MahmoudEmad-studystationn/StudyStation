// File Description
//File Name: Footer
//Author:  Mohammed Tarek
//Date of creation: 22/9/2025
//Version information: v1.0
// Dependencies:
// React – for building the component and rendering JSX
// CSS Modules (Features.module.css) – for scoped styling of the Features section
// Bootstrap – for grid system, cards, and spacing utilities
// Font Awesome – for feature icons
//Contributors: [Mohammed Tarek]
//Last Modified Date [Mohammed Tarek, 23/9/2025, 12:43AM]
// Description:
// This file defines the Footer component, which renders the footer section 
// of the StudyStation platform. It includes the platform's title, a short 
// description, navigation links, and social media icons. 
// The layout is centered with proper spacing and hover effects for interactivity.
// Responsive design ensures readability across different screen sizes.
// Styling is handled using Tailwind CSS classes along with inline styles 
// for custom colors.
import React from "react";

export default function Footer() {
    return (
        <footer id="footer" className="bg-gray-100">
            <div className="container mx-auto p-5 py-8 text-center">
                <div className="mb-6">
                    <h3 className="text-2xl font-bold" style={{ color: '#686868' }}>
                        Study <span style={{ color: '#8FB7CC' }}>Station</span>
                    </h3>
                    <p className="mt-2 text-sm sm:text-base" style={{ color: '#686868' }}>
                        Your personal focus zone for smarter studying.
                    </p>
                </div>

                {/* ✅ Footer Links */}
                <div className="flex flex-wrap justify-center gap-6 mb-6">
                    {[
                        { name: "Home", href: "#home" },
                        { name: "About", href: "#about" },
                        { name: "Features", href: "#features" }
                    ].map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="uppercase font-semibold hover:opacity-80 transition-opacity no-underline"
                            style={{ color: '#686868', textDecoration: 'none' }}
                        >
                            {link.name}
                        </a>
                    ))}
                </div>

                {/* Social Icons */}
                <div className="flex justify-center gap-6 mb-6 text-2xl">
                    <a href="#" className="hover:opacity-80 transition-opacity" style={{ color: '#8FB7CC' }}>
                        <i className="fab fa-linkedin fs-1"></i>
                    </a>
                    <a href="#" className="hover:opacity-80 transition-opacity" style={{ color: '#8FB7CC' }}>
                        <i className="fab fa-github fs-1"></i>
                    </a>
                </div>

                <div className="text-sm fw-bold" style={{ color: '#686868' }}>
                    © 2025 Study Station. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
