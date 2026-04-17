const BASE_URL = "https://study-station.runasp.net/api/";

export const libraryApi = {
    getAll: () =>
        fetch(`${BASE_URL}Library/all`).then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        }),

    getById: (id) =>
        fetch(`${BASE_URL}Library/${id}`).then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        }),

    add: (data) =>
        fetch(`${BASE_URL}Library/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        }).then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        }),

    update: (id, data) =>
        fetch(`${BASE_URL}Library/update/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, ...data }),
        }).then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        }),

    approve: (id) =>
        fetch(`${BASE_URL}Library/approve/${id}`, { method: "PUT" }).then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        }),

    reject: (id) =>
        fetch(`${BASE_URL}Library/reject/${id}`, { method: "DELETE" }).then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        }),
};