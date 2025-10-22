import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ThemeProvider as CustomThemeProvider, useThemeContext } from "./Components/Theme/ThemeContext"; // تأكد من المسار هنا
import WelcomePage from "./Pages/WelcomePage";
import SignUp from "./Components/Auth/SignUp";
import Login from "./Components/Auth/Login";
import ForgotPassword from "./Components/Auth/ForgotPassword";
import AuthPage from "./Components/Auth/AuthPage";
import LoadingScreen from "./Pages/LoadingScreen";
import Home from "./Components/Home/Home";
import ResetPassword from "./Components/Auth/ResetPassword";

function AppContent() {
  const { isDarkMode } = useThemeContext(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 3000);
  }, []);

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
    },
  });

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider theme={theme}>
      <div className={isDarkMode ? "dark" : "light"}>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/signup" element={<SignUp switchToLogin={() => navigate("/login")} />} />
          <Route path="/login" element={<Login switchToSignUp={() => navigate("/signup")} />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

function App() {
  return (
    <CustomThemeProvider>
      <AppContent />
    </CustomThemeProvider>
  );
}

export default App;