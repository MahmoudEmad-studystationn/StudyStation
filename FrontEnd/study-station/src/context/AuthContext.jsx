import { createContext, useEffect, useState, useCallback, useRef } from "react";
import { loginApi } from "../Components/Services/authServices";

export const AuthContext = createContext();

const parseToken = (token) => {
    if (!token) return null;
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch { return null; }
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
    const timerRef           = useRef(null);
    const scheduleReLoginRef = useRef(null);

    const clearTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    const logout = useCallback(() => {
        clearTimer();
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("firstName");
        sessionStorage.removeItem("creds");
        setIsLoggedIn(false);
        setUserData(null);
    }, []);

    const scheduleReLogin = useCallback((token) => {
        const payload = parseToken(token);
        if (!payload?.exp) return;

        const msLeft = payload.exp * 1000 - Date.now() - 60_000;
        clearTimer();

        const doReLogin = async () => {
            const raw = sessionStorage.getItem("creds");
            if (!raw) return logout();
            const creds = JSON.parse(raw);
            const res = await loginApi(creds);
            if (res.success) {
                const newToken = localStorage.getItem("accessToken");
                const userId = getUserIdFromToken(newToken);
                if (userId) setUserData({ _id: userId });
                scheduleReLoginRef.current?.(newToken);
            } else {
                logout();
            }
        };

        if (msLeft <= 0) doReLogin();
        else timerRef.current = setTimeout(doReLogin, msLeft);
    }, [logout]);

    scheduleReLoginRef.current = scheduleReLogin;

    const loginSuccess = useCallback((token, credentials = null) => {
        const userId = getUserIdFromToken(token);
        setIsLoggedIn(true);
        if (userId) setUserData({ _id: userId });
        if (credentials) {
            sessionStorage.setItem("creds", JSON.stringify(credentials));
        }
        scheduleReLogin(token);
    }, [scheduleReLogin]);

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) loginSuccess(accessToken);
        setLoading(false);
    }, [loginSuccess]);

    useEffect(() => {
        const handleLogout = () => logout();
        window.addEventListener("auth:logout", handleLogout);
        return () => window.removeEventListener("auth:logout", handleLogout);
    }, [logout]);

    useEffect(() => {
        return () => clearTimer();
    }, []);

    return (
        <AuthContext.Provider value={{
            isLoggedIn, setIsLoggedIn,
            userData, setUserData,
            logout, loading, loginSuccess
        }}>
            {children}
        </AuthContext.Provider>
    );
}