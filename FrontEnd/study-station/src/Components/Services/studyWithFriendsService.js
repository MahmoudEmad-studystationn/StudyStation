// studyWithFriendsService.js
import axiosInstance from "./axiosInstance"; // عدّل المسار حسب مشروعك

const BASE = "StudyRooms";

export const getAllRooms = () =>
    axiosInstance.get(BASE).then(r => r.data);

export const createRoom = (data) =>
    axiosInstance.post(BASE, data).then(r => r.data);

export const getRoomById = (id) =>
    axiosInstance.get(`${BASE}/${id}`).then(r => r.data);

export const joinRoom = (id, roomCode) =>
    axiosInstance.post(
        roomCode ? `${BASE}/${id}/join?roomCode=${encodeURIComponent(roomCode)}` : `${BASE}/${id}/join`
    ).then(r => r.data);

export const leaveRoom = (id) =>
    axiosInstance.post(`${BASE}/${id}/leave`).then(r => r.data);

export const addTask = (id, taskText) =>
    axiosInstance.post(`${BASE}/${id}/tasks`, taskText).then(r => r.data);

export const toggleTask = (id, taskId) =>
    axiosInstance.patch(`${BASE}/${id}/tasks/${taskId}/toggle`).then(r => r.data);

export const deleteTask = (id, taskId) =>
    axiosInstance.delete(`${BASE}/${id}/tasks/${taskId}`).then(r => r.data);

export const startFocusSession = (id, durationMinutes) =>
    axiosInstance.post(`${BASE}/${id}/focus/start`, durationMinutes).then(r => r.data);

export const stopFocusSession = (id, sessionId) =>
    axiosInstance.post(`${BASE}/${id}/focus/${sessionId}/stop`).then(r => r.data);

export const sendMessage = (id, messageText) =>
    axiosInstance.post(`${BASE}/${id}/messages`, messageText).then(r => r.data);