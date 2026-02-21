import { createContext, useEffect, useState, useCallback } from "react";

export const AuthContext = createContext();

const getCurrentUserId = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const possibleIds = [
            payload.sub,
            payload.userId,
            payload.id,
            payload.nameid,
            payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
            payload.unique_name,
            payload.nameidentifier
        ];
        return possibleIds.find(id => id != null)?.toString() || null;
    } catch {
        return null;
    }
};

export default function AuthContextProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('accessToken') != null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setIsLoggedIn(false);
        setUserData(null);
    }, []);

    useEffect(() => {
        if (isLoggedIn) {
            const userId = getCurrentUserId();
            if (userId) setUserData({ _id: userId });
        }
        setLoading(false);
    }, [isLoggedIn]);

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, userData, setUserData, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}