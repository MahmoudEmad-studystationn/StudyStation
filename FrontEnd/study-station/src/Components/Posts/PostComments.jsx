import React, { useState, useContext, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faUser, faPaperPlane, faTrash, faEllipsisV, faReply, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { useThemeContext } from "../Theme/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { createCommentApi } from '../Services/commentService';

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
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleString();
}

function buildCommentTree(comments) {
    const map = {};
    const roots = [];
    comments.forEach(c => { map[c.id] = { ...c, replies: [] }; });
    comments.forEach(c => {
        if (c.parentCommentId && map[c.parentCommentId]) {
            map[c.parentCommentId].replies.push(map[c.id]);
        } else {
            roots.push(map[c.id]);
        }
    });
    return roots;
}

function ReplyInput({ postId, parentCommentId, onReplySent, isDarkMode, textPrimary, textSecondary, placeholderBg, inputBg, borderColor, userData }) {
    const [content, setContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!content.trim()) return;
        setSubmitting(true);
        const response = await createCommentApi(content, postId, parentCommentId);
        if (response?.message === "success") {
            const newReply = {
                id: response.data?.id || Date.now(),
                content,
                createdAt: response.data?.createdAt ?? new Date().toISOString(),
                parentCommentId,
                replies: [],
                author: response.data?.author ?? (userData ? {
                    id: userData._id,
                    firstName: userData.firstName ?? userData.name?.split(" ")[0] ?? "",
                    lastName: userData.lastName ?? userData.name?.split(" ").slice(1).join(" ") ?? "",
                } : null),
            };
            onReplySent(newReply);
            setContent("");
        } else {
            toast.error("Failed to send reply");
        }
        setSubmitting(false);
    }

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2 ml-11">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: placeholderBg }}>
                <FontAwesomeIcon icon={faUser} className="text-xs" style={{ color: textSecondary }} />
            </div>
            <div className="flex-1 relative">
                <input
                    type="text"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full rounded-full px-3 py-1.5 pr-8 text-xs outline-none"
                    style={{ backgroundColor: inputBg, color: textPrimary, border: `1px solid ${borderColor}` }}
                    autoFocus
                />
                <button
                    type="submit"
                    disabled={submitting || content.length < 1}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 disabled:cursor-not-allowed transition-colors"
                    style={{ color: content.length >= 1 ? "#7daebd" : textSecondary }}
                >
                    <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
                </button>
            </div>
        </form>
    );
}

