import React, { useEffect, useState, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import PostComments from "./PostComments";
import PostCard from "./PostCard";
import PostComposer from "./PostComposer";
import LoadingScreen from "./LoadingScreen";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useThemeContext } from "../Theme/ThemeContext";
import HeaderIcons from "../Header/Headericons";
import SearchBar from "../Header/SearchBar";

const API_URL = "https://study-station.runasp.net/api/Posts";

const getAuthToken = () => {
  return localStorage.getItem("accessToken") || "";
};

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState("posts");
  const [selectedPostId, setSelectedPostId] = useState(null);

  const { isDarkMode } = useThemeContext();
  const { userData } = useContext(AuthContext);

  const bgColor = isDarkMode ? "#171717" : "#f3f4f6";
  const textPrimary = isDarkMode ? "#E0E0E0" : "#2f3b48";
  const textSecondary = isDarkMode ? "#B0B0B0" : "#6b6f76";
  const inputBg = isDarkMode ? "#363636" : "white";
  const buttonPrimary = "#7daebd";
  const buttonPrimaryHover = "#6a9ab3";

  async function fetchPosts() {
    try {
      setLoading(true);

      const token = getAuthToken();
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(API_URL, {
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error("Failed to fetch posts");

      const data = await res.json();
      setPosts(data);
    } catch (err) {
      if (err.name === "AbortError") {
        toast.error("Connection timeout. Please check your internet connection.");
      } else {
        toast.error(err.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  function handleSearch() { }

  const filteredPosts = posts.filter((post) => {
    const q = search.toLowerCase();
    return (
      post.title?.toLowerCase().includes(q) ||
      post.content?.toLowerCase().includes(q)
    );
  });

  async function addReaction(postId, reactionType) {
    const token = getAuthToken();
    if (!token) {
      toast.error("Please login first to add reactions");
      return;
    }

    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id === postId) {
          const hasMyReaction = (p.reactions || []).some(
            (r) => r.userId?.toString() === userData?._id?.toString()
          );

          if (hasMyReaction) {
            return {
              ...p,
              reactions: (p.reactions || []).filter(
                (r) => r.userId?.toString() !== userData?._id?.toString()
              ),
            };
          } else {
            return {
              ...p,
              reactions: [
                ...(p.reactions || []),
                { type: reactionType, userId: userData?._id },
              ],
            };
          }
        }
        return p;
      })
    );

    fetch(`${API_URL}/${postId}/reactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type: reactionType }),
    }).catch(() => { });
  }

  async function deletePost(postId) {
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_URL}/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
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
    <div
      className="min-h-screen font-sans transition-colors duration-300"
      style={{ backgroundColor: bgColor }}
    >
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
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
                callBack={fetchPosts}
              />
            ))}
        </section>
      </main>
    </div>
  );
}