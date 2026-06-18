import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { resetPasswordApi } from "../Services/authServices";
import { useTheme } from "@mui/material";

const UnlockIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
);

const LockIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const RightArrowIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6"></path>
    </svg>
);

const COLOR_PRIMARY = "#8FB7CC";
const COLOR_HOVER = "#7BA7C7";
const COLOR_TEXT = "#686868";

const getBaseButtonStyle = () => ({
    backgroundColor: COLOR_PRIMARY,
    color: "#fff",
    fontWeight: "600",
    borderRadius: "12px",
    border: `2px solid ${COLOR_PRIMARY}`,
    padding: "12px",
    width: "100%",
    fontSize: "16px",
    cursor: "pointer",
    outline: "none",
    transition: "background-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease",
    transform: "scale(1)",
});

const getHoverButtonStyle = () => ({
    ...getBaseButtonStyle(),
    backgroundColor: COLOR_HOVER,
    boxShadow: `0 4px 12px rgba(123, 167, 199, 0.4)`,
    transform: "scale(1.02)",
});

const getActiveButtonStyle = () => ({
    ...getBaseButtonStyle(),
    backgroundColor: COLOR_HOVER,
    boxShadow: `0 2px 6px rgba(158, 193, 214, 0.5)`,
    transform: "scale(0.98)",
});

export default function ResetPassword() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const [buttonStyle, setButtonStyle] = useState(getBaseButtonStyle());
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const location = useLocation();
    const { email, code } = location.state || {};

    useEffect(() => {
        if (!code || !email) {
            console.warn("Missing code or email");
        }
    }, [code, email]);

    const handleSubmit = async () => {
        if (!code || !email) {
            toast.error("Missing reset information. Please try again.");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setIsLoading(true);

        const result = await resetPasswordApi({
            email,
            token: code,
            password: newPassword
        });

        setIsLoading(false);

        if (result.success) {
            toast.success("Password changed successfully!");
            setTimeout(() => navigate("/login"), 2500);
        } else {
            toast.error(result.message || "Failed to reset password");
        }

        setButtonStyle(getBaseButtonStyle());
    };

    return (
        <div className={`min-h-screen flex flex-col ${isDark ? "bg-[#171717]" : "bg-white"}`}>
            <ToastContainer position="top-center" autoClose={3000} />

            <div className="flex-grow flex justify-center items-center p-4 sm:p-6 lg:p-8">
                <div className={`w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-lg ${isDark ? "bg-[#171717]" : "bg-white"}`}>

                    <div className="flex justify-center mb-6">
                        <div className={`p-4 rounded-full ${isDark ? "bg-[#222]" : "bg-[#f0f4f7]"}`}>
                            <UnlockIcon className="w-16 h-16" style={{ color: COLOR_PRIMARY }} />
                        </div>
                    </div>

                    <div className="mb-6 text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: COLOR_PRIMARY }}>
                            Reset Password
                        </h1>
                        <p className="text-sm sm:text-base" style={{ color: isDark ? "#ffffff" : COLOR_TEXT }}>
                            Enter your new password
                        </p>
                    </div>

                    <div className="relative mb-4">
                        <LockIcon
                            className="absolute top-1/2 left-4 -translate-y-1/2 w-5 h-5"
                            style={{ color: isDark ? "#ffffff" : COLOR_TEXT }}
                        />
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full border-2 rounded-xl py-3 pl-12 pr-4 text-sm sm:text-base focus:outline-none transition-all duration-300"
                            style={{
                                borderColor: passwordFocused ? COLOR_HOVER : "#8686865b",
                                boxShadow: passwordFocused ? `0 0 0 3px rgba(143, 183, 204, 0.3)` : "none",
                                backgroundColor: isDark ? "#222222" : "transparent",
                                color: isDark ? "#ffffff" : "#000000",
                            }}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                        />
                    </div>

                    <button
                        style={buttonStyle}
                        onMouseEnter={() => setButtonStyle(getHoverButtonStyle())}
                        onMouseLeave={() => setButtonStyle(getBaseButtonStyle())}
                        onMouseDown={() => setButtonStyle(getActiveButtonStyle())}
                        onMouseUp={() => setButtonStyle(getHoverButtonStyle())}
                        onClick={handleSubmit}
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? "Submitting..." : "Submit"}
                    </button>

                    <div className="mt-4 text-center">
                        <p className="text-xs mb-2" style={{ color: isDark ? "#999" : COLOR_TEXT }}>
                            Code expired or not working?
                        </p>
                        <span
                            onClick={() => navigate("/forgot-password")}
                            className="text-sm cursor-pointer hover:underline"
                            style={{ color: COLOR_PRIMARY }}
                        >
                            Request a new reset code
                        </span>
                    </div>

                    <div className="mt-4 text-center">
                        <span
                            onClick={() => navigate("/login")}
                            className="text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer hover:underline"
                            style={{ color: COLOR_PRIMARY }}
                        >
                            <RightArrowIcon className="w-4 h-4 rotate-180" style={{ color: COLOR_PRIMARY }} />
                            Back to Login
                        </span>
                    </div>
                </div>
            </div>

            <footer
                className="text-center p-4 text-sm border-t"
                style={{
                    color: isDark ? "#ffffff" : COLOR_TEXT,
                    borderColor: isDark ? "#2d2d2d" : "#eee",
                }}
            >
                <p className="m-0">
                    © 2025 <span className="font-semibold">Study Station</span>. All rights reserved.
                </p>
            </footer>
        </div>
    );
}