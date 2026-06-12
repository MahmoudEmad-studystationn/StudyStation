import React, { useState, useContext, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPaperPlane, faTrash, faEllipsisV, faThumbsUp, faHeart, faBell } from "@fortawesome/free-solid-svg-icons";
import { useThemeContext } from "../Theme/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { createCommentApi, deleteCommentApi, addCommentReactionApi } from '../Services/commentService';

const getCurrentUserId = () => {
    const token = localStorage.getItem("accessToken") || "";
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const possibleIds = [
            payload.sub, payload.userId, payload.id, payload.nameid,
            payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
            payload.unique_name, payload.nameidentifier
        ];
        return possibleIds.find(id => id != null)?.toString() || null;
    } catch { return null; }
};

function timeAgo(dateStr) {
    if (!dateStr) return "";
    const normalized = dateStr.endsWith("Z") || dateStr.includes("+") ? dateStr : dateStr + "Z";
    const diff = Math.floor((Date.now() - new Date(normalized)) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(normalized).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
}

function buildCommentTree(comments, currentUserId) {
    const map = {};
    const roots = [];
    comments.forEach(c => {
        map[c.id] = {
            ...c,
            replies: [],
            reactions: (c.reactions || []).map(r => ({
                ...r,
                isMyReaction: r.userId?.toString() === currentUserId
            }))
        };
    });
    comments.forEach(c => {
        if (c.parentCommentId && map[c.parentCommentId]) {
            map[c.parentCommentId].replies.push(map[c.id]);
        } else {
            roots.push(map[c.id]);
        }
    });
    comments.forEach(c => {
    });
    return roots;
}

const navy = "#2C3E50";
const steel = "#8FB7CC";

function getInitials(firstName, lastName) {
    const f = (firstName || "").trim()[0] || "";
    const l = (lastName || "").trim()[0] || "";
    return (f + l).toUpperCase() || "?";
}

function Avatar({ firstName, lastName, size = 36, fontSize = 12 }) {
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, #658FA5, #2C3E50)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 600, fontSize, color: "white", letterSpacing: "0.02em",
            border: "2px solid rgba(143,183,204,0.35)",
            userSelect: "none"
        }}>
            {getInitials(firstName, lastName)}
        </div>
    );
}

function getTokens(isDarkMode) {
    return {
        cardBg: isDarkMode ? "#1f1f1f" : "#ffffff",
        textPrimary: isDarkMode ? "#f0f0f0" : "#1a1a2e",
        textSecondary: isDarkMode ? "#9a9a9a" : "#686868",
        borderColor: isDarkMode ? "rgba(255,255,255,0.07)" : "rgba(44,62,80,0.1)",
        inputBg: isDarkMode ? "#2a2a2a" : "#F3F4F6",
        accentSoft: isDarkMode ? "rgba(143,183,204,0.1)" : "rgba(143,183,204,0.18)",
        fontFamily: '"Noto Sans Arabic", "Open Sans", sans-serif',
    };
}


const reactionDefs = [
    { type: "Helpful", icon: faThumbsUp },
    { type: "Interested", icon: faHeart },
    { type: "Notify", icon: faBell },
];

