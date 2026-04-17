import { useState, useEffect } from "react";
import { useThemeContext } from "../Theme/ThemeContext";
import CreateRoomModal from "./CreateRoomModal";
import {
  getAllRooms,
  joinRoom,
} from "../Services/studyWithFriendsService";

// ─── Color tokens ───
const C = {
  navy: "#2C3E50",
  ocean: "#3D718D",
  teal: "#658FA5",
  sky: "#8FB7CC",
};

const STATUS_STYLES = {
  active: {
    label: "Active",
    bg: `rgba(101,143,165,.12)`,
    color: C.teal,
    darkBg: `rgba(143,183,204,.15)`,
    darkColor: C.sky,
    dotBg: C.teal,
  },
  quiet: {
    label: "Quiet",
    bg: `rgba(61,113,141,.12)`,
    color: C.ocean,
    darkBg: `rgba(61,113,141,.18)`,
    darkColor: C.sky,
    dotBg: C.ocean,
  },
  focus: {
    label: "Focus Mode",
    bg: "rgba(44,62,80,.08)",
    color: C.navy,
    darkBg: "rgba(143,183,204,.08)",
    darkColor: C.sky,
    dotBg: C.navy,
  },
};

const AVATAR_GRADIENTS = [
  `linear-gradient(135deg, ${C.navy}, ${C.ocean})`,
  `linear-gradient(135deg, ${C.ocean}, ${C.teal})`,
  `linear-gradient(135deg, ${C.teal}, ${C.sky})`,
  `linear-gradient(135deg, ${C.sky}, #c8dde9)`,
];

// ─── Icons ───
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconGrid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);
const IconLogin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconRefresh = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

// ─── Toast ───
function Toast({ message, visible }) {
  return (
    <div style={{
      position: "fixed", bottom: "2rem", left: "50%",
      transform: `translateX(-50%) translateY(${visible ? 0 : "80px"})`,
      background: C.navy, color: "#fff",
      padding: "11px 22px", borderRadius: "14px",
      fontSize: ".85rem", fontWeight: 600,
      boxShadow: "0 8px 30px rgba(0,0,0,.2)",
      display: "flex", alignItems: "center", gap: "9px",
      opacity: visible ? 1 : 0,
      transition: "all .35s cubic-bezier(.34,1.56,.64,1)",
      pointerEvents: "none", zIndex: 9999, whiteSpace: "nowrap",
    }}>
      <IconCheck />
      <span>{message}</span>
    </div>
  );
}

// ─── Helpers لمعالجة بيانات الـ API ───

/**
 * حوّل بيانات الغرفة الجاية من الـ API لشكل تقدر تستخدمه في الكارت
 * عدّل الـ field names حسب الـ response الفعلي من الـ API لما يرجع
 */
function normalizeRoom(apiRoom) {
  const currentCount = apiRoom.currentParticipants ?? apiRoom.participantCount ?? apiRoom.members?.length ?? 0;
  const maxCount     = apiRoom.maxParticipants ?? apiRoom.capacity ?? 8;
  const fillPct      = maxCount > 0 ? Math.round((currentCount / maxCount) * 100) : 0;

  // استنتج الـ status من بيانات الغرفة
  let status = "quiet";
  if (apiRoom.status) {
    status = apiRoom.status.toLowerCase();
  } else if (apiRoom.isFocusMode) {
    status = "focus";
  } else if (currentCount > 0) {
    status = "active";
  }

  // اعمل avatars من أول حرف في أسماء الأعضاء لو موجودين
  const participants = apiRoom.members?.slice(0, 3).map(m =>
    (m.displayName || m.username || "?").slice(0, 2).toUpperCase()
  ) ?? [];
  if (currentCount > 3) participants.push(`+${currentCount - 3}`);

  return {
    id:           apiRoom.id,
    name:         apiRoom.name,
    subject:      apiRoom.subject ?? "General",
    desc:         apiRoom.description ?? "",
    isPublic:     apiRoom.isPublic ?? true,
    roomCode:     apiRoom.roomCode ?? null,
    status,
    current:      currentCount,
    max:          maxCount,
    fill:         fillPct,
    full:         currentCount >= maxCount,
    participants,
    timer:        apiRoom.activeSession?.durationMinutes
                    ? `${apiRoom.activeSession.durationMinutes} min`
                    : null,
  };
}

