import axiosInstance from "./axiosInstance";

const BASE = "AI/rooms";

// ── Chat ──────────────────────────────────────────────────────────────────
export const sendAiMessage = (roomId, payload) =>
    axiosInstance.post(`${BASE}/${roomId}/chat`, payload).then(r => r.data);
// payload: { message, context?, contextEntityId?, conversationId?, uploadedFileId? }

// ── Analyze ───────────────────────────────────────────────────────────────
export const analyzeRoom = (roomId, sessionEndedAt = null) =>
    axiosInstance.post(`${BASE}/${roomId}/analyze`, { sessionEndedAt }).then(r => r.data);

// ── Analytics ─────────────────────────────────────────────────────────────
export const getRoomAnalytics = (roomId) =>
    axiosInstance.get(`${BASE}/${roomId}/analytics`).then(r => r.data);

// ── Flashcards ────────────────────────────────────────────────────────────
export const generateFlashcards = (roomId, payload) =>
    axiosInstance.post(`${BASE}/${roomId}/flashcards`, payload).then(r => r.data);
// payload: { topic, count, difficulty, questionType, uploadedFileId?, content? }

// ── Quiz ──────────────────────────────────────────────────────────────────
export const generateQuiz = (roomId, payload) =>
    axiosInstance.post(`${BASE}/${roomId}/quiz`, payload).then(r => r.data);
// payload: { topic, count, difficulty, questionType, uploadedFileId?, content? }

// ── Generated Content History ─────────────────────────────────────────────
export const getGeneratedContent = (roomId) =>
    axiosInstance.get(`${BASE}/${roomId}/generated-content`).then(r => r.data);