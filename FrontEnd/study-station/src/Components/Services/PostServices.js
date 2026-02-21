import { toast } from "react-toastify";

const API_URL = "https://study-station.runasp.net/api/Posts";

const getAuthToken = () => localStorage.getItem("accessToken") || "";

export async function createPostsApi(formData) {
    try {
        const token = getAuthToken();
        if (!token) {
            toast.error("Please login first");
            return null;
        }

        const title = formData.get('title');
        const content = formData.get('content') || '';
        const image = formData.get('image');

        // ✅ الخطوة الأولى: ابعتي البوست JSON
        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ title, content })
        });

        if (res.status === 401) {
            toast.error("Session expired. Please login again");
            return null;
        }

        if (!res.ok) {
            const errorData = await res.json();
            console.log("Server error:", errorData);
            console.log("Title error:", errorData.errors.Title[0]);
            toast.error("Failed to create post");
            return null;
        }

        const data = await res.json();
        if (image && data.id) {
            const imageForm = new FormData();
            imageForm.append('image', image);

            await fetch(`${API_URL}/${data.id}/image`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: imageForm
            }).catch(() => {
                toast.warn("Post created but image failed to upload");
            });
        }

        toast.success("Post created successfully!");
        return { message: 'success', data };
    } catch (err) {
        toast.error("Failed to create post");
        return null;
    }
}

export async function getAllPostsApi() {
    try {
        const token = getAuthToken();
        const res = await fetch(API_URL, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Failed to fetch posts");

        const data = await res.json();
        return { posts: data };
    } catch (err) {
        console.log(err);
        return { posts: [] };
    }
}

export async function getSinglePostsApi(postId) {
    try {
        const token = getAuthToken();
        const res = await fetch(`${API_URL}/${postId}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Failed to fetch post");

        const data = await res.json();
        return { message: 'success', post: data };
    } catch (err) {
        console.log(err);
        return null;
    }
}

export async function getPostCommentApi(postId) {
    try {
        const token = getAuthToken();
        const res = await fetch(`${API_URL}/${postId}/comments`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Failed to fetch comments");

        const data = await res.json();
        return { comments: data };
    } catch (err) {
        console.log(err);
        return { comments: [] };
    }
}
