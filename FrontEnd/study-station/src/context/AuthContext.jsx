import { createContext, useEffect, useState, useCallback } from "react";

export const AuthContext = createContext();

const parseToken = (token) => {
    if (!token) return null;
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
};

const getUserIdFromToken = (token) => {
    const payload = parseToken(token);
    if (!payload) return null;
    const possibleIds = [
        payload.sub, payload.userId, payload.id, payload.nameid,
        payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
        payload.unique_name, payload.nameidentifier
    ];
    return possibleIds.find(id => id != null)?.toString() || null;
};

export default function AuthContextProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData]     = useState(null);
    const [loading, setLoading]       = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("firstName");
        setIsLoggedIn(false);
        setUserData(null);
    }, []);

    const loginSuccess = useCallback((token) => {
        const userId = getUserIdFromToken(token);
        setIsLoggedIn(true);
        if (userId) setUserData({ _id: userId });
    }, []);

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
            loginSuccess(accessToken);
        }
        setLoading(false);
    }, [loginSuccess]);

    useEffect(() => {
        const handleLogout = () => logout();
        window.addEventListener("auth:logout", handleLogout);
        return () => window.removeEventListener("auth:logout", handleLogout);
    }, [logout]);

    return (
        <AuthContext.Provider value={{
            isLoggedIn, setIsLoggedIn,
            userData, setUserData,
            logout, loading,
            loginSuccess
        }}>
            {children}
        </AuthContext.Provider>
    );
}