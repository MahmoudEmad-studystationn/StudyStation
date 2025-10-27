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
import SoloStudy from "./Components/SoloStudy/SoloStudy";
import StudyWithFriends from "./Components/StudyWithFriends/StudyWithFriends";
import Library from "./Components/Library/Library";
import Posts from "./Components/Posts/Posts";
import DashboardLayout from "./Components/DashboardLayout/DashboardLayout";
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
           <Route path="/home" element={<DashboardLayout><Home /></DashboardLayout>} />
      <Route path="/solo-study" element={<DashboardLayout><SoloStudy /></DashboardLayout>} />
      <Route path="/study-with-friends" element={<DashboardLayout><StudyWithFriends /></DashboardLayout>} />
      <Route path="/library" element={<DashboardLayout><Library /></DashboardLayout>} />
      <Route path="/posts" element={<DashboardLayout><Posts /></DashboardLayout>} />
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