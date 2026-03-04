import React, { useState, useEffect } from "react";
import { HeroUIProvider } from "@heroui/react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ThemeProvider as CustomThemeProvider, useThemeContext } from "./Components/Theme/ThemeContext";
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
import VerificationCode from "./Components/Auth/VerificationCode";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import AuthProtectedRoute from "./Components/ProtectedRoute/AuthProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthContextProvider from "./context/AuthContext";
import ShareResource from "./Components/Library/ShareResource";

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
    <HeroUIProvider>
      <ThemeProvider theme={theme}>
        <div className={isDarkMode ? "dark" : "light"}>
          <ToastContainer position="top-center" autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route
              path="/signup"
              element={
                <AuthProtectedRoute>
                  <SignUp switchToLogin={() => navigate("/login")} />
                </AuthProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <AuthProtectedRoute>
                  <Login switchToSignUp={() => navigate("/signup")} />
                </AuthProtectedRoute>
              }
            />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/forgot-password"
              element={
                <AuthProtectedRoute>
                  <ForgotPassword />
                </AuthProtectedRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <AuthProtectedRoute>
                  <ResetPassword />
                </AuthProtectedRoute>
              }
            />
            <Route
              path="/verification-code"
              element={
                <AuthProtectedRoute>
                  <VerificationCode />
                </AuthProtectedRoute>
              }
            />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Home />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/solo-study"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SoloStudy />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/study-with-friends"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <StudyWithFriends />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/library"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Library />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/share-resource"
              element={
                <ProtectedRoute>
                  <ShareResource />
                </ProtectedRoute>
              }
            />
            <Route
              path="/posts"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Posts />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </ThemeProvider>
    </HeroUIProvider>
  );
}

function App() {
  return (
    <CustomThemeProvider>
      <AuthContextProvider>
        <AppContent />
      </AuthContextProvider>
    </CustomThemeProvider>
  );
}

export default App;