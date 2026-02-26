import React, { useEffect, useState, useContext } from "react";
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

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState("posts");
  const [selectedPostId, setSelectedPostId] = useState(null);

  const { isDarkMode } = useThemeContext();
  const { userData } = useContext(AuthContext);

  const bgColor = isDarkMode ? "#171717" : "#f3f4f6";
  const textSecondary = isDarkMode ? "#B0B0B0" : "#6b6f76";

  async function fetchPosts() {
    try {
        setLoading(true);
        const { data } = await axiosInstance.get("Posts");
        const normalizedPosts = data.map(post => ({
            ...post,
            reactions: (post.reactions || []).map(r => ({
                ...r,
                isMyReaction: r.userId?.toString() === userData?._id?.toString()
            }))
        }));
        setPosts(normalizedPosts);
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
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id !== postId) return p;
        const myExistingReaction = (p.reactions || []).find(r => r.isMyReaction === true);
        if (myExistingReaction?.type === reactionType) {
          return {
            ...p,
            reactions: p.reactions.filter(r => r.isMyReaction !== true),
          };
        } else if (myExistingReaction) {
          return {
            ...p,
            reactions: [
              ...p.reactions.filter(r => r.isMyReaction !== true),
              { type: reactionType, isMyReaction: true },
            ],
          };
        } else {
          return {
            ...p,
            reactions: [...p.reactions, { type: reactionType, isMyReaction: true }],
          };
        }
      })
    );
    axiosInstance.post(`Posts/${postId}/reactions`, { type: reactionType }).catch(() => {
      toast.error("Failed to update reaction");
      fetchPosts();
    });
  }

  function addCommentToPost(postId, comment) {
    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: [...(p.comments || []), comment],
        };
      })
    );
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
    setSelectedPostId(postId);
    setCurrentView("comments");
  }

  function goBackToPosts() {
    setCurrentView("posts");
    setSelectedPostId(null);
    fetchPosts();
  }

  if (currentView === "comments") {
    return <PostComments postId={selectedPostId} onBack={goBackToPosts} />;
  }

  return (
    // <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: bgColor }}>
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
          <div
            className="text-center text-xs sm:text-sm"
            style={{ color: textSecondary }}
          >
            No posts found.
          </div>
        )}

        {!loading &&
          filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onReaction={addReaction}
              onOpenComments={openComments}
              onDeletePost={deletePost}
              commentLimit={1}
              callBack={(comment) => addCommentToPost(post.id, comment)} // ← غيّر دي
            />
          ))}
      </section>
    </main>
    // </div>
  );
}