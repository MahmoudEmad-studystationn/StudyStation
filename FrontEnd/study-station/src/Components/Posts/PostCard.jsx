import React, { useState, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faComment, faThumbsUp, faTrash, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { useThemeContext } from "../Theme/ThemeContext";
import { createCommentApi } from '../Services/commentService';
import { AuthContext } from '../../context/AuthContext';
import { toast } from "react-toastify";

const emojiReactions = [
    { type: "Helpful", emoji: "👍", color: "#7daebd" },
    { type: "Interested", emoji: "❤️", color: "#e74c3c" },
    { type: "Notify", emoji: "🔔", color: "#f39c12" },
];

export default function PostCard({ post, currentUserId, onReaction, onOpenComments, onDeletePost, commentLimit, callBack }) {
    const { isDarkMode } = useThemeContext();
    const { userData } = useContext(AuthContext);
    const [showReactions, setShowReactions] = useState(false);
    const [hoveredReaction, setHoveredReaction] = useState(null);
    const [commentContent, setCommentContent] = useState('');
    const [showImageModal, setShowImageModal] = useState(false);
    const [localComments, setLocalComments] = useState(post.comments || []);

    const cardBg = isDarkMode ? "#2A2A2A" : "white";
    const textPrimary = isDarkMode ? "#E0E0E0" : "#2f3b48";
    const textSecondary = isDarkMode ? "#B0B0B0" : "#6b6f76";
    const placeholderBg = isDarkMode ? "#363636" : "#e4e6eb";
    const inputBg = isDarkMode ? "#363636" : "#f0f2f5";
    const borderColor = isDarkMode ? "#404040" : "#e4e6eb";

    const authorName = post.author
        ? `${post.author.firstName} ${post.author.lastName}`
        : "Unknown Author";

    const reactions = post.reactions || [];
    const reactionCounts = {};
    reactions.forEach((r) => { reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1; });
    const totalReactions = reactions.length;
    const myReaction = reactions.find(r => r.isMyReaction === true);
    const isMyPost = currentUserId && post.author?.id?.toString() === currentUserId;

    const myFullName = userData
        ? `${userData.firstName ?? ""} ${userData.lastName ?? ""}`.trim() || userData.name || "You"
        : "You";

    const handleReactionClick = (reactionType) => {
        onReaction(post.id, reactionType);
        setShowReactions(false);
    };

    async function createComment(e) {
        e.preventDefault();
        if (!commentContent.trim()) return;

        const response = await createCommentApi(commentContent, post.id);
        if (response?.message === 'success') {
            const newComment = {
                id: response.data?.id || Date.now(),
                content: commentContent,
                createdAt: new Date().toISOString(),
                author: response.data?.author ?? (userData ? {
                    id: userData._id,
                    firstName: userData.firstName ?? userData.name?.split(" ")[0] ?? "",
                    lastName: userData.lastName ?? userData.name?.split(" ").slice(1).join(" ") ?? "",
                } : null),
            };
            setLocalComments(prev => [...prev, newComment]);
            setCommentContent('');
            if (callBack) callBack(newComment);
        }
    }

    function handleDeleteComment(commentId) {
        setLocalComments(prev => prev.filter(c => c.id !== commentId));
        toast.success("Comment deleted!");
    }

    return (
        <div className="rounded-xl shadow-md p-5 sm:p-6 md:p-7 transition-colors duration-300" style={{ backgroundColor: cardBg }}>
            <header className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: placeholderBg }}>
                    <FontAwesomeIcon icon={faUser} className="text-lg sm:text-xl" style={{ color: textSecondary }} />
                </div>
                <div className="flex-1">
                    <div className="text-sm sm:text-base font-bold" style={{ color: textPrimary }}>{authorName}</div>
                    <div className="text-[10px] sm:text-xs mt-0.5" style={{ color: textSecondary }}>
                        {post.createdAt && new Date(post.createdAt).toLocaleString()}
                    </div>
                </div>
                {isMyPost && (
                    <button onClick={() => onDeletePost(post.id)} className="p-2 rounded-lg transition-all hover:bg-red-500/10 group" title="Delete post">
                        <FontAwesomeIcon icon={faTrash} className="text-base sm:text-lg transition-colors group-hover:text-red-500" style={{ color: textSecondary }} />
                    </button>
                )}
            </header>

            {/* Post Body */}
            <div className="mb-4 sm:mb-5">
                {post.title && (
                    <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1" style={{ color: textPrimary }}>{post.title}</h3>
                )}
                {post.content && (
                    <p className="text-sm sm:text-base md:text-lg leading-relaxed" style={{ color: textPrimary, wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "pre-wrap" }}>
                        {post.content}
                    </p>
                )}
                {post.imageUrl && (
                    <>
                        <img
                            src={post.imageUrl}
                            alt={post.title || "Post image"}
                            className="w-full h-48 sm:h-56 md:h-64 rounded-lg object-cover mt-3 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setShowImageModal(true)}
                            onError={(e) => { e.target.style.display = "none"; }}
                        />
                        {showImageModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.85)" }} onClick={() => setShowImageModal(false)}>
                                <div className="relative max-w-4xl max-h-[90vh] w-full">
                                    <img src={post.imageUrl} alt={post.title || "Post image"} className="w-full h-full object-contain rounded-lg" style={{ maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()} />
                                    <button onClick={() => setShowImageModal(false)} className="absolute cursor-pointer top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>✕</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Reactions Count */}
            {totalReactions > 0 && (
                <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderBottom: `1px solid ${borderColor}` }}>
                    <div className="flex items-center gap-1">
                        {Object.entries(reactionCounts).slice(0, 3).map(([type]) => {
                            const emojiInfo = emojiReactions.find((rt) => rt.type === type);
                            return (
                                <div key={type} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: isDarkMode ? "#363636" : "#f3f4f6" }}>
                                    {emojiInfo?.emoji || "👍"}
                                </div>
                            );
                        })}
                    </div>
                    <span className="text-xs sm:text-sm font-medium" style={{ color: textSecondary }}>{totalReactions}</span>
                </div>
            )}

            {/* Footer Actions */}
            <footer className="flex items-center gap-4 sm:gap-6 pt-2 pb-3" style={{ borderBottom: `1px solid ${borderColor}` }}>
                <div className="relative">
                    <button
                        onClick={() => setShowReactions(!showReactions)}
                        onMouseEnter={() => setShowReactions(true)}
                        onMouseLeave={() => { setTimeout(() => { if (!hoveredReaction) setShowReactions(false); }, 100); }}
                        className="flex items-center gap-2 transition-all duration-200"
                        style={{ color: myReaction ? emojiReactions.find((r) => r.type === myReaction.type)?.color || textSecondary : textSecondary }}
                    >
                        {myReaction && emojiReactions.find(r => r.type === myReaction.type) ? (
                            <span className="text-lg sm:text-xl">{emojiReactions.find(r => r.type === myReaction.type).emoji}</span>
                        ) : (
                            <FontAwesomeIcon icon={faThumbsUp} className="text-sm sm:text-base" />
                        )}
                        <span className="text-xs sm:text-sm font-medium">{myReaction ? myReaction.type : "Like"}</span>
                    </button>

                    {showReactions && (
                        <div
                            className="absolute bottom-full left-0 mb-2 flex items-center gap-1 px-3 py-2 rounded-full shadow-2xl z-50"
                            style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, animation: "slideUp 0.2s ease-out" }}
                            onMouseEnter={() => { setShowReactions(true); setHoveredReaction(true); }}
                            onMouseLeave={() => { setShowReactions(false); setHoveredReaction(null); }}
                        >
                            {emojiReactions.map((reaction) => (
                                <button
                                    key={reaction.type}
                                    onClick={() => handleReactionClick(reaction.type)}
                                    className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full transition-all duration-200 relative group"
                                    style={{ transform: hoveredReaction === reaction.type ? "scale(1.3)" : "scale(1)" }}
                                    onMouseEnter={() => setHoveredReaction(reaction.type)}
                                    onMouseLeave={() => setHoveredReaction(null)}
                                >
                                    <span className="text-2xl">{reaction.emoji}</span>
                                    <div className="absolute bottom-full mb-1 px-2 py-1 rounded text-[10px] whitespace-nowrap pointer-events-none transition-opacity duration-200" style={{ backgroundColor: isDarkMode ? "#404040" : "#1f2937", color: "#fff", opacity: hoveredReaction === reaction.type ? 1 : 0 }}>
                                        {reaction.type}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={() => onOpenComments(post.id)}
                    className="flex items-center gap-2 transition-colors"
                    style={{ color: textSecondary }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = textPrimary)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = textSecondary)}
                >
                    <FontAwesomeIcon icon={faComment} className="text-sm sm:text-base" />
                    <span className="text-xs sm:text-sm font-medium">Comment ({localComments.length})</span>
                </button>
            </footer>

            {/* Add Comment */}
            <div className="pt-3" style={{ borderBottom: `1px solid ${borderColor}` }}>
                <form onSubmit={createComment} className="flex items-center gap-3 pb-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: placeholderBg }}>
                        <FontAwesomeIcon icon={faUser} className="text-sm" style={{ color: textSecondary }} />
                    </div>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full rounded-full px-4 py-2 pr-10 text-sm outline-none transition-colors duration-300"
                            style={{ backgroundColor: inputBg, color: textPrimary, border: `1px solid ${borderColor}` }}
                        />
                        <button
                            type="submit"
                            disabled={commentContent.length < 2}
                            className="absolute right-3 top-1/2 -translate-y-1/2 disabled:cursor-not-allowed transition-colors"
                            style={{ color: commentContent.length >= 2 ? "#7daebd" : textSecondary }}
                        >
                            <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Comments Preview */}
            {localComments.length > 0 && (
                <div className="pt-4 space-y-3">
                    {localComments.slice(0, commentLimit).map((comment) => {
                        const commentAuthor = comment.author
                            ? `${comment.author.firstName ?? ""} ${comment.author.lastName ?? ""}`.trim()
                            : myFullName;

                        const isMyComment = currentUserId && (!comment.author || comment.author?.id?.toString() === currentUserId);

                        return (
                            <div key={comment.id} className="flex items-start gap-3">
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: placeholderBg }}>
                                    <FontAwesomeIcon icon={faUser} className="text-sm" style={{ color: textSecondary }} />
                                </div>
                                <div className="flex-1 rounded-xl px-4 py-3 relative" style={{ backgroundColor: inputBg }}>
                                    {isMyComment && (
                                        <div className="absolute top-2 right-2">
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="p-1 rounded transition-all hover:bg-red-500/10 group"
                                                title="Delete comment"
                                            >
                                                <FontAwesomeIcon icon={faTrash} className="text-sm transition-colors group-hover:text-red-500" style={{ color: textSecondary }} />
                                            </button>
                                        </div>
                                    )}
                                    <p className="font-semibold text-sm sm:text-base" style={{ color: textPrimary }}>{commentAuthor}</p>
                                    <p className="text-sm mt-1 pr-8" style={{ color: textSecondary }}>{comment.content}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}