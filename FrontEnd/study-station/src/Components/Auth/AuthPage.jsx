import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import Login from "./Login";
import SignUp from "./SignUp";

export default function AuthPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const mode = params.get("mode") || "login";

    const [isLogin, setIsLogin] = useState(mode === "login");

    const handleSwitchToLogin = () => {
        setIsLogin(true);
        navigate("/auth?mode=login");
    };

    const handleSwitchToSignUp = () => {
        setIsLogin(false);
        navigate("/auth?mode=signup");
    };

    useEffect(() => {
        setIsLogin(mode === "login");
    }, [mode]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <AnimatePresence mode="wait">
                {isLogin ? (
                    <motion.div
                        key="login"
                        initial={{ rotateY: -90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: 90, opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        style={{ backfaceVisibility: "hidden", width: "100%" }}
                        className="w-full"
                    >
                        <Login switchToSignUp={handleSwitchToSignUp} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="signup"
                        initial={{ rotateY: 90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: -90, opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        style={{ backfaceVisibility: "hidden", width: "100%" }}
                        className="w-full"
                    >
                        <SignUp switchToLogin={handleSwitchToLogin} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}