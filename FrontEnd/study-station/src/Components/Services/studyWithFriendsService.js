import axiosInstance from "./axiosInstance";

const BASE = "StudyRooms";

export const getAllRooms = () =>
    axiosInstance.get(BASE).then(r => r.data);

export const createRoom = (data) =>
    axiosInstance.post(BASE, data).then(r => r.data);

export const getRoomById = (id) =>
    axiosInstance.get(`${BASE}/${id}`).then(r => r.data);

export const joinRoom = (id, roomCode) =>
    axiosInstance.post(
        roomCode
            ? `${BASE}/${id}/join?roomCode=${encodeURIComponent(roomCode)}`
            : `${BASE}/${id}/join`
    ).then(r => r.data);

export const leaveRoom = (id) =>
    axiosInstance.post(`${BASE}/${id}/leave`).then(r => r.data);

// ✅ الـ API بيستقبل string كـ JSON body — لازم نبعت JSON.stringify مع الـ header
export const addTask = (id, taskText) =>
    axiosInstance.post(
        `${BASE}/${id}/tasks`,
        JSON.stringify(taskText),
        { headers: { "Content-Type": "application/json" } }
    ).then(r => r.data);

export const toggleTask = (id, taskId) =>
    axiosInstance.patch(`${BASE}/${id}/tasks/${taskId}/toggle`).then(r => r.data);

export const deleteTask = (id, taskId) =>
    axiosInstance.delete(`${BASE}/${id}/tasks/${taskId}`).then(r => r.data);

// ✅ integer كـ JSON body
export const startFocusSession = (id, durationMinutes) =>
    axiosInstance.post(
        `${BASE}/${id}/focus/start`,
        JSON.stringify(durationMinutes),
        { headers: { "Content-Type": "application/json" } }
    ).then(r => r.data);

export const stopFocusSession = (id, sessionId) =>
    axiosInstance.post(`${BASE}/${id}/focus/${sessionId}/stop`).then(r => r.data);

// ✅ message string كـ JSON body
export const sendMessage = (id, messageText) =>
    axiosInstance.post(
        `${BASE}/${id}/messages`,
        JSON.stringify(messageText),
        { headers: { "Content-Type": "application/json" } }
    ).then(r => r.data);

export const deleteRoom = (roomId) =>
    axiosInstance.delete(`${BASE}/${roomId}`).then(r => r.data);