import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PostCard from "./PostCard";
import { useThemeContext } from "../Theme/ThemeContext";

const getCurrentUserId = () => {
    const token = localStorage.getItem("accessToken") || "";
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const possibleIds = [
            payload.sub, payload.userId, payload.id, payload.nameid,
            payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
        ];
        return possibleIds.find(id => id != null)?.toString() || null;
    } catch { return null; }
};

export default function PostPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { isDarkMode } = useThemeContext();
    const currentUserId = getCurrentUserId();
    const post = state?.post;
    const fromSaved = state?.fromSaved;

    const bg = isDarkMode ? "#171717" : "#F3F4F6";
    const muted = isDarkMode ? "#9a9a9a" : "#686868";

    if (!post) {
        return (
            <div style={{ textAlign: "center", marginTop: "3rem", color: muted }}>
                <p>Post not found.</p>
                <button onClick={() => navigate("/saved")}
                    style={{ marginTop: 12, cursor: "pointer" }}>
                    Back to Saved
                </button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: bg, padding: "2rem 1rem" }}>
            <div style={{ maxWidth: 680, margin: "0 auto" }}>
                {/* Back Button */}
                <button
                    onClick={() => navigate(fromSaved ? "/saved" : -1)}
                    style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: "transparent", border: "none",
                        cursor: "pointer", color: muted,
                        fontSize: ".85rem", marginBottom: "1.25rem",
                        padding: 0, transition: "color .2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "#2C3E50"}
                    onMouseLeave={e => e.currentTarget.style.color = muted}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        strokeWidth={2} stroke="currentColor" style={{ width: 14, height: 14 }}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    {fromSaved ? "Back to Saved" : "Back"}
                </button>

                <PostCard
                    post={post}
                    currentUserId={currentUserId}
                    onReaction={() => { }}
                    onOpenComments={() => { }}
                    onDeletePost={() => { }}
                    commentLimit={10}
                />
            </div>
        </div>
    );
}