import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faUser, faPaperPlane, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useThemeContext } from "../Theme/ThemeContext";
import { toast } from "react-toastify";

const API_URL = "https://study-station.runasp.net/api/Posts";
const getAuthToken = () => localStorage.getItem("accessToken") || "";

const getCurrentUserId = () => {
    const token = getAuthToken();
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const possibleIds = [
            payload.sub, payload.userId, payload.id, payload.nameid,
            payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
            payload.unique_name, payload.nameidentifier
        ];
        return possibleIds.find(id => id != null)?.toString() || null;
    } catch (err) {
        return null;
    }
};

export default function PostComments({ postId, onBack }) {
    const [post, setPost] = useState(null);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { isDarkMode } = useThemeContext();

    const bgColor = isDarkMode ? "#171717" : "#f3f4f6";
    const cardBg = isDarkMode ? "#2A2A2A" : "white";
    const textPrimary = isDarkMode ? "#E0E0E0" : "#2f3b48";
    const textSecondary = isDarkMode ? "#B0B0B0" : "#6b6f76";
    const borderColor = isDarkMode ? "#404040" : "#d1d5db";
    const inputBg = isDarkMode ? "#363636" : "white";
    const buttonPrimary = "#7daebd";
    const buttonPrimaryHover = "#6a9ab3";
    const currentUserId = getCurrentUserId();

    const fetchPostWithComments = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            if (!token) {
                toast.error("Please login first to view comments");
                return;
            }

            const [postRes, commentsRes] = await Promise.all([
                fetch(`${API_URL}/${postId}`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_URL}/${postId}/comments`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (!postRes.ok || !commentsRes.ok) {
                toast.error("Failed to load comments");
                return;
            }

            const postData = await postRes.json();
            const commentsData = await commentsRes.json();
            setPost({ ...postData, comments: commentsData });
        } catch (err) {
            toast.error("Unable to load comments. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const addComment = async () => {
        if (!newComment.trim()) return;
        try {
            setSubmitting(true);
            const token = getAuthToken();
            if (!token) {
                toast.error("Please login first to comment");
                return;
            }
            const res = await fetch(`${API_URL}/${postId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content: newComment }),
            });
            if (!res.ok) {
                toast.error(res.status === 401 ? "Session expired. Please login again" : "Failed to add comment");
                return;
            }
            toast.success("Comment added!");
            setNewComment("");
            fetchPostWithComments();
        } catch (err) {
            toast.error("Failed to add comment");
        } finally {
            setSubmitting(false);
        }
    };

    const deleteComment = (commentId) => {
        setPost(prevPost => ({
            ...prevPost,
            comments: prevPost.comments.filter(c => c.id !== commentId)
        }));
        const token = getAuthToken();
        if (token) {
            fetch(`${API_URL}/${postId}/comments/${commentId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => toast.error("Failed to delete comment"));
        }
    };

    useEffect(() => {
        if (postId) fetchPostWithComments();
    }, [postId]);

    const comments = post?.comments || [];

    return (
        <div className="min-h-screen font-sans transition-colors duration-300" style={{ backgroundColor: bgColor }}>
            <main className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
                <header className="flex items-center gap-4 mb-6">
                    <button onClick={onBack} className="p-2 rounded-lg transition-colors" style={{ backgroundColor: cardBg, color: textPrimary }}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <h1 className="text-xl sm:text-2xl font-bold" style={{ color: textPrimary }}>
                        Comments ({comments.length})
                    </h1>
                </header>

                <div className="rounded-lg shadow-sm p-4 sm:p-6 mb-6" style={{ backgroundColor: cardBg }}>
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isDarkMode ? "#363636" : "#e4e6eb" }}>
                            <FontAwesomeIcon icon={faUser} style={{ color: textSecondary }} />
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="w-full p-3 rounded-lg outline-none resize-none text-sm"
                                style={{ backgroundColor: inputBg, color: textPrimary, border: `1px solid ${borderColor}` }}
                                rows="3"
                            />
                            <button
                                onClick={addComment}
                                disabled={submitting || !newComment.trim()}
                                className="mt-3 px-6 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: buttonPrimary }}
                                onMouseEnter={(e) => { if (!submitting && newComment.trim()) e.currentTarget.style.backgroundColor = buttonPrimaryHover; }}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = buttonPrimary}
                            >
                                <FontAwesomeIcon icon={faPaperPlane} />
                                {submitting ? "Posting..." : "Post Comment"}
                            </button>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="text-center text-sm py-8" style={{ color: textSecondary }}>
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-2" style={{ borderColor: buttonPrimary }}></div>
                        <div>Loading comments...</div>
                    </div>
                )}

                <div className="space-y-4">
                    {!loading && comments.length === 0 && (
                        <div className="text-center text-sm py-8" style={{ color: textSecondary }}>
                            No comments yet. Be the first to comment!
                        </div>
                    )}
                    {!loading && comments.map((comment) => {
                        const userName = comment.author
                            ? `${comment.author.firstName} ${comment.author.lastName}`
                            : "You";
                        const isMyComment = currentUserId && (!comment.author || comment.author?.id?.toString() === currentUserId);
                        return (
                            <div key={comment.id} className="rounded-lg shadow-sm p-4 sm:p-5 relative" style={{ backgroundColor: cardBg }}>
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isDarkMode ? "#363636" : "#e4e6eb" }}>
                                        <FontAwesomeIcon icon={faUser} style={{ color: textSecondary }} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <div className="text-sm font-bold" style={{ color: textPrimary }}>{userName}</div>
                                                <div className="text-xs" style={{ color: textSecondary }}>
                                                    {comment.createdAt && new Date(comment.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                            {isMyComment && (
                                                <button onClick={() => deleteComment(comment.id)} className="p-2 rounded-lg transition-all hover:bg-red-500/10 group">
                                                    <FontAwesomeIcon icon={faTrash} className="text-lg transition-colors group-hover:text-red-500" style={{ color: textSecondary }} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-sm" style={{ color: textPrimary }}>{comment.content}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
