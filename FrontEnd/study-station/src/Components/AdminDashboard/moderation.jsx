import { useState, useEffect } from "react";
import { useThemeContext } from "../Theme/ThemeContext";

const tokens = {
  light: {
    "--navy":        "#2C3E50",
    "--ocean":       "#3D718D",
    "--teal":        "#658FA5",
    "--sky":         "#8FB7CC",
    "--bg":          "#F3F4F6",
    "--surface":     "#ffffff",
    "--surface2":    "#EAECF0",
    "--surface3":    "#f5f6f8",
    "--text":        "#1C2B38",
    "--text2":       "#4A5568",
    "--muted":       "#8A9BAA",
    "--border":      "rgba(44,62,80,0.08)",
    "--border2":     "rgba(44,62,80,0.05)",
    "--sh-sm":       "0 1px 3px rgba(44,62,80,0.06), 0 3px 10px rgba(44,62,80,0.06)",
    "--sh-md":       "0 2px 6px rgba(44,62,80,0.05), 0 8px 24px rgba(44,62,80,0.08)",
  },
  dark: {
    "--navy":        "#2C3E50",
    "--ocean":       "#3D718D",
    "--teal":        "#658FA5",
    "--sky":         "#8FB7CC",
    "--bg":          "#111820",
    "--surface":     "#1a2330",
    "--surface2":    "#1f2d3d",
    "--surface3":    "#162030",
    "--text":        "#e8edf2",
    "--text2":       "#9eb4c4",
    "--muted":       "#5a7a8e",
    "--border":      "rgba(143,183,204,0.1)",
    "--border2":     "rgba(143,183,204,0.06)",
    "--sh-sm":       "0 1px 3px rgba(0,0,0,0.3), 0 3px 10px rgba(0,0,0,0.2)",
    "--sh-md":       "0 2px 6px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.3)",
  },
};

const BASE_URL = "https://study-station.runasp.net/api";

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ width: 12, height: 12, display: "inline", marginRight: 3 }}>
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
  </svg>
);

