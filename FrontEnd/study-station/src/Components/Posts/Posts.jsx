import React, { useEffect, useState, useContext, useRef } from "react";
import PostComments from "./PostComments";
import PostCard from "./PostCard";
import PostComposer from "./PostComposer";
import LoadingScreen from "./LoadingScreen";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useThemeContext } from "../Theme/ThemeContext";
import HeaderIcons from "../Header/Headericons";
import SearchBar from "../Header/SearchBar";
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

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState("posts");
  const [selectedPost, setSelectedPost] = useState(null);

  const deletedCommentIds = useRef(new Set());

  const { isDarkMode } = useThemeContext();
  const { userData } = useContext(AuthContext);

  const textSecondary = isDarkMode ? "#B0B0B0" : "#6b6f76";

  // ✅ currentUserId من الـ token مش من userData عشان يتطابق مع الـ backend
  const currentUserId = getCurrentUserId();

  function normalizePosts(data) {
    return data.map(post => ({
      ...post,
      reactions: (post.reactions || []).map(r => ({
        ...r,
        // ✅ بنقارن بـ currentUserId من الـ token مش userData._id
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

      // ✅ لو كنا في view الكومنتات، نحدث الـ selectedPost كمان
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

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const q = search.toLowerCase();
    return (
      post.title?.toLowerCase().includes(q) ||
      post.content?.toLowerCase().includes(q)
    );
  });

  async function addReaction(postId, reactionType) {
    // ✅ optimistic update فوري قبل الـ API call
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id !== postId) return p;
        const myExistingReaction = (p.reactions || []).find(r => r.isMyReaction === true);
        if (myExistingReaction?.type === reactionType) {
          // نفس الـ reaction → شيله (toggle)
          return { ...p, reactions: p.reactions.filter(r => !r.isMyReaction) };
        } else if (myExistingReaction) {
          // reaction مختلف → بدّله
          return {
            ...p,
            reactions: [
              ...p.reactions.filter(r => !r.isMyReaction),
              { type: reactionType, isMyReaction: true, userId: currentUserId },
            ],
          };
        } else {
          // مفيش reaction → ضيف
          return { ...p, reactions: [...p.reactions, { type: reactionType, isMyReaction: true, userId: currentUserId }] };
        }
      })
    );

    // ✅ لو كنا بنبص على الـ selectedPost، حدثه كمان
    setSelectedPost(prev => {
      if (!prev || prev.id !== postId) return prev;
      const myExistingReaction = (prev.reactions || []).find(r => r.isMyReaction === true);
      if (myExistingReaction?.type === reactionType) {
        return { ...prev, reactions: prev.reactions.filter(r => !r.isMyReaction) };
      } else if (myExistingReaction) {
        return {
          ...prev,
          reactions: [
            ...prev.reactions.filter(r => !r.isMyReaction),
            { type: reactionType, isMyReaction: true, userId: currentUserId },
          ],
        };
      } else {
        return { ...prev, reactions: [...prev.reactions, { type: reactionType, isMyReaction: true, userId: currentUserId }] };
      }
    });

    axiosInstance.post(`Posts/${postId}/reactions`, { type: reactionType }).catch(() => {
      toast.error("Failed to update reaction");
      fetchPosts(); // rollback
    });
  }

  function addCommentToPost(postId, comment) {
    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id !== postId) return p;
        return { ...p, comments: [...(p.comments || []), comment] };
      })
    );
    // ✅ حدّث الـ selectedPost لو كان مفتوح
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
    <main className="max-w-[1200px] font-sans mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
      <header className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
        <SearchBar search={search} setSearch={setSearch} />
        <HeaderIcons />
      </header>

      <section className="space-y-4 sm:space-y-6 max-w-full sm:max-w-2xl md:max-w-3xl mx-auto pt-4 sm:pt-5 md:pt-[20px] px-2 sm:px-0">
        <PostComposer callBack={fetchPosts} />

        {loading && (
          <>
            <LoadingScreen />
            <LoadingScreen />
            <LoadingScreen />
          </>
        )}

        {!loading && filteredPosts.length === 0 && (
          <div className="text-center text-xs sm:text-sm" style={{ color: textSecondary }}>
            No posts found.
          </div>
        )}

        {!loading &&
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onReaction={addReaction}
              onOpenComments={openComments}
              onDeletePost={deletePost}
              commentLimit={1}
              callBack={(comment) => addCommentToPost(post.id, comment)}
            />
          ))}
      </section>
    </main>
  );
}