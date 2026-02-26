import { createContext, useEffect, useState, useCallback } from "react";
import { refreshTokenApi } from "../Components/Services/authServices";

export const AuthContext = createContext();

const isTokenValid = (token) => {
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            localStorage.removeItem("accessToken");
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
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setIsLoggedIn(false);
        setUserData(null);
    }, []);

    useEffect(() => {
        async function initAuth() {
            const accessToken = localStorage.getItem('accessToken');

            if (isTokenValid(accessToken)) {
                setIsLoggedIn(true);
                const userId = getCurrentUserId();
                if (userId) setUserData({ _id: userId });
            } else {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const result = await refreshTokenApi();
                    if (result.success) {
                        setIsLoggedIn(true);
                        const userId = getCurrentUserId();
                        if (userId) setUserData({ _id: userId });
                    } else {
                        setIsLoggedIn(false);
                        setUserData(null);
                    }
                } else {
                    setIsLoggedIn(false);
                    setUserData(null);
                }
            }

            setLoading(false);
        }

        initAuth();
    }, []);

    useEffect(() => {
        if (!isLoggedIn) return;

        function scheduleRefresh() {
            const token = localStorage.getItem("accessToken");
            if (!token) return;

            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const expiresAt = payload.exp * 1000;
                const now = Date.now();
                const timeUntilExpiry = expiresAt - now;
                const refreshIn = timeUntilExpiry - 2 * 60 * 1000;

                if (refreshIn <= 0) {
                    refreshTokenApi().then(result => {
                        if (result.success) scheduleRefresh();
                        else logout();
                    });
                    return;
                }

                const timer = setTimeout(async () => {
                    const result = await refreshTokenApi();
                    if (result.success) {
                        scheduleRefresh();
                    } else {
                        logout();
                    }
                }, refreshIn);

                return timer;
            } catch {
                return null;
            }
        }

        const timer = scheduleRefresh();
        return () => clearTimeout(timer);
    }, [isLoggedIn, logout]);

    useEffect(() => {
        const handleLogout = () => logout();
        window.addEventListener("auth:logout", handleLogout);
        return () => window.removeEventListener("auth:logout", handleLogout);
    }, [logout]);

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, userData, setUserData, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}