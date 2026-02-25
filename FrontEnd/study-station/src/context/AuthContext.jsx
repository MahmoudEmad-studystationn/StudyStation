import { createContext, useEffect, useState, useCallback } from "react";

export const AuthContext = createContext();

const isTokenValid = (token) => {
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // تحقق إن التوكن مش منتهي
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            return false;
        }
        return true;
    } catch {
        return false;
    }
};

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
    const token = localStorage.getItem('accessToken');
    const [isLoggedIn, setIsLoggedIn] = useState(isTokenValid(token));
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