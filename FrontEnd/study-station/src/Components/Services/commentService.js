import axiosInstance from "./axiosInstance";

export async function createCommentApi(content, postId, parentCommentId = null) {
    try {
        const response = await axiosInstance.post(`Posts/${postId}/comments`, {
            content,
            parentCommentId,
        });
        return { message: "success", data: response.data };
    } catch (error) {
        return { message: "error", error };
    }
}

export async function addCommentReactionApi(postId, commentId, type) {
    try {
        const response = await axiosInstance.post(
            `Posts/${postId}/comments/${commentId}/reactions`,
            { type }
        );
        return { message: "success", data: response.data };
    } catch (error) {
        return { message: "error", error };
    }
}

export async function deleteCommentApi(postId, commentId) {
    try {
        await axiosInstance.delete(`Posts/${postId}/comments/${commentId}`);
        return { message: "success" };
    } catch (error) {
        return { message: "error", error };
    }
}