function CommentBubble({
    comment, myFullName, currentUserId, postId, onDelete,
    isDarkMode, textPrimary, textSecondary, cardBg, borderColor, placeholderBg, inputBg,
    userData, depth = 0,
}) {
    const [showMenu, setShowMenu] = useState(false);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [extraReplies, setExtraReplies] = useState([]);
    const menuRef = useRef(null);

    const userName = comment.author
        ? `${comment.author.firstName ?? ""} ${comment.author.lastName ?? ""}`.trim()
        : myFullName;

    const isMyComment = currentUserId && (
        !comment.author || comment.author?.id?.toString() === currentUserId
    );

    const allReplies = [...(comment.replies || []), ...extraReplies];
    const replyCount = allReplies.length;

    useEffect(() => {
        function handleClick(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    function handleReplySent(newReply) {
        setExtraReplies(prev => [...prev, newReply]);
        setShowReplyInput(false);
        setShowReplies(true);
    }

    return (
        <div
            className={depth > 0 ? "ml-11 pl-3 border-l-2" : ""}
            style={depth > 0 ? { borderColor: isDarkMode ? "#404040" : "#d1d5db" } : {}}
        >
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: placeholderBg }}>
                    <FontAwesomeIcon icon={faUser} className="text-sm" style={{ color: textSecondary }} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="rounded-xl px-4 py-3" style={{ backgroundColor: inputBg }}>
                        <p className="font-semibold text-sm" style={{ color: textPrimary }}>{userName}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: textSecondary }}>{timeAgo(comment.createdAt)}</p>
                        <p className="text-sm mt-1 break-words" style={{ color: textSecondary }}>{comment.content}</p>
                    </div>

                    {depth === 0 && (
                        <div className="flex items-center gap-3 mt-1.5 px-1">
                            <button
                                onClick={() => setShowReplyInput(v => !v)}
                                className="flex items-center gap-1 text-xs font-medium transition-colors"
                                style={{ color: showReplyInput ? "#7daebd" : textSecondary }}
                            >
                                <FontAwesomeIcon icon={faReply} className="text-[10px]" />
                                Reply
                            </button>

                            {replyCount > 0 && (
                                <button
                                    onClick={() => setShowReplies(v => !v)}
                                    className="flex items-center gap-1 text-xs font-medium"
                                    style={{ color: "#7daebd" }}
                                >
                                    <FontAwesomeIcon icon={showReplies ? faChevronUp : faChevronDown} className="text-[10px]" />
                                    {showReplies ? "Hide replies" : `${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
                                </button>
                            )}
                        </div>
                    )}

                    {showReplyInput && (
                        <ReplyInput
                            postId={postId}
                            parentCommentId={comment.id}
                            onReplySent={handleReplySent}
                            isDarkMode={isDarkMode}
                            textPrimary={textPrimary}
                            textSecondary={textSecondary}
                            placeholderBg={placeholderBg}
                            inputBg={inputBg}
                            borderColor={borderColor}
                            userData={userData}
                        />
                    )}

                    {showReplies && allReplies.length > 0 && (
                        <div className="mt-3 space-y-3">
                            {allReplies.map(reply => (
                                <CommentBubble
                                    key={reply.id}
                                    comment={reply}
                                    myFullName={myFullName}
                                    currentUserId={currentUserId}
                                    postId={postId}
                                    onDelete={onDelete}
                                    isDarkMode={isDarkMode}
                                    textPrimary={textPrimary}
                                    textSecondary={textSecondary}
                                    cardBg={cardBg}
                                    borderColor={borderColor}
                                    placeholderBg={placeholderBg}
                                    inputBg={inputBg}
                                    userData={userData}
                                    depth={depth + 1}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {isMyComment && (
                    <div className="relative flex-shrink-0 mt-2" ref={menuRef}>
                        <button
                            onClick={() => setShowMenu(v => !v)}
                            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                            style={{ color: textSecondary }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = isDarkMode ? "#404040" : "#e4e6eb"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                            <FontAwesomeIcon icon={faEllipsisV} className="text-xs" />
                        </button>
                        {showMenu && (
                            <div
                                className="absolute right-0 top-8 z-50 rounded-xl shadow-xl overflow-hidden"
                                style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}`, minWidth: 130 }}
                            >
                                <button
                                    onClick={() => { onDelete(comment.id); setShowMenu(false); }}
                                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                    <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PostComments({ post, onBack, onCommentDeleted }) {
    const [commentTree, setCommentTree] = useState(() =>
        buildCommentTree(post?.comments || [])
    );
    const [commentContent, setCommentContent] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const bottomRef = useRef(null);

    const { isDarkMode } = useThemeContext();
    const { userData } = useContext(AuthContext);
    const currentUserId = getCurrentUserId();

    useEffect(() => {
        if (post?.comments) {
            setCommentTree(buildCommentTree(post.comments));
        }
    }, [post]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [commentTree.length]);

    const cardBg = isDarkMode ? "#2A2A2A" : "white";
    const textPrimary = isDarkMode ? "#E0E0E0" : "#2f3b48";
    const textSecondary = isDarkMode ? "#B0B0B0" : "#6b6f76";
    const placeholderBg = isDarkMode ? "#363636" : "#e4e6eb";
    const inputBg = isDarkMode ? "#363636" : "#f0f2f5";
    const borderColor = isDarkMode ? "#404040" : "#e4e6eb";

    // العدد الكلي = كل الكومنتات الأصلية + كل الـ replies تحتها
    const totalCommentCount = commentTree.reduce(
        (acc, c) => acc + 1 + (c.replies?.length || 0),
        0
    );

    const myFullName = userData
        ? `${userData.firstName ?? ""} ${userData.lastName ?? ""}`.trim() || userData.name || "You"
        : "You";

    const authorName = post?.author
        ? `${post.author.firstName} ${post.author.lastName}`
        : "Unknown Author";

    const reactions = post?.reactions || [];
    const reactionCounts = {};
    reactions.forEach(r => { reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1; });
    const totalReactions = reactions.length;

    const emojiReactions = [
        { type: "Helpful", emoji: "👍" },
        { type: "Interested", emoji: "❤️" },
        { type: "Notify", emoji: "🔔" },
    ];

    async function createComment(e) {
        e.preventDefault();
        if (!commentContent.trim()) return;
        setSubmitting(true);
        const response = await createCommentApi(commentContent, post.id, null);
        if (response?.message === 'success') {
            const newComment = {
                id: response.data?.id || Date.now(),
                content: commentContent,
                createdAt: response.data?.createdAt ?? new Date().toISOString(),
                parentCommentId: null,
                replies: [],
                author: response.data?.author ?? (userData ? {
                    id: userData._id,
                    firstName: userData.firstName ?? userData.name?.split(" ")[0] ?? "",
                    lastName: userData.lastName ?? userData.name?.split(" ").slice(1).join(" ") ?? "",
                } : null),
            };
            setCommentTree(prev => [...prev, newComment]);
            setCommentContent("");
        } else {
            toast.error("Failed to add comment");
        }
        setSubmitting(false);
    }

    function deleteComment(commentId) {
        setCommentTree(prev => prev.filter(c => c.id !== commentId));
        if (onCommentDeleted) onCommentDeleted(commentId);
        toast.success("Comment deleted!");
    }

    if (!post) return null;

    return (
        <div className="min-h-screen font-sans">
            <main className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 w-full">

                <header className="flex items-center gap-4 mb-6 sm:mb-8">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg transition-colors"
                        style={{ backgroundColor: cardBg, color: textPrimary }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = isDarkMode ? "#404040" : "#f5f6f7"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = cardBg}
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <h1 className="text-xl sm:text-2xl font-bold" style={{ color: textPrimary }}>
                        Comments ({totalCommentCount})
                    </h1>
                </header>

                <div className="space-y-4 sm:space-y-6 max-w-full sm:max-w-2xl md:max-w-3xl mx-auto">

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
                        </header>
                        <div>
                            {post.title && (
                                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1" style={{ color: textPrimary }}>{post.title}</h3>
                            )}
                            {post.content && (
                                <p className="text-sm sm:text-base leading-relaxed" style={{ color: textPrimary, wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "pre-wrap" }}>
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
                                        onError={e => { e.target.style.display = "none"; }}
                                    />
                                    {showImageModal && (
                                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.85)" }} onClick={() => setShowImageModal(false)}>
                                            <div className="relative max-w-4xl max-h-[90vh] w-full">
                                                <img src={post.imageUrl} alt="" className="w-full h-full object-contain rounded-lg" style={{ maxHeight: "90vh" }} onClick={e => e.stopPropagation()} />
                                                <button onClick={() => setShowImageModal(false)} className="absolute cursor-pointer top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>✕</button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                            {totalReactions > 0 && (
                                <div className="flex items-center gap-2 mt-4 pt-3" style={{ borderTop: `1px solid ${borderColor}` }}>
                                    <div className="flex items-center gap-1">
                                        {Object.entries(reactionCounts).slice(0, 3).map(([type]) => {
                                            const emojiInfo = emojiReactions.find(rt => rt.type === type);
                                            return (
                                                <div key={type} className="w-6 h-6 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: isDarkMode ? "#363636" : "#f3f4f6" }}>
                                                    {emojiInfo?.emoji || "👍"}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <span className="text-xs font-medium" style={{ color: textSecondary }}>{totalReactions}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl shadow-md p-5 sm:p-6 transition-colors duration-300" style={{ backgroundColor: cardBg }}>
                        <div className="pb-4" style={{ borderBottom: `1px solid ${borderColor}` }}>
                            <form onSubmit={createComment} className="flex items-center gap-3">
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: placeholderBg }}>
                                    <FontAwesomeIcon icon={faUser} className="text-sm" style={{ color: textSecondary }} />
                                </div>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={commentContent}
                                        onChange={e => setCommentContent(e.target.value)}
                                        placeholder="Write a comment..."
                                        className="w-full rounded-full px-4 py-2 pr-10 text-sm outline-none transition-colors duration-300"
                                        style={{ backgroundColor: inputBg, color: textPrimary, border: `1px solid ${borderColor}` }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={submitting || commentContent.length < 2}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 disabled:cursor-not-allowed transition-colors"
                                        style={{ color: commentContent.length >= 2 ? "#7daebd" : textSecondary }}
                                    >
                                        <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />
                                    </button>
                                </div>
                            </form>
                        </div>

                        {commentTree.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-3xl mb-2">💬</p>
                                <p className="text-sm" style={{ color: textSecondary }}>No comments yet. Be the first!</p>
                            </div>
                        ) : (
                            <div className="space-y-5 pt-4">
                                {commentTree.map(comment => (
                                    <CommentBubble
                                        key={comment.id}
                                        comment={comment}
                                        myFullName={myFullName}
                                        currentUserId={currentUserId}
                                        postId={post.id}
                                        onDelete={deleteComment}
                                        isDarkMode={isDarkMode}
                                        textPrimary={textPrimary}
                                        textSecondary={textSecondary}
                                        cardBg={cardBg}
                                        borderColor={borderColor}
                                        placeholderBg={placeholderBg}
                                        inputBg={inputBg}
                                        userData={userData}
                                        depth={0}
                                    />
                                ))}
                                <div ref={bottomRef} />
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}