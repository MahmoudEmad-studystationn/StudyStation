import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { verifyCodeApi, resendCodeApi } from "../Services/authServices";
import { useTheme } from "@mui/material";

const MailIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
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

export default function VerificationCode() {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const [buttonStyle, setButtonStyle] = useState(getBaseButtonStyle());
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [focusedIndex, setFocusedIndex] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email");

    useEffect(() => {
        if (!email) {
            toast.error("Email is missing. Please try again.");
            setTimeout(() => navigate("/signup"), 3000);
        }
    }, [email, navigate]);

    const handleChange = (index, value) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`code-input-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === "Backspace" && !code[index] && index > 0) {
            const prevInput = document.getElementById(`code-input-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newCode = [...code];
        for (let i = 0; i < pastedData.length; i++) {
            newCode[i] = pastedData[i];
        }
        setCode(newCode);

        const lastIndex = Math.min(pastedData.length, 5);
        const lastInput = document.getElementById(`code-input-${lastIndex}`);
        if (lastInput) lastInput.focus();
    };

    const handleSubmit = async () => {
        if (!email) {
            toast.error("Email is missing. Please try again.");
            return;
        }

        const verificationCode = code.join("");
        if (verificationCode.length !== 6) {
            toast.error("Please enter all 6 digits");
            return;
        }

        setIsLoading(true);
        const result = await verifyCodeApi({
            email,
            code: verificationCode,
        });
        setIsLoading(false);

        if (result.success) {
            toast.success("Code verified successfully!", {
                position: "top-center",
                autoClose: 2000,
            });

            setTimeout(() => {
                navigate(`/reset-password?email=${encodeURIComponent(email)}&code=${verificationCode}`);
            }, 2200);
        } else {
            toast.error(result.message || "Invalid verification code", {
                position: "top-center",
                autoClose: 5000,
            });
        }
        setButtonStyle(getBaseButtonStyle());
    };

    const handleResendCode = async () => {
        if (!email) {
            toast.error("Email is missing. Please try again.");
            return;
        }

        setIsResending(true);
        const result = await resendCodeApi(email);
        setIsResending(false);

        if (result.success) {
            toast.success(result.message || "Verification code has been resent to your email", {
                position: "top-center",
                autoClose: 3000,
            });
            setCode(["", "", "", "", "", ""]);
            const firstInput = document.getElementById("code-input-0");
            if (firstInput) firstInput.focus();
        } else {
            toast.error(result.message || "Failed to resend code. Please try again.", {
                position: "top-center",
                autoClose: 3000,
            });
        }
    };

    return (
        <div className={`min-h-screen flex flex-col ${isDark ? "bg-[#171717]" : "bg-white"}`}>
            <ToastContainer position="top-center" autoClose={3000} />

            <div className="flex-grow flex justify-center items-center p-4 sm:p-6 lg:p-8">
                <div className={`w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-lg ${isDark ? "bg-[#171717]" : "bg-white"}`}>
                    <div className="flex justify-center mb-6">
                        <div className={`p-4 rounded-full ${isDark ? "bg-[#171717]" : "bg-white"}`}>
                            <MailIcon className="w-16 h-16" style={{ color: COLOR_PRIMARY }} />
                        </div>
                    </div>

                    <div className="mb-6 text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: COLOR_PRIMARY }}>
                            Verify Your Email
                        </h1>
                        <p className="text-sm sm:text-base" style={{ color: isDark ? "#b0b0b0" : COLOR_TEXT }}>
                            We've sent a verification code to
                        </p>
                        <p className="text-sm sm:text-base font-semibold mt-1" style={{ color: COLOR_PRIMARY }}>
                            {email}
                        </p>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-center gap-2 sm:gap-3">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`code-input-${index}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={index === 0 ? handlePaste : undefined}
                                    onFocus={() => setFocusedIndex(index)}
                                    onBlur={() => setFocusedIndex(null)}
                                    className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-semibold border-2 rounded-xl focus:outline-none transition-all duration-300"
                                    style={{
                                        borderColor: focusedIndex === index ? COLOR_HOVER : isDark ? "#3a3a3a" : "#d1d5db",
                                        boxShadow: focusedIndex === index ? `0 0 0 3px rgba(143, 183, 204, 0.3)` : "none",
                                        backgroundColor: isDark ? "#2a2a2a" : "#ffffff",
                                        color: isDark ? "#ffffff" : "#000000",
                                    }}
                                    disabled={isLoading}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        style={buttonStyle}
                        onMouseEnter={() => !isLoading && setButtonStyle(getHoverButtonStyle())}
                        onMouseLeave={() => setButtonStyle(getBaseButtonStyle())}
                        onMouseDown={() => !isLoading && setButtonStyle(getActiveButtonStyle())}
                        onMouseUp={() => !isLoading && setButtonStyle(getHoverButtonStyle())}
                        onClick={handleSubmit}
                        type="button"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? "Verifying..." : "Verify Code"}
                    </button>

                    <div className="mt-4 text-center">
                        <p className="text-sm sm:text-base" style={{ color: isDark ? "#b0b0b0" : COLOR_TEXT }}>
                            Didn't receive the code?{" "}
                            <span
                                onClick={!isResending ? handleResendCode : undefined}
                                className={`font-semibold ${!isResending ? 'cursor-pointer hover:underline' : 'cursor-not-allowed opacity-50'}`}
                                style={{ color: COLOR_PRIMARY }}
                            >
                                {isResending ? "Resending..." : "Resend"}
                            </span>
                        </p>
                    </div>

                    <div className="mt-4 text-center">
                        <span
                            onClick={() => navigate("/login")}
                            className="text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
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
                    color: isDark ? "#b0b0b0" : COLOR_TEXT,
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