// ── CommentBubble ───────────────────────────────
function CommentBubble({ comment, myFullName, myFirst, myLast, currentUserId, postId, onDelete, onReaction, isDarkMode }) {
    const [showMenu, setShowMenu] = useState(false);
    const reactions = comment.reactions || [];
    const menuRef = useRef(null);
    const t = getTokens(isDarkMode);

    const cFirst = comment.author?.firstName || myFirst || "";
    const cLast = comment.author?.lastName || myLast || "";
    const userName = `${cFirst} ${cLast}`.trim() || myFullName || "User";

    const isMyComment = currentUserId && (!comment.author || comment.author?.id?.toString() === currentUserId);

    const myReaction = reactions.find(r => r.isMyReaction);
    const reactionCounts = {};
    reactions.forEach(r => { reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1; });

    useEffect(() => {
        function handleClick(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    async function handleReaction(type) {
        onReaction(comment.id, type);
    }

    return (
        <div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <Avatar firstName={cFirst} lastName={cLast} size={34} fontSize={11} />

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        background: t.inputBg, border: `1px solid ${t.borderColor}`,
                        borderRadius: "12px", padding: ".6rem .9rem"
                    }}>
                        <p style={{ fontWeight: 700, fontSize: ".82rem", color: t.textPrimary }}>{userName}</p>
                        <p style={{ fontSize: ".68rem", color: t.textSecondary, marginTop: "2px" }}>{timeAgo(comment.createdAt)}</p>
                        <p style={{ fontSize: ".84rem", color: t.textSecondary, marginTop: "6px", lineHeight: 1.55, wordBreak: "break-word" }}>
                            {comment.content}
                        </p>
                    </div>

                    {/* Reaction buttons */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px", paddingLeft: "4px" }}>
                        {reactionDefs.map(({ type, icon }) => {
                            const count = reactionCounts[type] || 0;
                            const active = myReaction?.type === type;
                            return (
                                <button key={type} onClick={() => handleReaction(type)}
                                    title={type}
                                    style={{
                                        display: "inline-flex", alignItems: "center", gap: "4px",
                                        padding: "3px 8px", borderRadius: "999px",
                                        border: `1px solid ${active ? steel : t.borderColor}`,
                                        background: active ? `rgba(143,183,204,0.15)` : "none",
                                        cursor: "pointer", fontSize: ".72rem", fontWeight: 500,
                                        color: active ? steel : t.textSecondary,
                                        transition: "all .2s"
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = steel; e.currentTarget.style.color = steel; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = active ? steel : t.borderColor; e.currentTarget.style.color = active ? steel : t.textSecondary; }}
                                >
                                    <FontAwesomeIcon icon={icon} style={{ fontSize: ".65rem" }} />
                                    {count > 0 && <span>{count}</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {isMyComment && (
                    <div style={{ position: "relative", flexShrink: 0, marginTop: "4px" }} ref={menuRef}>
                        <button onClick={() => setShowMenu(v => !v)}
                            style={{
                                width: 28, height: 28, borderRadius: "50%",
                                background: "none", border: `1px solid ${t.borderColor}`,
                                cursor: "pointer", color: t.textSecondary,
                                display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s"
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = steel; e.currentTarget.style.color = steel; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = t.borderColor; e.currentTarget.style.color = t.textSecondary; }}
                        >
                            <FontAwesomeIcon icon={faEllipsisV} style={{ fontSize: ".65rem" }} />
                        </button>
                        {showMenu && (
                            <div style={{
                                position: "absolute", right: 0, top: "34px", zIndex: 50,
                                background: t.cardBg, border: `1px solid ${t.borderColor}`,
                                borderRadius: "10px",
                                boxShadow: isDarkMode ? "0 8px 24px rgba(0,0,0,.5)" : "0 8px 24px rgba(44,62,80,.13)",
                                overflow: "hidden", minWidth: "130px"
                            }}>
                                <button onClick={() => { onDelete(comment.id); setShowMenu(false); }}
                                    style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: ".82rem", color: "#ef4444", transition: "background .15s" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,.08)"}
                                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                                >
                                    <FontAwesomeIcon icon={faTrash} style={{ fontSize: ".7rem" }} /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── PostComments (main export) ──────────────────
export default function PostComments({ post, onBack, onCommentAdd, onCommentDelete }) {
    const currentUserId = getCurrentUserId();
    const [commentTree, setCommentTree] = useState(() =>
        buildCommentTree(post?.comments || [], currentUserId)
    );
    const [commentContent, setCommentContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const bottomRef = useRef(null);

    const { isDarkMode } = useThemeContext();
    const { userData } = useContext(AuthContext);
    const t = getTokens(isDarkMode);

    const userDataRef = useRef(userData);
    useEffect(() => {
        if (userData) userDataRef.current = userData;
    }, [userData]);

    const myFirst = userData?.firstName ?? userData?.name?.split(" ")[0] ?? "";
    const myLast = userData?.lastName ?? userData?.name?.split(" ").slice(1).join(" ") ?? "";
    const myFullName = `${myFirst} ${myLast}`.trim() || "You";

    const totalCommentCount = commentTree.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

    const authorFirst = post?.author?.firstName || "";
    const authorLast = post?.author?.lastName || "";
    const authorName = post?.author ? `${authorFirst} ${authorLast}`.trim() : "Unknown Author";

    const reactions = post?.reactions || [];
    const reactionCounts = {};
    reactions.forEach(r => { reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1; });
    const totalReactions = reactions.length;
    const emojiReactions = [
        { type: "Helpful", emoji: "👍" },
        { type: "Interested", emoji: "❤️" },
        { type: "Notify", emoji: "🔔" },
    ];

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [commentTree.length]);

    async function createComment(e) {
        e.preventDefault();
        if (!commentContent.trim()) return;
        setSubmitting(true);

        // snapshot القيم وقت الـ submit مش من الـ closure
        const firstName = userData?.firstName ?? userData?.name?.split(" ")[0] ?? "";
        const lastName = userData?.lastName ?? userData?.name?.split(" ").slice(1).join(" ") ?? "";
        const fullName = `${firstName} ${lastName}`.trim() || "You";

        const response = await createCommentApi(commentContent, post.id, null);
        if (response?.message === 'success') {
            const newId = response.data?.id ?? response.data?.commentId;
            if (!newId) {
                toast.error("Failed to add comment");
                setSubmitting(false);
                return;
            }
            const newComment = {
                id: newId,
                content: commentContent,
                createdAt: new Date().toISOString(),
                parentCommentId: null,
                replies: [],
                reactions: [],
                author: {
                    id: currentUserId,
                    firstName,
                    lastName,
                },
            };
            setCommentTree(prev => [...prev, newComment]);
            setCommentContent("");
            if (onCommentAdd) onCommentAdd(newComment);
        } else {
            toast.error("Failed to add comment");
        }
        setSubmitting(false);
    }

    async function deleteComment(commentId) {
        const response = await deleteCommentApi(post.id, commentId);
        if (response?.message === "success") {
            setCommentTree(prev => prev.filter(c => c.id !== commentId));
            if (onCommentDelete) onCommentDelete(commentId);
            toast.success("Comment deleted!");
        } else {
            toast.error("Failed to delete comment");
        }
    }

    function handleCommentReaction(commentId, type) {
        setCommentTree(prev => prev.map(c => {
            if (c.id !== commentId) return c;
            const existing = (c.reactions || []).find(r => r.isMyReaction);
            if (existing?.type === type) {
                return { ...c, reactions: c.reactions.filter(r => !r.isMyReaction) };
            } else if (existing) {
                return { ...c, reactions: [...c.reactions.filter(r => !r.isMyReaction), { type, isMyReaction: true, userId: currentUserId }] };
            } else {
                return { ...c, reactions: [...(c.reactions || []), { type, isMyReaction: true, userId: currentUserId }] };
            }
        }));

        addCommentReactionApi(post.id, commentId, type)
            .then(res => console.log("reaction response:", res))  // ✅ أضف ده
            .catch(() => toast.error("Failed to update reaction"));
    }

    if (!post) return null;

    return (
        <>
            <style>{`
                .pc-back-btn {
                    display:inline-flex; align-items:center; justify-content:center;
                    width:36px; height:36px; border-radius:9px;
                    border:1px solid ${t.borderColor}; background:${t.cardBg};
                    color:${t.textPrimary}; cursor:pointer; transition:all .2s;
                }
                .pc-back-btn:hover { border-color:${steel}; color:${steel}; background:${t.accentSoft}; }
                .pc-card {
                    background:${t.cardBg}; border:1px solid ${t.borderColor};
                    border-radius:14px; padding:1.25rem;
                    position:relative; overflow:hidden;
                }
                .pc-card::before {
                    content:''; position:absolute;
                    top:0; left:0; right:0; height:3px;
                    border-radius:14px 14px 0 0;
                    background:linear-gradient(90deg,${navy},${steel});
                }
                .pc-comment-input {
                    width:100%; padding:10px 38px 10px 16px;
                    border-radius:999px; border:1px solid ${t.borderColor};
                    background:${t.inputBg}; font-size:.875rem; color:${t.textPrimary};
                    outline:none; transition:border .2s, box-shadow .2s;
                }
                .pc-comment-input::placeholder { color:${t.textSecondary}; }
                .pc-comment-input:focus { border-color:${steel}; box-shadow:0 0 0 3px rgba(143,183,204,.15); }
                .pc-reaction-badge {
                    display:inline-flex; align-items:center; justify-content:center;
                    width:24px; height:24px; border-radius:50%;
                    background:${t.inputBg}; border:1px solid ${t.borderColor}; font-size:.82rem;
                }
            `}</style>

            <div style={{ minHeight: "100vh", fontFamily: t.fontFamily }}>
                <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem 1.5rem 4rem" }}>

                    {/* Header */}
                    <header style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.75rem" }}>
                        <button className="pc-back-btn" onClick={onBack}>
                            <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: ".85rem" }} />
                        </button>
                        <div>
                            <h1 style={{ fontWeight: 800, fontSize: "1.5rem", color: t.textPrimary, lineHeight: 1.2 }}>
                                Comments
                            </h1>
                            <p style={{ fontSize: ".75rem", color: t.textSecondary, marginTop: "2px" }}>
                                {totalCommentCount} {totalCommentCount === 1 ? "comment" : "comments"}
                            </p>
                        </div>
                    </header>

                    <div style={{ maxWidth: "720px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                        {/* Post preview */}
                        <div className="pc-card">
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
                                <Avatar firstName={authorFirst} lastName={authorLast} size={40} fontSize={13} />
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: ".9rem", color: t.textPrimary }}>{authorName}</div>
                                    <div style={{ fontSize: ".72rem", color: t.textSecondary, marginTop: "2px" }}>
                                        {post.createdAt && new Date(post.createdAt + "Z").toLocaleString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true
                                        })}                                    </div>
                                </div>
                            </div>

                            {post.title && <div style={{ fontWeight: 700, fontSize: "1rem", color: t.textPrimary, marginBottom: ".3rem", lineHeight: 1.3 }}>{post.title}</div>}
                            {post.content && <p style={{ fontSize: ".875rem", color: t.textSecondary, lineHeight: 1.65, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>{post.content}</p>}

                            {post.imageUrl && (
                                <>
                                    <img src={post.imageUrl} alt={post.title || "Post image"}
                                        style={{ width: "100%", height: "220px", objectFit: "cover", borderRadius: "10px", marginTop: "12px", border: `1px solid ${t.borderColor}`, cursor: "pointer", transition: "opacity .2s" }}
                                        onClick={() => setShowImageModal(true)}
                                        onMouseEnter={e => e.target.style.opacity = .88}
                                        onMouseLeave={e => e.target.style.opacity = 1}
                                        onError={e => { e.target.style.display = "none"; }}
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

                            {totalReactions > 0 && (
                                <div style={{ display: "flex", alignItems: "center", gap: "7px", marginTop: "1rem", paddingTop: ".75rem", borderTop: `1px solid ${t.borderColor}` }}>
                                    <div style={{ display: "flex", gap: "3px" }}>
                                        {Object.entries(reactionCounts).slice(0, 3).map(([type]) => {
                                            const info = emojiReactions.find(r => r.type === type);
                                            return <span key={type} className="pc-reaction-badge">{info?.emoji || "👍"}</span>;
                                        })}
                                    </div>
                                    <span style={{ fontSize: ".75rem", fontWeight: 500, color: t.textSecondary }}>{totalReactions}</span>
                                </div>
                            )}
                        </div>

                        {/* Comments card */}
                        <div className="pc-card">
                            {/* Add comment */}
                            <div style={{ paddingBottom: "1rem", borderBottom: `1px solid ${t.borderColor}`, marginBottom: "1rem" }}>
                                <form onSubmit={createComment} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{ flex: 1, position: "relative" }}>
                                        <input type="text" value={commentContent}
                                            onChange={e => setCommentContent(e.target.value)}
                                            placeholder="Write a comment…"
                                            className="pc-comment-input"
                                        />
                                        <button type="submit" disabled={submitting || commentContent.length < 2}
                                            style={{
                                                position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                                                background: "none", border: "none",
                                                cursor: commentContent.length >= 2 ? "pointer" : "not-allowed",
                                                color: commentContent.length >= 2 ? steel : t.textSecondary,
                                                fontSize: ".8rem", transition: "color .2s"
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faPaperPlane} />
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Comment list */}
                            {commentTree.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "2.5rem 0" }}>
                                    <div style={{ fontSize: "2rem", marginBottom: ".5rem" }}>💬</div>
                                    <p style={{ fontSize: ".875rem", color: t.textSecondary }}>No comments yet. Be the first!</p>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    {commentTree.map(comment => (
                                        <CommentBubble key={comment.id} comment={comment}
                                            myFullName={myFullName} myFirst={myFirst} myLast={myLast}
                                            currentUserId={currentUserId} postId={post.id} onDelete={deleteComment}
                                            onReaction={handleCommentReaction}
                                            isDarkMode={isDarkMode}
                                        />
                                    ))}
                                    <div ref={bottomRef} />
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}