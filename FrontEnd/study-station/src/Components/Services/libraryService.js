const BASE_URL = "https://study-station.runasp.net/api/";

export const libraryApi = {
    // ── GET all approved resources ──────────────────────────
    getAll: () =>
        fetch(`${BASE_URL}Library/all`).then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        }),

    // ── GET single resource by ID ───────────────────────────
    getById: (id) =>
        fetch(`${BASE_URL}Library/${id}`).then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        }),

    // ── POST add new resource (pending review) ──────────────
    // payload shape:
    //   { title, type ("Free"|"Paid"), url, filePath, description, categoryId, resourceTypeId }
    add: (data) =>
        fetch(`${BASE_URL}Library/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }).then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        }),

    // ── PUT update resource ──────────────────────────────────
    // payload shape:
    //   { id, title, type, url, filePath, description, categoryId, resourceTypeId }
    update: (id, data) =>
        fetch(`${BASE_URL}Library/update/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, ...data }),
        }).then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        }),

    // ── PUT approve a pending resource ───────────────────────
    approve: (id) =>
        fetch(`${BASE_URL}Library/approve/${id}`, { method: "PUT" }).then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        }),

    // ── DELETE reject a pending resource ─────────────────────
    reject: (id) =>
        fetch(`${BASE_URL}Library/reject/${id}`, { method: "DELETE" }).then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        }),
};

// ── Field reference ─────────────────────────────────────────
// categoryId:     1=Frontend | 2=Backend | 3=AI/ML | 4=Cyber Security | 5=UI/UX
// resourceTypeId: 1=Videos   | 2=Articles| 3=Books
// type:           "Free" | "Paid"