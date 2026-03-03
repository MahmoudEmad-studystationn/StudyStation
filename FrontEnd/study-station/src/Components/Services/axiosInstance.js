import axios from "axios";

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
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.dispatchEvent(new Event("auth:logout"));
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;