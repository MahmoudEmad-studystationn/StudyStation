import React, { useState, useEffect } from "react";
import LoginImg from "../../assets/images/Login.png";
import { loginSchema } from "../Schema/loginSchema";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { loginApi } from '../Services/authServices';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "@mui/material";
import DarkModeToggle from "../Theme/DarkModeToggle";

const tippyStyles = `
  .tippy-box[data-theme~='custom'] {
    color: #686868;
    background-color: #fff;
    font-size: 14px;
    font-weight: 500;
    border-radius: 8px;
    padding: 8px 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  .tippy-box[data-theme~='custom'] .tippy-arrow {
    color: #fff;
    border-color: transparent;
  }
  .tippy-box[data-theme~='custom'][data-placement^='bottom'] > .tippy-arrow:before {
    border-bottom-color: #fff;
  }
`;

const MailIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="4" ry="4"></rect>
        <path d="M22 6l-10 7L2 6"></path>
    </svg>
);

const LockIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

const ErrorIcon = () => (
    <svg className="w-4 h-4 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" />
        <path d="M12 8v4" />
        <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
);

const COLOR_PRIMARY = "#8FB7CC";
const COLOR_HOVER = "#7BA7C7";
const COLOR_TEXT = "#686868";

const getBaseButtonStyle = () => ({
    backgroundColor: COLOR_PRIMARY,
    color: "#fff",
    fontWeight: 600,
    borderRadius: "12px",
    border: `2px solid ${COLOR_PRIMARY}`,
    padding: "12px",
    width: "100%",
    fontSize: "16px",
    cursor: "pointer",
    outline: "none",
    transition: "background-color 0.2s ease, box-shadow 0.2s ease, transform 0.12s ease",
    transform: "scale(1)",
});

const getHoverButtonStyle = () => ({
    ...getBaseButtonStyle(),
    backgroundColor: COLOR_HOVER,
    boxShadow: `0 6px 18px rgba(123,167,199,0.22)`,
    transform: "scale(1.02)",
});

const getActiveButtonStyle = () => ({
    ...getBaseButtonStyle(),
    backgroundColor: COLOR_HOVER,
    boxShadow: `0 2px 6px rgba(158,193,214,0.5)`,
    transform: "scale(0.98)",
});

const getInputStyle = (isFocused, hasError, theme) => ({
    borderColor: hasError ? "#f1b0b0ff" : isFocused ? COLOR_HOVER : "#8686865b",
    boxShadow: isFocused ? `0 0 0 6px rgba(143,183,204,0.08)` : "none",
    backgroundColor: theme.palette.mode === "dark" ? "#222222" : "transparent",
    color: theme.palette.mode === "dark" ? "#ffffff" : "#000000",
});

