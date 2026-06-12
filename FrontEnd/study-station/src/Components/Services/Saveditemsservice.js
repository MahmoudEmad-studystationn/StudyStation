const BASE_URL = "https://study-station.runasp.net/api";

export const SavedItemType = {
    PDF: 1,
    Course: 2,
    Note: 3,
    Article: 4,
    Resource: 5,
};

// ── Token helper ──────────────────────────────────────────────────────────────
function getToken() {
    return localStorage.getItem("accessToken");
}

function authHeaders() {
    const token = getToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

// ── GET /api/SavedItems ───────────────────────────────────────────────────────
export async function getSavedItems() {
    const response = await fetch(`${BASE_URL}/SavedItems`, {
        method: "GET",
        headers: authHeaders(),
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch saved items: ${response.status}`);
    }

    return response.json();
}

// ── POST /api/SavedItems ──────────────────────────────────────────────────────
export async function addSavedItem(itemId, itemType) {
    const response = await fetch(`${BASE_URL}/SavedItems`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ itemId, itemType }),
    });

    if (!response.ok) {
        throw new Error(`Failed to save item: ${response.status}`);
    }

    return response.json();
}

// ── DELETE /api/SavedItems/{id} ───────────────────────────────────────────────
export async function deleteSavedItem(id) {
    const response = await fetch(`${BASE_URL}/SavedItems/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });

    if (!response.ok) {
        throw new Error(`Failed to delete saved item: ${response.status}`);
    }

    return response.json();
}