// ─── Room Card ───
function RoomCard({ room, isDarkMode, onJoin }) {
  const [hovered, setHovered]  = useState(false);
  const [joining, setJoining]  = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [codeInput, setCodeInput] = useState("");

  const st     = STATUS_STYLES[room.status] || STATUS_STYLES.quiet;
  const tColor = isDarkMode ? st.darkColor : st.color;
  const tBg    = isDarkMode ? st.darkBg    : st.bg;

  const cardBg     = isDarkMode ? "#1f1f1f" : "#ffffff";
  const cardBorder = hovered ? tColor + "80" : (isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(44,62,80,0.08)");
  const titleColor = isDarkMode ? "#f0f0f0" : "#1a1a2e";
  const mutedColor = isDarkMode ? "#9a9a9a" : "#686868";
  const surface2   = isDarkMode ? "#2a2a2a" : "#e8eaed";

  async function handleJoin(e) {
    e.stopPropagation();
    if (room.full || joining) return;

    // لو الغرفة private وما فيش كود مدخول، وضّح للمستخدم
    if (!room.isPublic && !codeInput) {
      setShowCode(true);
      return;
    }

    setJoining(true);
    try {
      await joinRoom(room.id, !room.isPublic ? codeInput : undefined);
      onJoin(room.name);
    } catch (err) {
      console.error("Join failed:", err);
      alert(`فشل الانضمام: ${err.message}`);
    } finally {
      setJoining(false);
      setShowCode(false);
      setCodeInput("");
    }
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: "14px",
        padding: "1.25rem",
        cursor: "default",
        transition: "all .25s",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? `0 10px 36px ${tColor}20` : "none",
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "3px",
        background: `linear-gradient(90deg, ${tColor}, ${tColor}66)`,
        opacity: hovered ? 1 : 0, transition: "opacity .2s"
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: ".65rem" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 9px",
          borderRadius: "999px", fontSize: ".68rem", fontWeight: 600,
          textTransform: "uppercase", letterSpacing: ".05em",
          background: tBg, color: tColor
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: tColor, display: "inline-block" }} />
          {st.label}
        </span>

        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {!room.isPublic && (
            <span style={{ fontSize: ".65rem", color: mutedColor }}><IconLock /></span>
          )}
          <span style={{
            fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: ".05em", color: isDarkMode ? "#8A9BAA" : "#4A5568",
          }}>
            {room.subject}
          </span>
        </span>
      </div>

      {/* Name */}
      <div style={{ fontWeight: 700, fontSize: ".95rem", color: titleColor, marginBottom: ".35rem", lineHeight: 1.3 }}>
        {room.name}
      </div>

      {/* Desc */}
      <div style={{
        fontSize: ".82rem", color: mutedColor, lineHeight: 1.55, marginBottom: ".9rem", flex: 1,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
      }}>
        {room.desc || "No description provided."}
      </div>

      {/* Participants + stats */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {room.participants.map((av, i) => (
            <div key={i} style={{
              width: 24, height: 24, borderRadius: "50%",
              border: `2px solid ${cardBg}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: ".55rem", fontWeight: 700, color: "#fff",
              marginLeft: i === 0 ? 0 : -8, flexShrink: 0,
              background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length],
              zIndex: room.participants.length - i,
            }}>
              {av}
            </div>
          ))}
          {room.participants.length === 0 && (
            <span style={{ fontSize: ".75rem", color: mutedColor }}>No members yet</span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: ".72rem", fontWeight: 600, color: titleColor }}>
            <IconUsers /> {room.current}/{room.max}
          </div>
          <div style={{ width: 50, height: 3, background: surface2, borderRadius: "999px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${room.fill}%`, background: tColor }} />
          </div>
        </div>
      </div>

      {/* Private room code input */}
      {showCode && !room.isPublic && (
        <input
          type="text"
          placeholder="Enter room code..."
          value={codeInput}
          onChange={e => setCodeInput(e.target.value)}
          style={{
            width: "100%", padding: "7px 10px", borderRadius: "8px", marginBottom: "8px",
            border: `1px solid ${tColor}55`, background: surface2,
            color: titleColor, fontFamily: "inherit", fontSize: ".8rem", outline: "none",
            boxSizing: "border-box",
          }}
          onKeyDown={e => e.key === "Enter" && handleJoin(e)}
        />
      )}

      {/* Join button */}
      <button
        onClick={handleJoin}
        disabled={room.full || joining}
        style={{
          width: "100%", padding: "8px", borderRadius: "10px", border: "none",
          background: room.full ? surface2 : (joining ? tColor : C.navy),
          color: room.full ? mutedColor : "#fff",
          fontFamily: "inherit", fontSize: ".8rem", fontWeight: 600,
          cursor: (room.full || joining) ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          transition: "all .2s",
        }}
      >
        {room.full
          ? <><IconLock /> Full</>
          : joining
            ? "Joining..."
            : showCode && !room.isPublic
              ? "Confirm Code"
              : <><IconLogin /> Join</>
        }
      </button>
    </div>
  );
}

// ─── Skeleton Loader ───
function SkeletonCard({ isDarkMode }) {
  const bg     = isDarkMode ? "#2a2a2a" : "#e8eaed";
  const cardBg = isDarkMode ? "#1f1f1f" : "#fff";
  return (
    <div style={{ background: cardBg, border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(44,62,80,0.08)"}`, borderRadius: 14, padding: "1.25rem" }}>
      {[80, 55, 100, 40].map((w, i) => (
        <div key={i} style={{ height: i === 0 ? 14 : i === 2 ? 50 : 12, width: `${w}%`, background: bg, borderRadius: 6, marginBottom: i === 3 ? 0 : 12, animation: "pulse 1.5s ease-in-out infinite" }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  );
}

// ─── Main Component ───
export default function StudyRooms() {
  const { isDarkMode } = useThemeContext();

  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [filter,  setFilter]  = useState("all");
  const [search,  setSearch]  = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, msg: "" });

  const bg      = isDarkMode ? "#171717" : "#F3F4F6";
  const surface = isDarkMode ? "#1e1e1e" : "#ffffff";
  const border  = isDarkMode ? "rgba(255,255,255,0.07)" : "rgba(44,62,80,0.08)";
  const text    = isDarkMode ? "#EDF2F7" : "#1C2B38";
  const text2   = isDarkMode ? "#A0AEC0" : "#4A5568";
  const muted   = isDarkMode ? "#8A9BAA" : "#8A9BAA";

  // ── Fetch rooms from API ──────────────────────────────────────────────────
  async function fetchRooms() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllRooms();
      // data ممكن يكون array أو { rooms: [] } حسب الـ API — عدّل لو احتجت
      const list = Array.isArray(data) ? data : data?.rooms ?? [];
      setRooms(list.map(normalizeRoom));
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchRooms(); }, []);

  // ── Toast ────────────────────────────────────────────────────────────────
  function showToast(msg) {
    setToast({ visible: true, msg });
    setTimeout(() => setToast({ visible: false, msg }), 3200);
  }

  function handleJoin(name)    { showToast(`Joined "${name}" successfully`); fetchRooms(); }
  function handleCreated(name) { showToast(`Room "${name}" created!`);       fetchRooms(); }

  // ── Filter logic ──────────────────────────────────────────────────────────
  const FILTERS = [
    { key: "all",    label: "All Rooms"  },
    { key: "active", label: "Active"     },
    { key: "quiet",  label: "Quiet"      },
    { key: "focus",  label: "Focus Mode" },
  ];

  const filtered = rooms.filter(r => {
    const matchStatus = filter === "all" || r.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || r.name.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: bg, minHeight: "100vh" }}>
      <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "2.5rem 2rem 6rem" }}>

        {/* ── HERO ── */}
        <div style={{
          background: `linear-gradient(135deg, ${C.navy} 0%, ${C.ocean} 60%, ${C.teal} 100%)`,
          borderRadius: "26px", padding: "2.5rem 3rem", marginBottom: "2rem",
          position: "relative", overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2rem",
        }}>
          <div style={{ position: "absolute", top: -80, right: 120, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(143,183,204,.2) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, right: -40, width: 220, height: 220, borderRadius: "50%", border: "40px solid rgba(255,255,255,.05)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -30, left: "25%", width: 180, height: 180, borderRadius: "50%", border: "32px solid rgba(143,183,204,.08)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: ".68rem", fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(255,255,255,.55)", marginBottom: ".6rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: 18, height: 2, background: "rgba(255,255,255,.4)", borderRadius: 2, display: "inline-block" }} />
              Study Station
            </div>
            <h1 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 800, letterSpacing: "-.03em", color: "#fff", lineHeight: 1.1, marginBottom: ".65rem" }}>
              Study With Friends
            </h1>
            <p style={{ fontSize: ".9rem", color: "rgba(255,255,255,.6)", lineHeight: 1.6, maxWidth: "420px" }}>
              Join a virtual study room or create your own — study smarter, together.
            </p>
            <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", gap: ".85rem" }}>
              {[
                { icon: <IconUsers />, label: `${rooms.reduce((a, r) => a + r.current, 0)} students online` },
                { icon: <IconGrid />,  label: `${rooms.length} active rooms` },
              ].map((chip, i) => (
                <span key={i} style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  padding: "5px 13px", borderRadius: "999px",
                  background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.15)",
                  fontSize: ".75rem", fontWeight: 500, color: "rgba(255,255,255,.85)",
                }}>
                  {chip.icon}{chip.label}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            style={{
              position: "relative", zIndex: 1,
              display: "inline-flex", alignItems: "center", gap: "9px",
              padding: "12px 22px", borderRadius: "14px",
              background: "#fff", color: C.ocean,
              fontFamily: "inherit", fontSize: ".9rem", fontWeight: 700,
              border: "none", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(0,0,0,.2)",
              transition: "transform .2s, box-shadow .2s",
              whiteSpace: "nowrap", letterSpacing: "-.01em", flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.25)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "";                 e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.2)";   }}
          >
            <IconPlus /> Create Room
          </button>
        </div>

        {/* ── FILTER BAR ── */}
        <div style={{ display: "flex", alignItems: "center", gap: ".75rem", flexWrap: "wrap", marginBottom: "1.75rem" }}>
          <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: muted, pointerEvents: "none" }}>
              <IconSearch />
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search rooms or subjects…"
              style={{
                width: "100%", padding: "9px 13px 9px 38px",
                background: surface, border: `1px solid ${border}`,
                borderRadius: "14px", fontFamily: "inherit", fontSize: ".875rem",
                color: text, outline: "none",
                boxShadow: "0 1px 3px rgba(44,62,80,0.06), 0 3px 10px rgba(44,62,80,0.06)",
                transition: "border .2s, box-shadow .2s",
              }}
              onFocus={e => { e.currentTarget.style.borderColor = C.sky; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(143,183,204,.18)`; }}
              onBlur={e  => { e.currentTarget.style.borderColor = border; e.currentTarget.style.boxShadow = "0 1px 3px rgba(44,62,80,0.06), 0 3px 10px rgba(44,62,80,0.06)"; }}
            />
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
            {FILTERS.map(f => {
              const active = filter === f.key;
              return (
                <button key={f.key} onClick={() => setFilter(f.key)} style={{
                  padding: "7px 15px", borderRadius: "999px", fontSize: ".78rem", fontWeight: 600,
                  cursor: "pointer",
                  border: `1px solid ${active ? (isDarkMode ? C.ocean : C.navy) : border}`,
                  background: active ? (isDarkMode ? C.ocean : C.navy) : surface,
                  color: active ? "#fff" : text2,
                  fontFamily: "inherit", transition: "all .2s", whiteSpace: "nowrap",
                  boxShadow: "0 1px 3px rgba(44,62,80,0.06), 0 3px 10px rgba(44,62,80,0.06)",
                }}>
                  {f.label}
                </button>
              );
            })}

            {/* Refresh button */}
            <button
              onClick={fetchRooms}
              title="Refresh rooms"
              style={{
                padding: "7px 12px", borderRadius: "999px", fontSize: ".78rem", fontWeight: 600,
                cursor: "pointer", border: `1px solid ${border}`,
                background: surface, color: text2, fontFamily: "inherit",
                transition: "all .2s", display: "flex", alignItems: "center", gap: 5,
                boxShadow: "0 1px 3px rgba(44,62,80,0.06), 0 3px 10px rgba(44,62,80,0.06)",
              }}
            >
              <IconRefresh /> Refresh
            </button>
          </div>
        </div>

        {/* ── CONTENT AREA ── */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} isDarkMode={isDarkMode} />)}
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "5rem 2rem", color: muted }}>
            <p style={{ fontWeight: 700, fontSize: "1rem", marginBottom: ".5rem", color: "#e53e3e" }}>Failed to load rooms</p>
            <p style={{ fontSize: ".85rem", marginBottom: "1rem" }}>{error}</p>
            <button onClick={fetchRooms} style={{
              padding: "8px 20px", borderRadius: "10px", border: "none",
              background: C.navy, color: "#fff", fontFamily: "inherit",
              fontSize: ".85rem", fontWeight: 600, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              <IconRefresh /> Try Again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 2rem", color: muted }}>
            <p style={{ fontWeight: 600, fontSize: "1rem", marginBottom: ".4rem" }}>No rooms found</p>
            <p style={{ fontSize: ".85rem" }}>Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
            {filtered.map(room => (
              <RoomCard key={room.id} room={room} isDarkMode={isDarkMode} onJoin={handleJoin} />
            ))}
          </div>
        )}
      </div>

      <CreateRoomModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
        isDarkMode={isDarkMode}
      />

      <Toast message={toast.msg} visible={toast.visible} />
    </div>
  );
}