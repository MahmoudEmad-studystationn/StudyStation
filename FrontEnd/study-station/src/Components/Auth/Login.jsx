import React, { useState, useEffect, useContext } from "react";
import LoginImg from "../../assets/images/Login.png";
import { loginSchema } from "../Schema/loginSchema";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { loginApi } from '../Services/authServices';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

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
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const { setIsLoggedIn } = useContext(AuthContext);

    useEffect(() => {
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
            toast.error(result.error.issues[0].message);
            setLoading(false);
            return;
        }

        try {
            const response = await loginApi(formData);

            if (response.success) {
                const accessToken = response.data.accessToken;
                const refreshToken = response.data.refreshToken;

                if (accessToken) {
                    localStorage.setItem("accessToken", accessToken);
                    localStorage.setItem("refreshToken", refreshToken || "");
                    
                    setIsLoggedIn(true);

                    toast.success("Logged in successfully! Welcome back!");
                    setTimeout(() => navigate("/home"), 1000);
                } else {
                    toast.error("Login failed: No token received");
                }
            } else {
                toast.error(response.message || "Invalid email or password");
            }
        } catch (err) {
            const errorMessage =
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Server error. Please try again later.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex flex-col ${isDark ? "bg-[#171717]" : "bg-white"}`}>
            <nav className="flex justify-between items-center px-6 py-4">
                <div onClick={() => navigate("/")} className="flex items-center cursor-pointer select-none">
                    <h4 className={`text-xl font-bold tracking-wide ${isDark ? "text-[#b0b0b0]" : "text-[#6a6a6a]"}`}>Study</h4>
                    <h4 className={`text-xl font-bold tracking-wide ml-1 ${isDark ? "text-[#8fb7cc]" : "text-[#8fb7cc]"}`}>Station</h4>
                </div>
            </nav>

            <div className="flex-grow flex items-center justify-center p-4">
                <div className={`w-full max-w-5xl rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row ${isDark ? "bg-[#171717]" : "bg-white"}`}>
                    <div className={`hidden md:block md:w-1/2 ${isDark ? "bg-[#171717]" : "bg-white"}`}>
                        <img src={LoginImg} alt="Login Illustration" className="w-full h-full object-cover" style={{ minHeight: 420 }} />
                    </div>

                    <div className={`w-full md:w-1/2 flex items-center justify-center p-6 sm:p-10 ${isDark ? "bg-[#171717]" : "bg-white"}`}>
                        <div className="w-full max-w-md">
                            <div className="mb-6 text-center">
                                <h1 className="text-xl sm:text-3xl font-bold" style={{ color: COLOR_PRIMARY }}>
                                    Welcome back to Study Station
                                </h1>
                                <p className="mt-2 text-sm sm:text-base" style={{ color: isDark ? "#ffffff" : COLOR_TEXT }}>
                                    Stay focused and continue your progress.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Tippy content={errors.email} visible={!!errors.email && focusedInput === "email"} placement="bottom" arrow theme="custom">
                                    <div className="relative">
                                        <MailIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5" style={{ color: isDark ? "#ffffff" : COLOR_TEXT }} />
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Email"
                                            className="w-full border-2 rounded-xl py-3 pl-11 pr-10 text-sm sm:text-base focus:outline-none"
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

                                <Tippy content={errors.password} visible={!!errors.password && focusedInput === "password"} placement="bottom" arrow theme="custom">
                                    <div className="relative">
                                        <LockIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5" style={{ color: isDark ? "#ffffff" : COLOR_TEXT }} />
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Password"
                                            className="w-full border-2 rounded-xl py-3 pl-11 pr-10 text-sm sm:text-base focus:outline-none"
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

                                <button
                                    style={buttonStyle}
                                    onMouseEnter={() => setButtonStyle(getHoverButtonStyle())}
                                    onMouseLeave={() => setButtonStyle(getBaseButtonStyle())}
                                    onMouseDown={() => setButtonStyle(getActiveButtonStyle())}
                                    onMouseUp={() => setButtonStyle(getHoverButtonStyle())}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3"
                                >
                                    <span className="text-sm sm:text-base font-semibold">
                                        {loading ? "Logging in..." : "Log In & Focus"}
                                    </span>
                                </button>
                            </form>

                            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-sm gap-3">
                                <p className="m-0 text-center sm:text-left" style={{ color: isDark ? "#ffffff" : COLOR_TEXT }}>
                                    Don't have an account?{" "}
                                    <span className="font-semibold cursor-pointer" style={{ color: COLOR_PRIMARY }} onClick={switchToSignUp}>
                                        Sign up
                                    </span>
                                </p>

                                <Link to="/forgot-password" className="text-center sm:text-right text-decoration-none" style={{ color: isDark ? "#ffffff" : COLOR_TEXT }}>
                                    Forgot password?
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="text-center p-4 text-sm border-t" style={{ color: isDark ? "#ffffff" : COLOR_TEXT, borderColor: isDark ? "#2d2d2d" : "#eee" }}>
                <p className="m-0">
                    © 2025 <span className="font-semibold">Study Station</span>. All rights reserved.
                </p>
            </footer>
        </div>
    );
}