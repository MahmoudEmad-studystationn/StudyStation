import axios from "axios";
import { refreshTokenApi } from "./authServices";

const axiosInstance = axios.create({
    baseURL: "https://study-station.runasp.net/api/",
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const result = await refreshTokenApi();

            if (result.success) {
                const newToken = localStorage.getItem("accessToken");
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axiosInstance(originalRequest);
            }
            // ❌ مش بنعمل logout هنا خالص
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;