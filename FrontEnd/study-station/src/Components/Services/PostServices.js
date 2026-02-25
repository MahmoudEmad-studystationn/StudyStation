import { toast } from "react-toastify";
import axiosInstance from "./axiosInstance";

export async function createPostsApi(formData) {
    try {
        const title = formData.get('title');
        const content = formData.get('content') || '';
        const image = formData.get('image');

        let imageUrl = null;

        if (image) {
            imageUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(image);
            });
        }

        const { data } = await axiosInstance.post("Posts", { title, content, imageUrl });

        toast.success("Post created successfully!");
        return { message: 'success', data };
    } catch (err) {
        toast.error("Failed to create post");
        return null;
    }
}

export async function getAllPostsApi() {
    try {
        const { data } = await axiosInstance.get("Posts");
        return { posts: data };
    } catch {
        return { posts: [] };
    }
}

export async function getSinglePostsApi(postId) {
    try {
        const { data } = await axiosInstance.get(`Posts/${postId}`);
        return { message: 'success', post: data };
    } catch {
        return null;
    }
}

export async function getPostCommentApi(postId) {
    try {
        const { data } = await axiosInstance.get(`Posts/${postId}/comments`);
        return { comments: data };
    } catch {
        return { comments: [] };
    }
}