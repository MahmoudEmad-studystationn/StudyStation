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

    // ── Library-matching design tokens ──
    const navy = "#2C3E50";
    const steel = "#8FB7CC";
    const cardBg = isDarkMode ? "#1f1f1f" : "#ffffff";
    const bgPage = isDarkMode ? "#171717" : "#F3F4F6";
    const textPrimary = isDarkMode ? "#f0f0f0" : "#1a1a2e";
    const textSecondary = isDarkMode ? "#9a9a9a" : "#686868";
    const borderColor = isDarkMode ? "rgba(255,255,255,0.07)" : "rgba(44,62,80,0.1)";
    const inputBg = isDarkMode ? "#2a2a2a" : "#F3F4F6";
    const placeholderBg = isDarkMode ? "#2a2a2a" : "#e8eaed";
    const accentSoft = isDarkMode ? "rgba(143,183,204,0.1)" : "rgba(143,183,204,0.18)";

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
        <>
            {/* Google Fonts - Noto Sans Arabic */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
            <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@100..900&display=swap" rel="stylesheet" />

            <style>{`
                .post-card {
                    background: ${cardBg};
                    border: 1px solid ${borderColor};
                    border-radius: 14px;
                    padding: 1.4rem;
                    position: relative;
                    overflow: visible;
                    /* تم إزالة الـ hover بالكامل */
                }

                /* خط Noto Sans Arabic لكل النصوص العربية */
                .post-card,
                .post-author-name,
                .post-title,
                .post-content,
                .post-date,
                .comment-author,
                .comment-text,
                .post-action-btn {
                    font-family: 'Noto Sans Arabic', system-ui, -apple-system, sans-serif;
                }

                .post-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 3px;
                    border-radius: 14px 14px 0 0;
                    background: linear-gradient(90deg, ${navy}, ${steel});
                    opacity: 0;
                }

                .post-avatar {
                    width: 40px; height: 40px;
                    border-radius: 50%;
                    background: ${placeholderBg};
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                    border: 1.5px solid ${borderColor};
                }

                .post-author-name {
                    font-weight: 700;
                    font-size: .875rem;
                    color: ${textPrimary};
                }

                .post-date {
                    font-size: .72rem;
                    color: ${textSecondary};
                    margin-top: 2px;
                }

                .post-title {
                    font-weight: 700;
                    font-size: 1rem;
                    color: ${textPrimary};
                    margin-bottom: .35rem;
                    line-height: 1.3;
                }

                .post-content {
                    font-size: .875rem;
                    color: ${textSecondary};
                    line-height: 1.65;
                    word-break: break-word;
                    overflow-wrap: break-word;
                    white-space: pre-wrap;
                }

                .post-divider {
                    border: none;
                    border-top: 1px solid ${borderColor};
                    margin: .75rem 0;
                }

                .post-action-btn {
                    display: inline-flex; align-items: center; gap: 6px;
                    padding: 6px 12px;
                    border-radius: 8px;
                    border: 1px solid ${borderColor};
                    background: transparent;
                    font-size: .78rem; font-weight: 500;
                    color: ${textSecondary};
                    cursor: pointer;
                    transition: all .2s;
                }

                .post-action-btn:hover {
                    border-color: ${steel};
                    color: ${textPrimary};
                    background: ${accentSoft};
                }

                .post-action-btn.reacted {
                    border-color: ${steel};
                    color: ${steel};
                    background: ${accentSoft};
                }

                /* باقي الستايلات بدون تغيير */
                .reaction-picker {
                    position: absolute;
                    bottom: calc(100% + 8px);
                    left: 0;
                    display: flex; align-items: center; gap: 4px;
                    padding: 8px 12px;
                    background: ${cardBg};
                    border: 1px solid ${borderColor};
                    border-radius: 999px;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                    z-index: 50;
                    animation: slideUp .15s ease-out;
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .reaction-btn {
                    width: 38px; height: 38px;
                    border-radius: 50%;
                    border: none; background: transparent;
                    font-size: 1.2rem;
                    cursor: pointer;
                    transition: transform .15s;
                    display: flex; align-items: center; justify-content: center;
                    position: relative;
                }

                .reaction-btn:hover { transform: scale(1.35); }

                .reaction-tooltip {
                    position: absolute;
                    bottom: calc(100% + 4px);
                    left: 50%; transform: translateX(-50%);
                    background: ${navy};
                    color: white;
                    font-size: .65rem; font-weight: 500;
                    padding: 2px 7px;
                    border-radius: 5px;
                    white-space: nowrap;
                    pointer-events: none;
                }

                .delete-btn {
                    width: 32px; height: 32px;
                    border-radius: 8px;
                    border: 1px solid ${borderColor};
                    background: transparent;
                    color: ${textSecondary};
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: all .2s;
                }

                .delete-btn:hover { 
                    border-color: #ef4444; 
                    color: #ef4444; 
                    background: rgba(239,68,68,.08); 
                }

                .comment-input-wrap {
                    display: flex; align-items: center; gap: 10px;
                    padding-top: .75rem;
                }

                .comment-input {
                    flex: 1;
                    padding: 8px 38px 8px 14px;
                    border-radius: 999px;
                    border: 1px solid ${borderColor};
                    background: ${inputBg};
                    font-size: .82rem;
                    color: ${textPrimary};
                    outline: none;
                    transition: border .2s, box-shadow .2s;
                }

                .comment-input::placeholder { color: ${textSecondary}; }

                .comment-input:focus {
                    border-color: ${steel};
                    box-shadow: 0 0 0 3px rgba(143,183,204,.15);
                }

                .comment-submit {
                    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
                    background: none; border: none; cursor: pointer;
                    color: ${textSecondary}; font-size: .8rem;
                    transition: color .2s;
                }

                .comment-submit.active { color: ${steel}; }
                .comment-submit:disabled { cursor: not-allowed; }

                .comment-bubble {
                    background: ${inputBg};
                    border: 1px solid ${borderColor};
                    border-radius: 12px;
                    padding: .65rem .9rem;
                    position: relative;
                }

                .comment-author {
                    font-weight: 700;
                    font-size: .8rem;
                    color: ${textPrimary};
                }

                .comment-text {
                    font-size: .82rem;
                    color: ${textSecondary};
                    margin-top: 3px;
                    padding-right: 1.5rem;
                    line-height: 1.5;
                }

                .reaction-badge {
                    display: inline-flex; align-items: center; justify-content: center;
                    width: 26px; height: 26px; border-radius: 50%;
                    background: ${inputBg};
                    border: 1px solid ${borderColor};
                    font-size: .85rem;
                }
            `}</style>

            <div className="post-card">
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
                    <div className="post-avatar">
                        <FontAwesomeIcon icon={faUser} style={{ fontSize: ".85rem", color: textSecondary }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div className="post-author-name">{authorName}</div>
                        <div className="post-date">
                            {post.createdAt && new Date(post.createdAt).toLocaleString()}
                        </div>
                    </div>
                    {isMyPost && (
                        <button className="delete-btn" onClick={() => onDeletePost(post.id)} title="Delete post">
                            <FontAwesomeIcon icon={faTrash} style={{ fontSize: ".75rem" }} />
                        </button>
                    )}
                </div>

                {/* Body */}
                <div style={{ marginBottom: "1rem" }}>
                    {post.title && <div className="post-title">{post.title}</div>}
                    {post.content && <p className="post-content">{post.content}</p>}
                    {post.imageUrl && (
                        <>
                            <img
                                src={post.imageUrl}
                                alt={post.title || "Post image"}
                                style={{
                                    width: "100%", height: "220px", objectFit: "cover",
                                    borderRadius: "10px", marginTop: "12px", cursor: "pointer",
                                    border: `1px solid ${borderColor}`, transition: "opacity .2s"
                                }}
                                onClick={() => setShowImageModal(true)}
                                onError={(e) => { e.target.style.display = "none"; }}
                                onMouseEnter={e => e.target.style.opacity = .88}
                                onMouseLeave={e => e.target.style.opacity = 1}
                            />
                            {showImageModal && (
                                <div
                                    style={{
                                        position: "fixed", inset: 0, zIndex: 50,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        padding: "1rem", backgroundColor: "rgba(0,0,0,0.88)"
                                    }}
                                    onClick={() => setShowImageModal(false)}
                                >
                                    <div style={{ position: "relative", maxWidth: "900px", width: "100%" }}>
                                        <img
                                            src={post.imageUrl} alt=""
                                            style={{ width: "100%", maxHeight: "90vh", objectFit: "contain", borderRadius: "12px" }}
                                            onClick={e => e.stopPropagation()}
                                        />
                                        <button
                                            onClick={() => setShowImageModal(false)}
                                            style={{
                                                position: "absolute", top: "12px", right: "12px",
                                                width: "34px", height: "34px", borderRadius: "50%",
                                                background: "rgba(0,0,0,0.55)", border: "none",
                                                color: "white", fontSize: "1rem", cursor: "pointer",
                                                display: "flex", alignItems: "center", justifyContent: "center"
                                            }}
                                        >✕</button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Reaction count */}
                {totalReactions > 0 && (
                    <div style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        marginBottom: ".65rem", paddingBottom: ".65rem",
                        borderBottom: `1px solid ${borderColor}`
                    }}>
                        <div style={{ display: "flex", gap: "4px" }}>
                            {Object.entries(reactionCounts).slice(0, 3).map(([type]) => {
                                const emojiInfo = emojiReactions.find(rt => rt.type === type);
                                return (
                                    <span key={type} className="reaction-badge">{emojiInfo?.emoji || "👍"}</span>
                                );
                            })}
                        </div>
                        <span style={{ fontSize: ".75rem", fontWeight: 500, color: textSecondary }}>{totalReactions}</span>
                    </div>
                )}

                {/* Actions */}
                <div style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    paddingBottom: ".75rem", borderBottom: `1px solid ${borderColor}`
                }}>
                    {/* Like button */}
                    <div style={{ position: "relative" }}>
                        <button
                            className={`post-action-btn${myReaction ? " reacted" : ""}`}
                            onClick={() => setShowReactions(!showReactions)}
                            onMouseEnter={() => setShowReactions(true)}
                            onMouseLeave={() => { setTimeout(() => { if (!hoveredReaction) setShowReactions(false); }, 120); }}
                        >
                            {myReaction && emojiReactions.find(r => r.type === myReaction.type)
                                ? <span style={{ fontSize: "1rem" }}>{emojiReactions.find(r => r.type === myReaction.type).emoji}</span>
                                : <FontAwesomeIcon icon={faThumbsUp} style={{ fontSize: ".8rem" }} />
                            }
                            {myReaction ? myReaction.type : "Like"}
                        </button>

                        {showReactions && (
                            <div
                                className="reaction-picker"
                                onMouseEnter={() => { setShowReactions(true); setHoveredReaction(true); }}
                                onMouseLeave={() => { setShowReactions(false); setHoveredReaction(null); }}
                            >
                                {emojiReactions.map(reaction => (
                                    <button
                                        key={reaction.type}
                                        className="reaction-btn"
                                        onClick={() => handleReactionClick(reaction.type)}
                                        onMouseEnter={() => setHoveredReaction(reaction.type)}
                                        onMouseLeave={() => setHoveredReaction(null)}
                                        style={{ transform: hoveredReaction === reaction.type ? "scale(1.35)" : "scale(1)" }}
                                    >
                                        {reaction.emoji}
                                        {hoveredReaction === reaction.type && (
                                            <span className="reaction-tooltip">{reaction.type}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Comment button */}
                    <button className="post-action-btn" onClick={() => onOpenComments(post.id)}>
                        <FontAwesomeIcon icon={faComment} style={{ fontSize: ".8rem" }} />
                        Comment ({localComments.length})
                    </button>
                </div>

                {/* Add comment */}
                <div className="comment-input-wrap" style={{ paddingBottom: ".75rem", borderBottom: `1px solid ${borderColor}` }}>
                    <div className="post-avatar" style={{ width: "34px", height: "34px" }}>
                        <FontAwesomeIcon icon={faUser} style={{ fontSize: ".75rem", color: textSecondary }} />
                    </div>
                    <div style={{ flex: 1, position: "relative" }}>
                        <form onSubmit={createComment}>
                            <input
                                type="text"
                                className="comment-input"
                                value={commentContent}
                                onChange={e => setCommentContent(e.target.value)}
                                placeholder="Write a comment…"
                            />
                            <button
                                type="submit"
                                className={`comment-submit${commentContent.length >= 2 ? " active" : ""}`}
                                disabled={commentContent.length < 2}
                            >
                                <FontAwesomeIcon icon={faPaperPlane} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Comments preview */}
                {localComments.length > 0 && (
                    <div style={{ paddingTop: ".9rem", display: "flex", flexDirection: "column", gap: "10px" }}>
                        {localComments.slice(0, commentLimit).map(comment => {
                            const commentAuthor = comment.author
                                ? `${comment.author.firstName ?? ""} ${comment.author.lastName ?? ""}`.trim()
                                : myFullName;
                            const isMyComment = currentUserId && (!comment.author || comment.author?.id?.toString() === currentUserId);

                            return (
                                <div key={comment.id} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                                    <div className="post-avatar" style={{ width: "32px", height: "32px", flexShrink: 0 }}>
                                        <FontAwesomeIcon icon={faUser} style={{ fontSize: ".7rem", color: textSecondary }} />
                                    </div>
                                    <div className="comment-bubble" style={{ flex: 1 }}>
                                        <div className="comment-author">{commentAuthor}</div>
                                        <div className="comment-text">{comment.content}</div>
                                        {isMyComment && (
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                style={{
                                                    position: "absolute", top: "10px", right: "10px",
                                                    background: "none", border: "none", cursor: "pointer",
                                                    color: textSecondary, fontSize: ".7rem", padding: "2px",
                                                    transition: "color .2s"
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                                                onMouseLeave={e => e.currentTarget.style.color = textSecondary}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}