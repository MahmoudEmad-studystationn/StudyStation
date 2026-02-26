import axios from "axios";
import { refreshTokenApi } from "./authServices";

const axiosInstance = axios.create({
    baseURL: "https://study-station.runasp.net/api/",
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor: حط التوكن في كل request
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: لو جاء 401 حاول تعمل refresh تلقائي
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {

            // لو في refresh جاري، ضيف الـ request في الـ queue
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const result = await refreshTokenApi();

            if (result.success) {
                const newToken = localStorage.getItem("accessToken");
                processQueue(null, newToken);
                isRefreshing = false;
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axiosInstance(originalRequest); // أعد الـ request الأصلي تلقائياً
            } else {
                processQueue(new Error("Session expired"), null);
                isRefreshing = false;
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.dispatchEvent(new Event("auth:logout")); // logout اليوزر
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;