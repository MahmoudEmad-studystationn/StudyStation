const BASE_URL = "https://study-station.runasp.net/api/Ai";

function getHeaders(isFormData = false) {
    const token = localStorage.getItem("accessToken");
    const headers = {};
    if (!isFormData) headers["Content-Type"] = "application/json";
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
}

async function handleResponse(res) {
    if (!res.ok) {
        const err = await res.text().catch(() => "Unknown error");
        throw new Error(err || `HTTP ${res.status}`);
    }
    return res.json();
}

// ─── Conversations ────────────────────────────────────────────────

export async function getConversations(context = null) {
    const url = new URL(`${BASE_URL}/conversations`);
    if (context) url.searchParams.set("context", context);
    const res = await fetch(url.toString(), { headers: getHeaders() });
    return handleResponse(res);
}

export async function getConversationMessages(conversationId) {
    const res = await fetch(`${BASE_URL}/conversations/${conversationId}/messages`, {
        headers: getHeaders(),
    });
    return handleResponse(res);
}

export async function deleteConversation(conversationId) {
    const res = await fetch(`${BASE_URL}/conversations/${conversationId}`, {
        method: "DELETE",
        headers: getHeaders(),
    });
    return handleResponse(res);
}

// ─── Chat ─────────────────────────────────────────────────────────

export async function sendChat({ message, context = "general", conversationId = null, contextEntityId = null, uploadedFileId = null }) {
    const res = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ message, context, conversationId, contextEntityId, uploadedFileId }),
    });
    return handleResponse(res);
}

// ─── Upload ───────────────────────────────────────────────────────

export async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/upload`, {
        method: "POST",
        headers: getHeaders(true),
        body: formData,
    });
    return handleResponse(res);
}

// ─── Quiz ─────────────────────────────────────────────────────────

export async function generateQuiz({ topic, count = 5, difficulty = "medium", questionType = "multiple-choice", content = null, uploadedFileId = null }) {
    const res = await fetch(`${BASE_URL}/quiz`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ topic, count, difficulty, questionType, content, uploadedFileId }),
    });
    return handleResponse(res);
}

// ─── Generated Content ────────────────────────────────────────────

export async function getGeneratedContent(contentType = null, sourceContext = null) {
    const url = new URL(`${BASE_URL}/generated-content`);
    if (contentType) url.searchParams.set("contentType", contentType);
    if (sourceContext) url.searchParams.set("sourceContext", sourceContext);
    const res = await fetch(url.toString(), { headers: getHeaders() });
    return handleResponse(res);
}

export async function getGeneratedContentById(contentId) {
    const res = await fetch(`${BASE_URL}/generated-content/${contentId}`, {
        headers: getHeaders(),
    });
    return handleResponse(res);
}

// ─── Learning Memory ──────────────────────────────────────────────

export async function getLearningMemory() {
    const res = await fetch(`${BASE_URL}/learning-memory`, {
        headers: getHeaders(),
    });
    return handleResponse(res);
}

export async function generateFlashcards({ topic, count = 10, content = null, uploadedFileId = null }) {
    const res = await fetch(`${BASE_URL}/flashcards`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ topic, count, content, uploadedFileId }),
    });
    return handleResponse(res);
}