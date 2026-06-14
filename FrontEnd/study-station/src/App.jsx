import React, { useState, useEffect, useContext } from "react";
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
import ResourceDetail from "./Components/Library/ResourceDetail";
import { AuthContext } from "./context/AuthContext";
import { HeroUIProvider } from "@heroui/react";
import StudyRoom from "./Components/StudyWithFriends/StudyRoom";
import ProfilePage from "./Components/Profile/Profile";
import Dashboard from "./Components/AdminDashboard/Dashboad";
import Users from "./Components/AdminDashboard/UserDashoard";
import Resources from "./Components/AdminDashboard/Reasourses";
import Moderation from "./Components/AdminDashboard/Moderarion";
import AdminProtectedRoute from "./Components/ProtectedRoute/AdminProtectedRoute";
import NotificationsPage from "./Pages/Notificationspage";
import SavedPage from "./Pages/Savedpage";
import PostPage from "./Components/Posts/PostPage";
import AiChat from "./Components/Aichat/Aichat";
import FloatingChatButton from "./Components/Aichat/Floatingchatbutton";


function AppContent() {
  const { isDarkMode } = useThemeContext();
  const navigate = useNavigate();
  const [appLoading, setAppLoading] = useState(true);
  const { loading: authLoading } = useContext(AuthContext);

  useEffect(() => {
    const timer = setTimeout(() => setAppLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
    },
  });

  if (appLoading || authLoading) {
    return <LoadingScreen />;
  }

  return (
    <HeroUIProvider>
      <ThemeProvider theme={theme}>
        <div className={isDarkMode ? "dark" : "light"}>
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
          />

          <Routes>
            {/* ── Public ── */}
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

            {/* ── Protected (User) ── */}
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
              path="/study-rooms/:roomId"
              element={
                <ProtectedRoute>
                  <StudyRoom />
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
              path="/library/:id"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ResourceDetail />
                  </DashboardLayout>
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

            <Route path="/posts/:id" element={
              <ProtectedRoute>
                <PostPage />
              </ProtectedRoute>
            } />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ProfilePage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/saved"
              element={
                <ProtectedRoute>
                  <SavedPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/aichat"
              element={
                <ProtectedRoute>
                  <AiChat />
                </ProtectedRoute>
              }
            />

            {/* ── Protected (Admin) ── */}
            <Route
              path="/dashboard"
              element={
                <AdminProtectedRoute>
                  <Dashboard />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/dashboard/users"
              element={
                <AdminProtectedRoute>
                  <Users />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/dashboard/resources"
              element={
                <AdminProtectedRoute>
                  <Resources />
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/dashboard/moderation"
              element={
                <AdminProtectedRoute>
                  <Moderation />
                </AdminProtectedRoute>
              }
            />
          </Routes>
          <FloatingChatButton />
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