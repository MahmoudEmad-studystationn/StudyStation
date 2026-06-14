import axiosInstance from "./axiosInstance";

export function isResourceApproved(r) {
    if (!r) return false;
    if (r.isApproved === true || r.isApproved === 1) return true;
    return String(r.status ?? "").toLowerCase() === "approved";
}

// ── GET pending resources (admin review queue) ──────────
export async function getPendingResourcesApi() {
    try {
        const response = await axiosInstance.get("Admin/resources");
        const all = Array.isArray(response.data) ? response.data : response.data?.data ?? [];
        return { message: "success", resources: all.filter(r => !isResourceApproved(r)) };
    } catch (error) {
        return { message: "error", resources: [], error };
    }
}

// ── GET all resources (for admin review) ──────────
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

// ── GET approved resources (from Library — persisted on server) ──
export async function getApprovedResourcesApi() {
    try {
        const response = await axiosInstance.get("Library/all");
        const all = Array.isArray(response.data) ? response.data : response.data?.data ?? [];
        return { message: "success", resources: all.filter(isResourceApproved) };
    } catch (error) {
        return { message: "error", resources: [], error };
    }
}

// ── DELETE approved resource ──────────────────────────────
export async function deleteResourceApi(id) {
    try {
        await axiosInstance.delete(`Admin/resources/${id}`);
        return { message: "success" };
    } catch (error) {
        const status = error.response?.status;
        // Fallback: some approved items may only be removable via Library/reject
        if (status === 403 || status === 404) {
            try {
                await axiosInstance.delete(`Library/reject/${id}`);
                return { message: "success" };
            } catch (fallbackError) {
                return {
                    message: "error",
                    status: fallbackError.response?.status ?? status,
                    error: fallbackError,
                };
            }
        }
        return { message: "error", status, error };
    }
}