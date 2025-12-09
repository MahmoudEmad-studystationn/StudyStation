import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faUser,
  faSearch,
  faThumbsUp,
  faComment,
} from "@fortawesome/free-solid-svg-icons";
import DarkModeToggle from "../Theme/DarkModeToggle";
import { useThemeContext } from "../Theme/ThemeContext";

const API_URL = "https://study-station.runasp.net/api/Posts";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { isDarkMode } = useThemeContext();

  const bgColor = isDarkMode ? "#171717" : "#f3f4f6";
  const cardBg = isDarkMode ? "#2A2A2A" : "white";
  const textPrimary = isDarkMode ? "#E0E0E0" : "#2f3b48";
  const textSecondary = isDarkMode ? "#B0B0B0" : "#6b6f76";
  const borderColor = isDarkMode ? "#404040" : "#d1d5db";
  const inputBg = isDarkMode ? "#363636" : "white";
  const buttonPrimary = "#7daebd";
  const buttonPrimaryHover = "#6a9ab3";
  const buttonSecondary = isDarkMode ? "#363636" : "#e4e6eb";
  const buttonSecondaryHover = isDarkMode ? "#404040" : "#d8dadf";
  const placeholderBg = isDarkMode ? "#363636" : "#e4e6eb";

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch posts");

      const data = await res.json();
      setPosts(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearch = () => {
    // Client-side search only
  };

  const filteredPosts = posts.filter((post) => {
    const q = search.toLowerCase();
    return (
      post.title?.toLowerCase().includes(q) ||
      post.content?.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="min-h-screen font-sans transition-colors duration-300"
      style={{ backgroundColor: bgColor }}
    >
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
          {/* Search area */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-full sm:max-w-xl">
            <div
              className="flex items-center rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm w-full max-w-full sm:max-w-xs transition-colors duration-300"
              style={{
                backgroundColor: inputBg,
              }}
            >
              <input
                type="text"
                placeholder="Search"
                className="flex-1 bg-transparent outline-none text-xs sm:text-sm"
                style={{ color: textPrimary }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="text-xs sm:text-sm"
                style={{ color: textSecondary }}
              />
            </div>
            <button
              className="text-white text-xs sm:text-sm font-medium px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg shadow-sm transition-colors whitespace-nowrap"
              style={{ backgroundColor: buttonPrimary }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = buttonPrimaryHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = buttonPrimary)
              }
              onClick={handleSearch}
            >
              Search
            </button>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <DarkModeToggle />
            <button
              className="rounded-xl p-2 sm:p-2.5 min-w-[36px] sm:min-w-[40px] min-h-[36px] sm:min-h-[40px] flex items-center justify-center shadow-lg cursor-pointer text-xs sm:text-sm transition-all duration-300"
              style={{
                backgroundColor: cardBg,
                color: textPrimary,
                borderColor: borderColor,
                boxShadow: isDarkMode
                  ? "0 10px 16px rgba(0,0,0,0.3)"
                  : "0 10px 16px rgba(0,0,0,0.08)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = isDarkMode
                  ? "#404040"
                  : "#f5f6f7")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = cardBg)
              }
            >
              <FontAwesomeIcon icon={faBell} className="text-xs sm:text-sm" />
            </button>
            <button
              className="rounded-xl p-2 sm:p-2.5 min-w-[36px] sm:min-w-[40px] min-h-[36px] sm:min-h-[40px] flex items-center justify-center shadow-lg cursor-pointer text-xs sm:text-sm transition-all duration-300"
              style={{
                backgroundColor: cardBg,
                color: textPrimary,
                borderColor: borderColor,
                boxShadow: isDarkMode
                  ? "0 10px 16px rgba(0,0,0,0.3)"
                  : "0 10px 16px rgba(0,0,0,0.08)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = isDarkMode
                  ? "#404040"
                  : "#f5f6f7")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = cardBg)
              }
            >
              <FontAwesomeIcon icon={faUser} className="text-xs sm:text-sm" />
            </button>
          </div>
        </header>

        {/* Content section */}
        <section className="space-y-4 sm:space-y-6 max-w-full sm:max-w-2xl md:max-w-3xl mx-auto pt-4 sm:pt-5 md:pt-[20px] px-2 sm:px-0">
          {/* Composer card */}
          <div
            className="rounded-lg shadow-sm p-4 sm:p-5 md:p-6 transition-colors duration-300"
            style={{
              backgroundColor: cardBg,
            }}
          >
            <div
              className="text-xs sm:text-sm mb-4 sm:mb-5 md:mb-6 font-medium"
              style={{ color: textSecondary }}
            >
              Got a study hack? Or wanna hang in a study room?
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  className="rounded text-xs font-medium px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 transition-colors"
                  style={{
                    backgroundColor: buttonSecondary,
                    color: textPrimary,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      buttonSecondaryHover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = buttonSecondary)
                  }
                >
                  Photo
                </button>
                <button
                  className="rounded text-xs font-medium px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 transition-colors"
                  style={{
                    backgroundColor: buttonSecondary,
                    color: textPrimary,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      buttonSecondaryHover)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = buttonSecondary)
                  }
                >
                  Shared Room
                </button>
              </div>
              <button
                className="text-white text-xs sm:text-sm font-medium px-6 sm:px-7 md:px-8 py-1.5 sm:py-2 rounded-lg shadow-sm transition-colors"
                style={{ backgroundColor: buttonPrimary }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = buttonPrimaryHover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = buttonPrimary)
                }
              >
                Share
              </button>
            </div>
          </div>

          {/* Loading / Error */}
          {loading && (
            <div
              className="text-center text-xs sm:text-sm"
              style={{ color: textSecondary }}
            >
              Loading posts...
            </div>
          )}

          {error && (
            <div className="text-center text-xs sm:text-sm text-red-500">
              {error}
            </div>
          )}

          {/* No posts */}
          {!loading && !error && filteredPosts.length === 0 && (
            <div
              className="text-center text-xs sm:text-sm"
              style={{ color: textSecondary }}
            >
              No posts found.
            </div>
          )}

          {/* Posts list */}
          {!loading &&
            !error &&
            filteredPosts.map((post) => {
              const authorName = post.author
                ? `${post.author.firstName} ${post.author.lastName}`
                : "Unknown Author";

              const commentsCount = post.comments?.length || 0;

              return (
                <div
                  key={post.id}
                  className="rounded-lg shadow-sm p-4 sm:p-5 md:p-6 transition-colors duration-300"
                  style={{
                    backgroundColor: cardBg,
                  }}
                >
                  <header className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div
                      className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: placeholderBg }}
                    >
                      <FontAwesomeIcon
                        icon={faUser}
                        className="text-base sm:text-lg md:text-xl"
                        style={{ color: textSecondary }}
                      />
                    </div>
                    <div>
                      <div
                        className="text-xs sm:text-sm font-bold"
                        style={{ color: textPrimary }}
                      >
                        {authorName}
                      </div>
                      <div
                        className="text-[10px] sm:text-xs font-medium"
                        style={{ color: textSecondary }}
                      >
                        {post.title}
                      </div>
                      <div
                        className="text-[9px] sm:text-[10px]"
                        style={{ color: textSecondary }}
                      >
                        {post.createdAt &&
                          new Date(post.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </header>

                  <div className="space-y-3 sm:space-y-4 mb-3 sm:mb-4">
                    <div
                      className="w-full h-40 sm:h-44 md:h-48 rounded"
                      style={{ backgroundColor: placeholderBg }}
                    />

                    {post.content && (
                      <p
                        className="text-xs sm:text-sm"
                        style={{ color: textPrimary }}
                      >
                        {post.content}
                      </p>
                    )}
                  </div>

                  <footer className="flex items-center gap-4 sm:gap-5 md:gap-6 pt-2">
                    <button
                      className="flex items-center gap-1.5 sm:gap-2 transition-colors"
                      style={{ color: textSecondary }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = textPrimary)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = textSecondary)
                      }
                    >
                      <FontAwesomeIcon
                        icon={faThumbsUp}
                        className="text-xs sm:text-sm"
                      />
                      <span className="text-[10px] sm:text-xs font-medium">
                        Like
                      </span>
                    </button>
                    <button
                      className="flex items-center gap-1.5 sm:gap-2 transition-colors"
                      style={{ color: textSecondary }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = textPrimary)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = textSecondary)
                      }
                    >
                      <FontAwesomeIcon
                        icon={faComment}
                        className="text-xs sm:text-sm"
                      />
                      <span className="text-[10px] sm:text-xs font-medium">
                        Comment ({commentsCount})
                      </span>
                    </button>
                  </footer>
                </div>
              );
            })}
        </section>
      </main>
    </div>
  );
}