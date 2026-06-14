import axiosInstance from "./axiosInstance";

// ── GET all pending resources (for admin review) ──────────
export async function getResourcesApi(search = "") {
    try {
        const response = await axiosInstance.get("Admin/resources", {
            params: search ? { search } : {},
        });
        return { message: "success", data: response.data };
    } catch (error) {
        return { message: "error", error };
    }
}


// ── PUT approve a pending resource ────────────────────────
export async function approveResourceApi(id) {
    try {
        const response = await axiosInstance.put(`Library/approve/${id}`);
        return { message: "success", data: response.data };
    } catch (error) {
        return { message: "error", error };
    }
}

// ── DELETE reject a pending resource ─────────────────────
export async function rejectResourceApi(id) {
    try {
        await axiosInstance.delete(`Library/reject/${id}`);
        return { message: "success" };
    } catch (error) {
        return { message: "error", error };
    }
}

// جيب الـ approved resources
export async function getApprovedResourcesApi() {
    try {
        const res = await fetch(`https://study-station.runasp.net/api/Admin/resources`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
            },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        const all = Array.isArray(data) ? data : data.data ?? [];
        return { resources: all.filter(r => r.status === "Approved") };
    } catch {
        return { resources: [] };
    }
}

// احذف ريسورس
export async function deleteResourceApi(id) {
    try {
        const res = await fetch(`https://study-station.runasp.net/api/Admin/resources/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
            },
        });
        if (!res.ok) throw new Error();
        return { message: "success" };
    } catch {
        return { message: "error" };
    }
}