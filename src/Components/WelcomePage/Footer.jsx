import React from "react";
import { useTheme } from "@mui/material";

export default function Footer() {
    const theme = useTheme();

    return (
        <footer id="footer" className={theme.palette.mode === "dark" ? "bg-[#222222]" : "bg-gray-100"}>
            <div className="container mx-auto p-5 py-8 text-center">
                <div className="mb-6">
                    <h3 className="text-2xl font-bold" style={{ color: theme.palette.mode === "dark" ? "#c1c0c0ff" : "#686868" }}>
                        Study <span style={{ color: theme.palette.mode === "dark" ? "#B0D9FF" : "#8FB7CC" }}>Station</span>
                    </h3>
                    <p className="mt-2 text-sm sm:text-base" style={{ color: theme.palette.mode === "dark" ? "#c1c0c0ff" : "#686868" }}>
                        Your personal focus zone for smarter studying.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-6 mb-6">
                    {[
                        { name: "Home", href: "#home" },
                        { name: "About", href: "#about" },
                        { name: "Features", href: "#features" },
                    ].map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="uppercase font-semibold hover:opacity-80 transition-opacity no-underline"
                            style={{ color: theme.palette.mode === "dark" ? "#c1c0c0ff" : "#686868", textDecoration: "none" }}
                        >
                            {link.name}
                        </a>
                    ))}
                </div>

                <div className="flex justify-center gap-6 mb-6 text-2xl">
                    <a href="#" className="hover:opacity-80 transition-opacity" style={{ color: theme.palette.mode === "dark" ? "#B0D9FF" : "#8FB7CC" }}>
                        <i className="fab fa-linkedin fs-1"></i>
                    </a>
                    <a href="#" className="hover:opacity-80 transition-opacity" style={{ color: theme.palette.mode === "dark" ? "#B0D9FF" : "#8FB7CC" }}>
                        <i className="fab fa-github fs-1"></i>
                    </a>
                </div>

                <div className="text-sm fw-bold" style={{ color: theme.palette.mode === "dark" ? "#c1c0c0ff" : "#686868" }}>
                    © 2025 Study Station. All rights reserved.
                </div>
            </div>
        </footer>
    );
}