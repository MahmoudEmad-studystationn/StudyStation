import React, { useState, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faThumbsUp, faTrash, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { useThemeContext } from "../Theme/ThemeContext";
import { createCommentApi } from '../Services/commentService';
import { AuthContext } from '../../context/AuthContext';
import { toast } from "react-toastify";

const emojiReactions = [
    { type: "Helpful", emoji: "👍" },
    { type: "Interested", emoji: "❤️" },
    { type: "Notify", emoji: "🔔" },
];

const navy = "#2C3E50";
const steel = "#8FB7CC";

function getInitials(firstName, lastName) {
    const f = (firstName || "").trim()[0] || "";
    const l = (lastName || "").trim()[0] || "";
    return (f + l).toUpperCase() || "?";
}

// Matches the sidebar avatar exactly
function Avatar({ firstName, lastName, size = 40, fontSize = 13 }) {
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #658FA5, #2C3E50)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize, color: "white", letterSpacing: "0.02em",
            border: "2px solid rgba(143,183,204,0.35)",
            userSelect: "none"
        }}>
            {getInitials(firstName, lastName)}
        </div>
    );
}

export default function PostCard({ post, currentUserId, onReaction, onOpenComments, onDeletePost, commentLimit, callBack, onCommentDelete }) {
    const { isDarkMode } = useThemeContext();
    const { userData } = useContext(AuthContext);
    const [showReactions, setShowReactions] = useState(false);
    const [hoveredReaction, setHoveredReaction] = useState(null);
    const [commentContent, setCommentContent] = useState('');
    const [showImageModal, setShowImageModal] = useState(false);
    const [localComments, setLocalComments] = useState(post.comments || []);

    const cardBg = isDarkMode ? "#1f1f1f" : "#ffffff";
    const textPrimary = isDarkMode ? "#f0f0f0" : "#1a1a2e";
    const textSecondary = isDarkMode ? "#9a9a9a" : "#686868";
    const borderColor = isDarkMode ? "rgba(255,255,255,0.07)" : "rgba(44,62,80,0.1)";
    const inputBg = isDarkMode ? "#2a2a2a" : "#F3F4F6";
    const accentSoft = isDarkMode ? "rgba(143,183,204,0.1)" : "rgba(143,183,204,0.18)";

    const authorFirst = post.author?.firstName || "";
    const authorLast = post.author?.lastName || "";
    const authorName = post.author ? `${authorFirst} ${authorLast}`.trim() : "Unknown Author";

    const reactions = post.reactions || [];
    const reactionCounts = {};
    reactions.forEach(r => { reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1; });
    const totalReactions = reactions.length;
    const myReaction = reactions.find(r => r.isMyReaction === true);
    const isMyPost = currentUserId && post.author?.id?.toString() === currentUserId;

    const myFirst = userData?.firstName ?? userData?.name?.split(" ")[0] ?? "";
    const myLast = userData?.lastName ?? userData?.name?.split(" ").slice(1).join(" ") ?? "";
    const myFullName = `${myFirst} ${myLast}`.trim() || "You";

    const handleReactionClick = (type) => { onReaction(post.id, type); setShowReactions(false); };

    async function createComment(e) {
        e.preventDefault();
        if (!commentContent.trim()) return;
        const response = await createCommentApi(commentContent, post.id);
        if (response?.message === 'success') {
            const newComment = {
                id: response.data?.id || Date.now(),
                content: commentContent,
                createdAt: new Date().toISOString(),
                author: {
                    id: currentUserId,
                    firstName: myFirst,
                    lastName: myLast,
                },
            };
            setLocalComments(prev => [...prev, newComment]);
            setCommentContent('');
            if (callBack) callBack(newComment);
        }
    }

    function handleDeleteComment(id) {
        setLocalComments(prev => prev.filter(c => c.id !== id));
        if (onCommentDelete) onCommentDelete(id);
        toast.success("Comment deleted!");
    }

    return (
        <>
            <style>{`
                .post-card {
                    background: ${cardBg};
                    border: 1px solid ${borderColor};
                    border-radius: 14px;
                    padding: 1.25rem;
                    position: relative;
                    overflow: visible;
                    transition: box-shadow .25s;
                }
                .post-card::before {
                    content:''; position:absolute;
                    top:0; left:0; right:0; height:3px;
                    border-radius: 14px 14px 0 0;
                    background: linear-gradient(90deg, ${navy}, ${steel});
                    opacity:0; transition: opacity .2s;
                }
                .post-card:hover::before { opacity:1; }
                .post-card:hover {
                    box-shadow: ${isDarkMode ? "0 8px 28px rgba(0,0,0,0.4)" : "0 8px 28px rgba(44,62,80,0.11)"};
                }
                .p-action-btn {
                    display:inline-flex; align-items:center; gap:6px;
                    padding: 6px 13px; border-radius:8px;
                    border: 1px solid ${borderColor}; background:transparent;
                    font-size:.82rem; font-weight:500; color:${textSecondary};
                    cursor:pointer; transition:all .2s;
                }
                .p-action-btn:hover, .p-action-btn.reacted {
                    border-color:${steel};
                    color:${isDarkMode ? steel : navy};
                    background:${accentSoft};
                }
                .p-delete-btn {
                    width:30px; height:30px; border-radius:8px;
                    border:1px solid ${borderColor}; background:transparent;
                    color:${textSecondary}; cursor:pointer;
                    display:flex; align-items:center; justify-content:center;
                    transition:all .2s;
                }
                .p-delete-btn:hover { border-color:#ef4444; color:#ef4444; background:rgba(239,68,68,.08); }
                .p-reaction-picker {
                    position:absolute; bottom:calc(100% + 8px); left:0;
                    display:flex; align-items:center; gap:2px;
                    padding:7px 11px;
                    background:${cardBg}; border:1px solid ${borderColor};
                    border-radius:999px;
                    box-shadow: 0 8px 24px rgba(0,0,0,.15);
                    z-index:50;
                    animation: pc-slideUp .15s ease-out;
                }
                @keyframes pc-slideUp {
                    from { opacity:0; transform:translateY(6px); }
                    to   { opacity:1; transform:translateY(0); }
                }
                .p-reaction-btn {
                    width:36px; height:36px; border-radius:50%;
                    border:none; background:transparent; font-size:1.1rem;
                    cursor:pointer; transition:transform .15s;
                    display:flex; align-items:center; justify-content:center; position:relative;
                }
                .p-reaction-btn:hover { transform:scale(1.35); }
                .p-reaction-tip {
                    position:absolute; bottom:calc(100% + 4px);
                    left:50%; transform:translateX(-50%);
                    background:${navy}; color:white;
                    font-size:.63rem; font-weight:600; padding:2px 7px; border-radius:5px;
                    white-space:nowrap; pointer-events:none;
                }
                .p-comment-input {
                    width:100%; padding:10px 38px 10px 16px;
                    border-radius:999px; border:1px solid ${borderColor};
                    background:${inputBg}; font-size:.875rem; color:${textPrimary};
                    outline:none; transition:border .2s, box-shadow .2s;
                }
                .p-comment-input::placeholder { color:${textSecondary}; }
                .p-comment-input:focus { border-color:${steel}; box-shadow:0 0 0 3px rgba(143,183,204,.15); }
                .p-comment-bubble {
                    background:${inputBg}; border:1px solid ${borderColor};
                    border-radius:12px; padding:.6rem .85rem; position:relative;
                }
                .p-reaction-badge {
                    display:inline-flex; align-items:center; justify-content:center;
                    width:24px; height:24px; border-radius:50%;
                    background:${inputBg}; border:1px solid ${borderColor}; font-size:.82rem;
                }
            `}</style>

            <div className="post-card">

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
                    <Avatar firstName={authorFirst} lastName={authorLast} size={40} fontSize={13} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: ".9rem", color: textPrimary }}>{authorName}</div>
                        <div style={{ fontSize: ".72rem", color: textSecondary, marginTop: "2px" }}>
                            {post.createdAt && new Date(post.createdAt + "Z").toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true
                            })}
                        </div>
                    </div>
                    {isMyPost && (
                        <button className="p-delete-btn" onClick={() => onDeletePost(post.id)}>
                            <FontAwesomeIcon icon={faTrash} style={{ fontSize: ".72rem" }} />
                        </button>
                    )}
                </div>

                {/* Body */}
                <div style={{ marginBottom: "1rem" }}>
                    {post.title && (
                        <div style={{ fontWeight: 700, fontSize: "1rem", color: textPrimary, marginBottom: ".3rem", lineHeight: 1.3 }}>
                            {post.title}
                        </div>
                    )}
                    {post.content && (
                        <p style={{ fontSize: ".875rem", color: textSecondary, lineHeight: 1.65, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
                            {post.content}
                        </p>
                    )}
                    {post.imageUrl && (
                        <>
                            <img src={post.imageUrl}
                                alt={post.title || "Post image"}
                                style={{
                                    width: "100%", height: "320px", objectFit: "cover",
                                    borderRadius: "10px", marginTop: "12px",
                                    cursor: "pointer", border: `1px solid ${borderColor}`,
                                    display: "block", transition: "opacity .2s"
                                }}
                                onClick={() => setShowImageModal(true)}
                                onError={e => { e.target.style.display = "none"; }}
                                onMouseEnter={e => e.target.style.opacity = .88}
                                onMouseLeave={e => e.target.style.opacity = 1}
                            />
                            {showImageModal && (
                                <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", background: "rgba(0,0,0,0.88)" }} onClick={() => setShowImageModal(false)}>
                                    <div style={{ position: "relative", maxWidth: "900px", width: "100%" }}>
                                        <img src={post.imageUrl} alt="" style={{ width: "100%", maxHeight: "90vh", objectFit: "contain", borderRadius: "12px" }} onClick={e => e.stopPropagation()} />
                                        <button onClick={() => setShowImageModal(false)} style={{ position: "absolute", top: "12px", right: "12px", width: "34px", height: "34px", borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "none", color: "white", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Reaction count */}
                {totalReactions > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: ".6rem", paddingBottom: ".6rem", borderBottom: `1px solid ${borderColor}` }}>
                        <div style={{ display: "flex", gap: "3px" }}>
                            {Object.entries(reactionCounts).slice(0, 3).map(([type]) => {
                                const info = emojiReactions.find(r => r.type === type);
                                return <span key={type} className="p-reaction-badge">{info?.emoji || "👍"}</span>;
                            })}
                        </div>
                        <span style={{ fontSize: ".75rem", fontWeight: 500, color: textSecondary }}>{totalReactions}</span>
                    </div>
                )}

                {/* Action buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingBottom: ".75rem", borderBottom: `1px solid ${borderColor}` }}>
                    <div style={{ position: "relative" }}>
                        <button
                            className={`p-action-btn${myReaction ? " reacted" : ""}`}
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
                            <div className="p-reaction-picker"
                                onMouseEnter={() => { setShowReactions(true); setHoveredReaction(true); }}
                                onMouseLeave={() => { setShowReactions(false); setHoveredReaction(null); }}
                            >
                                {emojiReactions.map(r => (
                                    <button key={r.type} className="p-reaction-btn"
                                        onClick={() => handleReactionClick(r.type)}
                                        onMouseEnter={() => setHoveredReaction(r.type)}
                                        onMouseLeave={() => setHoveredReaction(null)}
                                        style={{ transform: hoveredReaction === r.type ? "scale(1.35)" : "scale(1)" }}
                                    >
                                        {r.emoji}
                                        {hoveredReaction === r.type && <span className="p-reaction-tip">{r.type}</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button className="p-action-btn" onClick={() => onOpenComments(post.id)}>
                        <FontAwesomeIcon icon={faComment} style={{ fontSize: ".8rem" }} />
                        Comment ({localComments.length})
                    </button>
                </div>

                <div style={{ paddingTop: ".85rem", paddingBottom: localComments.length > 0 ? ".85rem" : 0, borderBottom: localComments.length > 0 ? `1px solid ${borderColor}` : "none" }}>
                    <form onSubmit={createComment} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ flex: 1, position: "relative" }}>
                            <input
                                type="text"
                                className="p-comment-input"
                                value={commentContent}
                                onChange={e => setCommentContent(e.target.value)}
                                placeholder="Write a comment…"
                            />
                            <button type="submit" disabled={commentContent.length < 2}
                                style={{
                                    position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                                    background: "none", border: "none",
                                    cursor: commentContent.length >= 2 ? "pointer" : "not-allowed",
                                    color: commentContent.length >= 2 ? steel : textSecondary,
                                    fontSize: ".8rem", transition: "color .2s"
                                }}
                            >
                                <FontAwesomeIcon icon={faPaperPlane} />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Comments preview */}
                {localComments.length > 0 && (
                    <div style={{ paddingTop: ".85rem", display: "flex", flexDirection: "column", gap: "8px" }}>
                        {localComments.slice(0, commentLimit).map(comment => {
                            const cFirst = comment.author?.firstName ?? myFirst;
                            const cLast = comment.author?.lastName ?? myLast;
                            const cName = comment.author ? `${cFirst} ${cLast}`.trim() : myFullName;
                            const isMine = currentUserId && (!comment.author || comment.author?.id?.toString() === currentUserId);
                            return (
                                <div key={comment.id} style={{ display: "flex", alignItems: "flex-start", gap: "9px" }}>
                                    <Avatar firstName={cFirst} lastName={cLast} size={32} fontSize={10} />
                                    <div className="p-comment-bubble" style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: ".8rem", color: textPrimary }}>{cName}</div>
                                        <div style={{ fontSize: ".82rem", color: textSecondary, marginTop: "3px", paddingRight: "1.5rem", lineHeight: 1.5 }}>{comment.content}</div>
                                        {isMine && (
                                            <button onClick={() => handleDeleteComment(comment.id)}
                                                style={{ position: "absolute", top: "9px", right: "9px", background: "none", border: "none", cursor: "pointer", color: textSecondary, fontSize: ".7rem", transition: "color .2s" }}
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