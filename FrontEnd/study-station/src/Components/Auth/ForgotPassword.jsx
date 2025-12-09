import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { forgetPasswordApi } from "../Services/authServices";
import { useTheme } from "@mui/material";

const UnlockIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    </svg>
);

const MailIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="4" ry="4" />
        <path d="M22 6l-10 7L2 6" />
    </svg>
);

const RightArrowIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
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

export default function ForgetPassword() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const [buttonStyle, setButtonStyle] = useState(getBaseButtonStyle());
    const [emailFocused, setEmailFocused] = useState(false);
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleReset = async () => {
        setIsLoading(true);
        if (!email) {
            toast.error("Please enter your email", { position: "top-center", autoClose: 3000 });
            setIsLoading(false);
            return;
        }

        const payload = {
            email,
            clientURI: `${window.location.origin}/reset-password` 
        }; const result = await forgetPasswordApi(payload);
        setIsLoading(false);

        if (result.success) {
            toast.success("Check your email for reset instructions!", { position: "top-center", autoClose: 3000 });
            setTimeout(() => navigate(`/verification-code?email=${encodeURIComponent(email)}`), 2000);
        } else {
            toast.error(result.message || "Failed to send reset email", { position: "top-center", autoClose: 3000 });
        }
        setButtonStyle(getBaseButtonStyle());
    };

    return (
        <div className={`min-h-screen flex flex-col ${isDark ? "bg-[#171717]" : "bg-white"}`}>
            <div className="flex-grow flex items-center justify-center p-4">
                <div className={`w-full max-w-md p-8 rounded-2xl shadow-lg ${isDark ? "bg-[#171717]" : "bg-white"}`}>
                    <div className="flex justify-center mb-6">
                        <div className="p-4 rounded-full" style={{ backgroundColor: isDark ? "#222" : "#f0f4f7" }}>
                            <UnlockIcon className="w-10 h-10" style={{ color: COLOR_PRIMARY }} />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-center mb-2" style={{ color: COLOR_PRIMARY }}>
                        Forget Password?
                    </h1>
                    <p className="text-center text-sm mb-6" style={{ color: isDark ? "#ffffff" : COLOR_TEXT }}>
                        Enter your email address and we’ll send you instructions to reset your password.
                    </p>

                    <div className="relative mb-6">
                        <MailIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5" style={{ color: isDark ? "#ffffff" : COLOR_TEXT }} />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border-2 rounded-xl py-3 pl-12 pr-4 text-sm sm:text-base focus:outline-none transition-all duration-300"
                            style={{
                                borderColor: emailFocused ? COLOR_HOVER : "#8686865b",
                                boxShadow: emailFocused ? `0 0 0 3px rgba(143, 183, 204, 0.3)` : "none",
                                backgroundColor: isDark ? "#222222" : "transparent",
                                color: isDark ? "#ffffff" : "#000000",
                            }}
                            onFocus={() => setEmailFocused(true)}
                            onBlur={() => setEmailFocused(false)}
                        />
                    </div>

                    <button
                        style={buttonStyle}
                        onMouseEnter={() => setButtonStyle(getHoverButtonStyle())}
                        onMouseLeave={() => setButtonStyle(getBaseButtonStyle())}
                        onMouseDown={() => setButtonStyle(getActiveButtonStyle())}
                        onMouseUp={() => setButtonStyle(getHoverButtonStyle())}
                        onClick={handleReset}
                        type="button"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? "Sending..." : "Reset Password"}
                    </button>

                    <p className="mt-6 text-center text-sm">
                        <span
                            className="cursor-pointer flex items-center justify-center gap-1"
                            style={{ color: isDark ? "#ffffff" : COLOR_TEXT }}
                            onClick={() => navigate("/login")}
                        >
                            <RightArrowIcon className="w-4 h-4 rotate-180" style={{ color: isDark ? "#ffffff" : COLOR_TEXT }} />
                            Back to Login
                        </span>
                    </p>
                </div>
            </div>

            <footer className="text-center p-4 text-sm border-t" style={{ color: isDark ? "#ffffff" : COLOR_TEXT, borderColor: isDark ? "#2d2d2d" : "#eee" }}>
                © 2025 Study Station. All rights reserved.
            </footer>

            <ToastContainer position="top-center" autoClose={3000} />
        </div>
    );
}