import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "https://study-station.runasp.net/api/Posts";

export async function createCommentApi(commentContent, postId) {
    try {
        const token = localStorage.getItem("accessToken");
        const { data } = await axios.post(`${API_URL}/${postId}/comments`, {
            content: commentContent
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        toast.success("Comment added successfully!");
        return { message: 'success', data };
    } catch (err) {
        toast.error("Failed to add comment");
        console.log(err);
        return null;
    }
}

export async function deleteCommentApi(postId, commentId) {
    try {
        const token = localStorage.getItem("accessToken");
        const { data } = await axios.delete(`${API_URL}/${postId}/comments/${commentId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        toast.success("Comment deleted successfully!");
        return data;
    } catch (err) {
        toast.error("Failed to delete comment");
        console.log(err);
        return null;
    }
}