export default function LoginPage({ switchToSignUp }) {
    const [buttonStyle, setButtonStyle] = useState(getBaseButtonStyle());
    const [focusedInput, setFocusedInput] = useState("");
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    useEffect(() => {
        setButtonStyle(getBaseButtonStyle());
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = tippyStyles;
        document.head.appendChild(styleSheet);
        return () => document.head.removeChild(styleSheet);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        const result = loginSchema.safeParse({ ...formData, [name]: value });

        if (!result.success) {
            const fieldError = result.error.issues.find((issue) => issue.path[0] === name);
            if (fieldError && focusedInput === name) {
                setErrors({ ...errors, [name]: fieldError.message });
            } else {
                setErrors({ ...errors, [name]: "" });
            }
        } else {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const handleFocus = (field) => {
        setFocusedInput(field);
        const result = loginSchema.safeParse({ ...formData, [field]: formData[field] });
        if (!result.success) {
            const fieldError = result.error.issues.find((issue) => issue.path[0] === field);
            if (fieldError) {
                setErrors({ ...errors, [field]: fieldError.message });
            }
        }
    };

    const handleBlur = () => {
        setFocusedInput("");
        setErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = loginSchema.safeParse(formData);

        if (!result.success) {
            const validationErrors = result.error.issues.reduce((acc, issue) => {
                acc[issue.path[0]] = issue.message;
                return acc;
            }, {});

            setErrors(validationErrors);

            const firstError = result.error.issues[0];
            toast.error(firstError.message);

            setLoading(false);
            return;
        }

        try {
            const response = await loginApi(formData);

            if (response.success) {
                const token = response.data.token;
                if (token) {
                    localStorage.setItem("token", token);
                    toast.success("Logged in successfully!");
                    setMessage("Logged in successfully!");
                    navigate("/home");
                } else {
                    toast.error("Login succeeded, but no token received");
                    setMessage("Login succeeded, but no token received");
                }
            } else {
                toast.error(response.message || "Login failed!");
                setMessage(`${response.message || "Login failed!"}`);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Server not responding";
            toast.error(errorMessage);
            setMessage(`${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex flex-col ${theme.palette.mode === "dark" ? "bg-[#171717]" : "bg-white"}`}>
            <nav className="flex justify-between items-center px-6 py-4">
                <div onClick={() => navigate("/")} className="flex items-center cursor-pointer select-none">
                    <h4 className={`text-xl font-bold tracking-wide transition-colors duration-300 ${isDark ? "text-[#b0b0b0]" : "text-[#6a6a6a]"}`}>Study</h4>
                    <h4 className={`text-xl font-bold tracking-wide ml-1 transition-colors duration-300 ${isDark ? "text-[#8fb7cc]" : "text-[#8fb7cc]"}`}>Station</h4>
                </div>
                <DarkModeToggle/>
            </nav>
            <div className="flex-grow flex items-center justify-center p-4">
                <div className={`w-full max-w-5xl rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row ${theme.palette.mode === "dark" ? "bg-[#171717]" : "bg-white"}`}>
                    <div className={`hidden md:block md:w-1/2 ${theme.palette.mode === "dark" ? "bg-[#171717]" : "bg-white"}`}>
                        <img src={LoginImg} alt="Login Illustration" className="w-full h-full object-cover" style={{ minHeight: 420, maxHeight: 720 }} />
                    </div>
                    <div className={`w-full md:w-1/2 flex items-center justify-center p-6 sm:p-10 ${theme.palette.mode === "dark" ? "bg-[#171717]" : "bg-white"}`}>
                        <div className="w-full max-w-md">
                            <div className="mb-6 text-center">
                                <h1
                                    className="text-xl sm:text-3xl font-bold"
                                    style={{ color: COLOR_PRIMARY, whiteSpace: "nowrap" }}
                                >
                                    Welcome back to Study Station
                                </h1>

                                <p className="mt-2 text-sm sm:text-base" style={{ color: theme.palette.mode === "dark" ? "#ffffff" : COLOR_TEXT }}>
                                    Stay focused and continue your progress.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Email */}
                                <Tippy content={errors.email} visible={!!errors.email && focusedInput === "email"} placement="bottom" arrow={true} theme="custom">
                                    <div className="relative">
                                        <MailIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5" style={{ color: theme.palette.mode === "dark" ? "#ffffff" : COLOR_TEXT }} />
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Email"
                                            className="w-full border-2 rounded-xl py-3 pl-11 pr-10 text-sm sm:text-base focus:outline-none transition-all duration-150"
                                            style={getInputStyle(focusedInput === "email", !!errors.email, theme)}
                                            onFocus={() => handleFocus("email")}
                                            onBlur={handleBlur}
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                        {errors.email && (
                                            <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                                <ErrorIcon />
                                            </div>
                                        )}
                                    </div>
                                </Tippy>

                                {/* Password */}
                                <Tippy content={errors.password} visible={!!errors.password && focusedInput === "password"} placement="bottom" arrow={true} theme="custom">
                                    <div className="relative">
                                        <LockIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5" style={{ color: theme.palette.mode === "dark" ? "#ffffff" : COLOR_TEXT }} />
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Password"
                                            className="w-full border-2 rounded-xl py-3 pl-11 pr-10 text-sm sm:text-base focus:outline-none transition-all duration-150"
                                            style={getInputStyle(focusedInput === "password", !!errors.password, theme)}
                                            onFocus={() => handleFocus("password")}
                                            onBlur={handleBlur}
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                        {errors.password && (
                                            <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                                <ErrorIcon />
                                            </div>
                                        )}
                                    </div>
                                </Tippy>

                                {/* Submit Button */}
                                <div>
                                    <button
                                        style={buttonStyle}
                                        onMouseEnter={() => setButtonStyle(getHoverButtonStyle())}
                                        onMouseLeave={() => setButtonStyle(getBaseButtonStyle())}
                                        onMouseDown={() => setButtonStyle(getActiveButtonStyle())}
                                        onMouseUp={() => setButtonStyle(getHoverButtonStyle())}
                                        type="submit"
                                        className="py-3"
                                        disabled={loading}
                                    >
                                        <span className="text-sm sm:text-base font-semibold">
                                            {loading ? "Logging in..." : "Log In & Focus"}
                                        </span>
                                    </button>
                                </div>
                            </form>
                            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-sm w-full gap-3">
                                <p className="m-0 text-center sm:text-left" style={{ color: theme.palette.mode === "dark" ? "#ffffff" : COLOR_TEXT }}>
                                    Don't have an account yet?{" "}
                                    <span className="font-semibold cursor-pointer" style={{ color: COLOR_PRIMARY }} onClick={switchToSignUp}>
                                        Sign up
                                    </span>
                                </p>
                                <a className="cursor-pointer text-center sm:text-right text-decoration-none" style={{ color: theme.palette.mode === "dark" ? "#ffffff" : COLOR_TEXT }} href="/forgot-password">
                                    Forgot password?
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center p-4 text-sm border-t" style={{ color: theme.palette.mode === "dark" ? "#ffffff" : COLOR_TEXT, borderColor: theme.palette.mode === "dark" ? "#2d2d2d" : "#eee" }}>
                <p className="m-0">
                    © 2025 <span className="font-semibold">Study Station</span>. All rights reserved.
                </p>
            </footer>
            <ToastContainer position="top-center" autoClose={3000} />
        </div>
    );
}