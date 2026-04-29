import axiosInstance from "./axiosInstance";

const BASE = "Admin";

export const getDashboardData = () =>
    axiosInstance.get(`${BASE}/dashboard`).then(r => r.data);