import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom"; // Added useNavigate
import WelcomePage from "./Pages/WelcomePage";
import SignUp from "./Components/Auth/SignUp";
import Login from "./Components/Auth/Login";
import ForgotPassword from "./Components/Auth/ForgotPassword";
import AuthPage from './Components/Auth/AuthPage';
import LoadingScreen from "./Pages/LoadingScreen";
import Home from "./Components/Home/Home";
import ResetPassword from "./Components/Auth/ResetPassword";

function App() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 

  useEffect(() => {
    setTimeout(() => setLoading(false), 3000);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/signup" element={<SignUp switchToLogin={() => navigate("/login")} />} />
      <Route path="/login" element={<Login switchToSignUp={() => navigate("/signup")} />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}

export default App;