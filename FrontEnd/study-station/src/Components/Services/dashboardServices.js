import axiosInstance from "./axiosInstance"; 

const BASE_URL = "https://study-station.runasp.net/api";

export const getDashboardData = async () => {
    const { data } = await axiosInstance.get(`${BASE_URL}/Admin/dashboard`);
    return data;
};