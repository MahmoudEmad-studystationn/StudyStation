const BASE_URL = "/api/Notifications";

// ── shared helper ─────────────────────────────────────────────────────────────
function authHeaders(token) {
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function handleResponse(response, label) {
    if (!response.ok) {
        throw new Error(`${label}: ${response.status} ${response.statusText}`);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    return null;
}

// ── factory — call once per component with the current token ──────────────────
export function createNotificationsService(token) {
    const headers = authHeaders(token);

    return {
        /** GET /api/Notifications */
        getNotifications: () =>
            fetch(BASE_URL, { method: "GET", headers })
                .then(r => handleResponse(r, "getNotifications")),

        /** GET /api/Notifications/unread-count */
        getUnreadCount: () =>
            fetch(`${BASE_URL}/unread-count`, { method: "GET", headers })
                .then(r => handleResponse(r, "getUnreadCount")),

        /** PUT /api/Notifications/mark-all-read */
        markAllRead: () =>
            fetch(`${BASE_URL}/mark-all-read`, { method: "PUT", headers })
                .then(r => handleResponse(r, "markAllRead")),

        /** PUT /api/Notifications/{id}/mark-read */
        markNotificationRead: (id) =>
            fetch(`${BASE_URL}/${id}/mark-read`, { method: "PUT", headers })
                .then(r => handleResponse(r, `markNotificationRead(${id})`)),

        /** DELETE /api/Notifications/{id} */
        deleteNotification: (id) =>
            fetch(`${BASE_URL}/${id}`, { method: "DELETE", headers })
                .then(r => handleResponse(r, `deleteNotification(${id})`)),
    };
}