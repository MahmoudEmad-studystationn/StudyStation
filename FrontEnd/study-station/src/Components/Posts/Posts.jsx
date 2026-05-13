import React, { useEffect, useState, useContext, useRef } from "react";
import PostComments from "./PostComments";
import PostCard from "./PostCard";
import PostComposer from "./PostComposer";
import LoadingScreen from "./LoadingScreen";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useThemeContext } from "../Theme/ThemeContext";
import HeaderIcons from "../Header/Headericons";
import axiosInstance from "../Services/axiosInstance";

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

const IconSearch = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState("posts");
  const [selectedPost, setSelectedPost] = useState(null);

  const deletedCommentIds = useRef(new Set());

  const { isDarkMode } = useThemeContext();
  const { userData } = useContext(AuthContext);

  const navy  = "#2C3E50";
  const steel = "#8FB7CC";
  const textPrimary   = isDarkMode ? "#f0f0f0" : "#1a1a2e";
  const textSecondary = isDarkMode ? "#9a9a9a" : "#686868";
  const borderColor   = isDarkMode ? "rgba(255,255,255,0.07)" : "rgba(44,62,80,0.1)";
  const inputBg       = isDarkMode ? "#1f1f1f" : "#ffffff";
  const bgPage        = isDarkMode ? "#171717" : "#F3F4F6";

  const currentUserId = getCurrentUserId();

  function normalizePosts(data) {
    return data.map(post => ({
      ...post,
      reactions: (post.reactions || []).map(r => ({
        ...r,
        isMyReaction: r.userId?.toString() === currentUserId
      })),
      comments: (post.comments || []).filter(c => !deletedCommentIds.current.has(c.id))
    }));
  }

  async function fetchPosts() {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("Posts");
      const normalizedPosts = normalizePosts(data);
      setPosts(normalizedPosts);

      setSelectedPost(prev => {
        if (!prev) return prev;
        const updated = normalizedPosts.find(p => p.id === prev.id);
        return updated || prev;
      });
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchPosts(); }, []);

  const filteredPosts = posts.filter(post => {
    const q = search.toLowerCase();
    return (
      post.title?.toLowerCase().includes(q) ||
      post.content?.toLowerCase().includes(q)
    );
  });

  async function addReaction(postId, reactionType) {
    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id !== postId) return p;
        const myExistingReaction = (p.reactions || []).find(r => r.isMyReaction === true);
        if (myExistingReaction?.type === reactionType) {
          return { ...p, reactions: p.reactions.filter(r => !r.isMyReaction) };
        } else if (myExistingReaction) {
          return { ...p, reactions: [...p.reactions.filter(r => !r.isMyReaction), { type: reactionType, isMyReaction: true, userId: currentUserId }] };
        } else {
          return { ...p, reactions: [...p.reactions, { type: reactionType, isMyReaction: true, userId: currentUserId }] };
        }
      })
    );

    setSelectedPost(prev => {
      if (!prev || prev.id !== postId) return prev;
      const myExistingReaction = (prev.reactions || []).find(r => r.isMyReaction === true);
      if (myExistingReaction?.type === reactionType) {
        return { ...prev, reactions: prev.reactions.filter(r => !r.isMyReaction) };
      } else if (myExistingReaction) {
        return { ...prev, reactions: [...prev.reactions.filter(r => !r.isMyReaction), { type: reactionType, isMyReaction: true, userId: currentUserId }] };
      } else {
        return { ...prev, reactions: [...prev.reactions, { type: reactionType, isMyReaction: true, userId: currentUserId }] };
      }
    });

    axiosInstance.post(`Posts/${postId}/reactions`, { type: reactionType }).catch(() => {
      toast.error("Failed to update reaction");
      fetchPosts();
    });
  }

  function addCommentToPost(postId, comment) {
    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id !== postId) return p;
        return { ...p, comments: [...(p.comments || []), comment] };
      })
    );
    setSelectedPost(prev => {
      if (!prev || prev.id !== postId) return prev;
      return { ...prev, comments: [...(prev.comments || []), comment] };
    });
  }

  async function deletePost(postId) {
    try {
      await axiosInstance.delete(`Posts/${postId}`);
      toast.success("Post deleted successfully!");
    } catch {
      toast.error("Failed to delete post");
    }
    fetchPosts();
  }

  function openComments(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setCurrentView("comments");
    } else {
      toast.error("Post not found");
    }
  }

  function goBackToPosts() {
    setCurrentView("posts");
    setSelectedPost(null);
    fetchPosts();
  }

  function onCommentDeleted(commentId) {
    deletedCommentIds.current.add(commentId);
    setPosts(prevPosts =>
      prevPosts.map(p => ({
        ...p,
        comments: (p.comments || []).filter(c => c.id !== commentId)
      }))
    );
    setSelectedPost(prev => {
      if (!prev) return prev;
      return { ...prev, comments: (prev.comments || []).filter(c => c.id !== commentId) };
    });
  }

  if (currentView === "comments" && selectedPost) {
    return (
      <PostComments
        post={selectedPost}
        onBack={goBackToPosts}
        onCommentDeleted={onCommentDeleted}
      />
    );
  }

  return (
    <>
      <style>{`

        .posts-search-input {
          width: 100%;
          padding: 9px 14px 9px 38px;
          border-radius: 10px;
          border: 1px solid ${borderColor};
          background: ${inputBg};
          font-size: .875rem;
          color: ${textPrimary};
          outline: none;
          transition: border .2s, box-shadow .2s;
        }
        .posts-search-input::placeholder { color: ${textSecondary}; }
        .posts-search-input:focus {
          border-color: ${steel};
          box-shadow: 0 0 0 3px rgba(143,183,204,0.15);
        }
        .posts-empty {
          text-align: center;
          padding: 3rem 0;
        }
        .posts-empty-icon {
          font-size: 2.5rem;
          margin-bottom: .5rem;
        }
        .posts-empty-text {
          font-size: .875rem;
          color: ${textSecondary};
        }
      `}</style>

      <main style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "1.5rem 1.5rem 4rem"
      }}>

        {/* Top bar: search + icons */}
        <header style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "1.75rem",
          flexWrap: "wrap"
        }}>
          {/* Search bar */}
          <div style={{ flex: 1, minWidth: "200px", maxWidth: "480px", position: "relative" }}>
            {/* Search icon */}
            <span style={{
              position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
              color: textSecondary, fontSize: ".9rem", pointerEvents: "none"
            }}><IconSearch /></span>
            <input
              type="text"
              className="posts-search-input"
              placeholder="Search posts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <HeaderIcons />
        </header>

        {/* Feed */}
        <section style={{
          maxWidth: "720px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem"
        }}>
          <PostComposer callBack={fetchPosts} />

          {loading && (
            <>
              <LoadingScreen />
              <LoadingScreen />
              <LoadingScreen />
            </>
          )}

          {!loading && filteredPosts.length === 0 && (
            <div className="posts-empty">
              <p className="posts-empty-text">
                {search ? `No posts matching "${search}"` : "No posts yet."}
              </p>
            </div>
          )}

          {!loading && filteredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onReaction={addReaction}
              onOpenComments={openComments}
              onDeletePost={deletePost}
              commentLimit={1}
              callBack={comment => addCommentToPost(post.id, comment)}
            />
          ))}
        </section>
      </main>
    </>
  );
}