const IconShield = ({ size = 40 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    width={size} height={size}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const IconLoader = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    width={20} height={20} style={{ animation: "spin 1s linear infinite" }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

// ── helper: map API response → table rows ────────────────────────────────────
// ⚠️ عدّل الـ field names دي بعد ما تشوف الـ actual API response
function mapApiData(data) {
  // لو الـ API بيرجع flaggedPosts و flaggedRooms منفصلين
  const posts = (data.flaggedPosts || data.reportedPosts || []).map((p) => ({
    id:      p.id || p.postId,
    preview: p.content || p.text || p.preview || "No content",
    user:    p.userName || p.username || p.reportedBy || "unknown",
    type:    "Post",
    time:    p.reportedAt || p.createdAt || p.time || "—",
  }));

  const rooms = (data.flaggedRooms || data.reportedRooms || []).map((r) => ({
    id:      r.id || r.roomId,
    preview: r.name || r.description || r.preview || "No content",
    user:    r.createdBy || r.userName || r.reportedBy || "auto_flag",
    type:    "Room",
    time:    r.reportedAt || r.createdAt || r.time || "—",
  }));

  // أو لو بيرجع array واحدة اسمها items/flaggedContent
  const unified = (data.items || data.flaggedContent || data.reports || []).map((x) => ({
    id:      x.id,
    preview: x.content || x.text || x.name || x.preview || "No content",
    user:    x.userName || x.username || x.reportedBy || "unknown",
    type:    x.type === "room" || x.type === "Room" ? "Room" : "Post",
    time:    x.reportedAt || x.createdAt || x.time || "—",
  }));

  return [...posts, ...rooms, ...unified];
}

export default function ModerationPage() {
  const { isDarkMode: dark } = useThemeContext();
  const t = tokens[dark ? "dark" : "light"];

  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [fadingId,  setFadingId]  = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // ── fetch flagged content ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");

        const res = await fetch(`${BASE_URL}/Admin/dashboard`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const data = await res.json();

        // ⚠️ لو الـ API بيرجع الـ data مباشرة في data نفسها، أو جوا data.data
        const payload = data.data ?? data;
        setItems(mapApiData(payload));
      } catch (err) {
        setError(err.message || "Failed to load moderation data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ── delete item ───────────────────────────────────────────────────────────
  const handleDelete = async (id, type) => {
    setDeletingId(id);
    try {
      const token = localStorage.getItem("token");

      // ⚠️ عدّل الـ endpoint ده حسب الـ API docs بتاعتك
      const endpoint =
        type === "Room"
          ? `${BASE_URL}/Admin/rooms/${id}`
          : `${BASE_URL}/Admin/posts/${id}`;

      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);

      // fade out then remove
      setFadingId(id);
      setTimeout(() => {
        setItems((prev) => prev.filter((m) => m.id !== id));
        setFadingId(null);
      }, 250);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // ── format time ───────────────────────────────────────────────────────────
  const formatTime = (raw) => {
    if (!raw) return "—";
    const d = new Date(raw);
    if (isNaN(d)) return raw; // لو مش date خليها زي ما هي
    const diff = Date.now() - d.getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins  < 1)  return "Just now";
    if (mins  < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .mod-table-wrap { overflow-x: auto; }

        .mod-table { width: 100%; border-collapse: collapse; font-size: .82rem; font-family: 'Plus Jakarta Sans', sans-serif; }
        .mod-table thead tr { background: ${t["--surface3"]}; border-bottom: 1px solid ${t["--border"]}; }
        .mod-table th { padding: .75rem 1rem; text-align: left; font-size: .68rem; font-weight: 700; color: ${t["--muted"]}; text-transform: uppercase; letter-spacing: .06em; white-space: nowrap; }
        .mod-table tbody tr { border-bottom: 1px solid ${t["--border2"]}; transition: background .15s, opacity .25s; }
        .mod-table tbody tr:last-child { border-bottom: none; }
        .mod-table tbody tr:hover { background: ${t["--surface3"]}; }
        .mod-table td { padding: .85rem 1rem; color: ${t["--text2"]}; vertical-align: middle; }

        .mod-content-preview { max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: ${t["--text2"]}; }

        .mod-type-chip { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 999px; font-size: .68rem; font-weight: 700; }
        .mod-type-post { background: rgba(61,113,141,.12); color: ${dark ? "#8FB7CC" : "#3D718D"}; }
        .mod-type-room { background: rgba(101,143,165,.12); color: ${dark ? "#9dc4d4" : "#658FA5"}; }

        .mod-btn-danger { padding: 5px 11px; border-radius: 8px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: .72rem; font-weight: 700; cursor: pointer; border: 1px solid rgba(248,113,113,.2); background: rgba(248,113,113,.1); color: #dc2626; transition: all .2s; white-space: nowrap; display: inline-flex; align-items: center; }
        .mod-btn-danger:hover:not(:disabled) { background: rgba(248,113,113,.2); }
        .mod-btn-danger:disabled { opacity: .5; cursor: not-allowed; }

        .mod-row-fade { opacity: 0 !important; }

        .mod-empty { text-align: center; padding: 3rem 1rem; color: ${t["--muted"]}; }
        .mod-empty p { font-size: .85rem; font-weight: 600; margin-top: .75rem; }

        .mod-state-box { display: flex; align-items: center; justify-content: center; gap: .5rem; padding: 3rem 1rem; color: ${t["--muted"]}; font-size: .85rem; font-weight: 600; }
        .mod-error { color: #dc2626; }
      `}</style>

      <div style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        WebkitFontSmoothing: "antialiased",
        color: t["--text"],
      }}>
        {/* Page Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: t["--text"], letterSpacing: "-.03em" }}>
            Moderation
          </div>
          <div style={{ fontSize: ".8rem", color: t["--muted"], fontWeight: 500, marginTop: 3 }}>
            Review and remove flagged content.
          </div>
        </div>

        {/* Table Card */}
        <div style={{
          background: t["--surface"],
          border: `1px solid ${t["--border"]}`,
          borderRadius: 14,
          boxShadow: t["--sh-sm"],
          overflow: "hidden",
        }}>
          {/* Loading State */}
          {loading && (
            <div className="mod-state-box">
              <IconLoader />
              Loading flagged content…
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="mod-state-box mod-error">
              ⚠️ {error}
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <div className="mod-table-wrap">
              <table className="mod-table">
                <thead>
                  <tr>
                    <th>Content Preview</th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Reported</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="mod-empty">
                          <IconShield />
                          <p>No flagged content — all clear!</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr
                        key={item.id}
                        className={fadingId === item.id ? "mod-row-fade" : ""}
                      >
                        <td>
                          <div className="mod-content-preview">{item.preview}</div>
                        </td>

                        <td style={{ fontWeight: 700, color: t["--text"], fontSize: ".82rem", whiteSpace: "nowrap" }}>
                          @{item.user}
                        </td>

                        <td>
                          <span className={`mod-type-chip ${item.type === "Post" ? "mod-type-post" : "mod-type-room"}`}>
                            {item.type}
                          </span>
                        </td>

                        <td style={{ color: t["--muted"], fontSize: ".75rem", whiteSpace: "nowrap" }}>
                          {formatTime(item.time)}
                        </td>

                        <td>
                          <button
                            className="mod-btn-danger"
                            disabled={deletingId === item.id}
                            onClick={() => handleDelete(item.id, item.type)}
                          >
                            <IconTrash />
                            {deletingId === item.id ? "Deleting…" : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}