import React, { useState, useEffect } from "react";
import { signupSchema } from "../Schema/signupSchema";
import SignUpImg from "../../assets/images/SignUp.png";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { signUpApi } from '../Services/authServices';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom"; 

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

const UserIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

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

const getInputStyle = (isFocused, hasError) => ({
    borderColor: hasError ? "#f1b0b0ff" : isFocused ? COLOR_HOVER : "#8686865b",
    boxShadow: isFocused ? `0 0 0 6px rgba(143,183,204,0.08)` : "none",
    backgroundColor: "transparent",
});

export default function SignUp({ switchToLogin }) {
    const [buttonStyle, setButtonStyle] = useState(getBaseButtonStyle());
    const [focusedInput, setFocusedInput] = useState("");
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); 

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        dateOfBirth: "",
        gender: "",
    });

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
        const singleFieldData = { [name]: value };
        const result = signupSchema.safeParse({ ...formData, [name]: value });

        if (!result.success) {
            const fieldError = result.error.issues.find((issue) => issue.path[0] === name);
            if (fieldError && focusedInput === name) {
                setErrors({ [name]: fieldError.message });
            } else {
                setErrors((prev) => ({ ...prev, [name]: "" }));
            }
        } else {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleFocus = (field) => {
        setFocusedInput(field);
        const result = signupSchema.safeParse({ ...formData, [field]: formData[field] });
        if (!result.success) {
            const fieldError = result.error.issues.find((issue) => issue.path[0] === name);
            if (fieldError) {
                setErrors({ [field]: fieldError.message });
            }
        }
    };

    const handleBlur = () => {
        setFocusedInput("");
        setErrors({});
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        const result = signupSchema.safeParse(formData);

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
        const apiResponse = await signUpApi(formData);

        if (apiResponse.success) {
            toast.success("Account created successfully! Welcome to Study Station!");
            setMessage("Account created successfully!"); // Consistent message
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                confirmPassword: "",
                dateOfBirth: "",
                gender: "",
            });
            setErrors({});
            navigate("/login");
        } else {
            toast.error(apiResponse.message);
            setMessage(`${apiResponse.message}`);
        }

        setLoading(false);
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row">
                    <div className="w-full md:w-1/2 p-6 sm:p-10 flex items-center">
                        <div className="w-full max-w-lg mx-auto">
                            <div className="mb-6 text-center">
                                <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: COLOR_PRIMARY }}>
                                    Create your Study Station account
                                </h2>
                                <p className="mt-2 text-sm sm:text-base" style={{ color: COLOR_TEXT }}>
                                    Join your focus zone and start tracking your study journey
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-3">
                                {/* First Name */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Tippy content={errors.firstName} visible={!!errors.firstName && focusedInput === "firstName"} placement="bottom" arrow={true} theme="custom">
                                        <div className="relative w-full">
                                            <UserIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5" style={{ color: COLOR_TEXT }} />
                                            <input
                                                type="text"
                                                name="firstName"
                                                placeholder="First Name"
                                                className="w-full border-2 rounded-xl py-3 pl-11 pr-10 text-sm sm:text-base focus:outline-none transition-all duration-150"
                                                style={getInputStyle(focusedInput === "firstName", !!errors.firstName)}
                                                onFocus={() => handleFocus("firstName")}
                                                onBlur={handleBlur}
                                                value={formData.firstName}
                                                onChange={handleChange}
                                            />
                                            {errors.firstName && (
                                                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                                    <ErrorIcon />
                                                </div>
                                            )}
                                        </div>
                                    </Tippy>

                                    {/* Last Name */}
                                    <Tippy content={errors.lastName} visible={!!errors.lastName && focusedInput === "lastName"} placement="bottom" arrow={true} theme="custom">
                                        <div className="relative w-full">
                                            <UserIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5" style={{ color: COLOR_TEXT }} />
                                            <input
                                                type="text"
                                                name="lastName"
                                                placeholder="Last Name"
                                                className="w-full border-2 rounded-xl py-3 pl-11 pr-10 text-sm sm:text-base focus:outline-none transition-all duration-150"
                                                style={getInputStyle(focusedInput === "lastName", !!errors.lastName)}
                                                onFocus={() => handleFocus("lastName")}
                                                onBlur={handleBlur}
                                                value={formData.lastName}
                                                onChange={handleChange}
                                            />
                                            {errors.lastName && (
                                                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                                    <ErrorIcon />
                                                </div>
                                            )}
                                        </div>
                                    </Tippy>
                                </div>

                                {/* Email */}
                                <Tippy content={errors.email} visible={!!errors.email && focusedInput === "email"} placement="bottom" arrow={true} theme="custom">
                                    <div className="relative">
                                        <MailIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5" style={{ color: COLOR_TEXT }} />
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Email"
                                            className="w-full border-2 rounded-xl py-3 pl-11 pr-10 text-sm sm:text-base focus:outline-none transition-all duration-150"
                                            style={getInputStyle(focusedInput === "email", !!errors.email)}
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
                                        <LockIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5" style={{ color: COLOR_TEXT }} />
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Password"
                                            className="w-full border-2 rounded-xl py-3 pl-11 pr-10 text-sm sm:text-base focus:outline-none transition-all duration-150"
                                            style={getInputStyle(focusedInput === "password", !!errors.password)}
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

                                {/* Confirm Password */}
                                <Tippy content={errors.confirmPassword} visible={!!errors.confirmPassword && focusedInput === "confirmPassword"} placement="bottom" arrow={true} theme="custom">
                                    <div className="relative">
                                        <LockIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5" style={{ color: COLOR_TEXT }} />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            placeholder="Confirm Password"
                                            className="w-full border-2 rounded-xl py-3 pl-11 pr-10 text-sm sm:text-base focus:outline-none transition-all duration-150"
                                            style={getInputStyle(focusedInput === "confirmPassword", !!errors.confirmPassword)}
                                            onFocus={() => handleFocus("confirmPassword")}
                                            onBlur={handleBlur}
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                        />
                                        {errors.confirmPassword && (
                                            <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                                <ErrorIcon />
                                            </div>
                                        )}
                                    </div>
                                </Tippy>

                                {/* Date of Birth */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Tippy content={errors.dateOfBirth} visible={!!errors.dateOfBirth && focusedInput === "dateOfBirth"} placement="bottom" arrow={true} theme="custom">
                                        <div className="relative">
                                            <input
                                                type="date"
                                                name="dateOfBirth"
                                                className="w-full border-2 rounded-xl py-3 pl-4 pr-10 text-sm sm:text-base focus:outline-none transition-all duration-150"
                                                style={getInputStyle(focusedInput === "dateOfBirth", !!errors.dateOfBirth)}
                                                onFocus={() => handleFocus("dateOfBirth")}
                                                onBlur={handleBlur}
                                                value={formData.dateOfBirth}
                                                onChange={handleChange}
                                            />
                                            {errors.dateOfBirth && (
                                                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                                                    <ErrorIcon />
                                                </div>
                                            )}
                                        </div>
                                    </Tippy>

                                    {/* Gender */}
                                    <Tippy content={errors.gender} visible={!!errors.gender && focusedInput === "gender"} placement="bottom" arrow={true} theme="custom">
                                        <div className="relative">
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                className="appearance-none w-full border-2 rounded-xl py-3 pl-4 pr-10 text-sm sm:text-base focus:outline-none transition-all duration-150"
                                                style={getInputStyle(focusedInput === "gender", !!errors.gender)}
                                                onFocus={() => handleFocus("gender")}
                                                onBlur={handleBlur}
                                            >
                                                <option value="" disabled>
                                                    Gender
                                                </option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                            </select>
                                            <svg
                                                className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 pointer-events-none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                style={{ color: COLOR_TEXT }}
                                            >
                                                <path d="M6 9l6 6 6-6"></path>
                                            </svg>
                                            {errors.gender && (
                                                <div className="absolute top-1/2 right-10 -translate-y-1/2">
                                                    <ErrorIcon />
                                                </div>
                                            )}
                                        </div>
                                    </Tippy>
                                </div>

                                {/* Submit */}
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
                                            {loading ? "Loading..." : "Sign Up & Start Studying"}
                                        </span>
                                    </button>
                                </div>
                            </form>
                            {/* Switch to Login */}
                            <div className="mt-4 text-center text-sm">
                                <p className="m-0" style={{ color: COLOR_TEXT }}>
                                    Already have an account?{" "}
                                    <span className="font-semibold cursor-pointer" style={{ color: COLOR_PRIMARY }} onClick={switchToLogin}>
                                        Log In
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side Image */}
                    <div className="hidden md:flex md:w-1/2 items-center justify-center p-6 bg-gray-50">
                        <img src={SignUpImg} alt="Student Desk Illustration" className="max-w-full h-auto object-contain rounded-xl" style={{ minHeight: 320 }} />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center p-4 text-sm border-t" style={{ color: COLOR_TEXT, borderColor: "#eee" }}>
                <p className="m-0">
                    © 2025 <span className="font-semibold">Study Station</span>. All rights reserved.
                </p>
            </footer>
            <ToastContainer position="top-center" autoClose={3000} />
        </div>
    );
}