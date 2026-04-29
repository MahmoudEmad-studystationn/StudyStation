import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const getRoleFromToken = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role || payload.Role || 
               payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || null;
    } catch {
        return null;
    }
};

export default function AdminProtectedRoute({ children }) {
    const { isLoggedIn } = useContext(AuthContext); // ← غير isAuthenticated لـ isLoggedIn
    const token = localStorage.getItem("accessToken");
    const role = getRoleFromToken(token);

    if (!isLoggedIn) return <Navigate to="/login" />;
    if (role !== "Admin") return <Navigate to="/home" />;
    
    return children;
}