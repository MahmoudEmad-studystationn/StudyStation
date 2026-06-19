import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useThemeContext } from "../Theme/ThemeContext";
import CreateRoomModal from "./CreateRoomModal";
import { getAllRooms, getRoomById, joinRoom, deleteRoom, normalizeRoom, getMessages, normalizeMessage } from "../Services/studyWithFriendsService";

const C = { navy: "#2C3E50", ocean: "#3D718D", teal: "#658FA5", sky: "#8FB7CC" };

const AVATAR_GRADIENTS = [
  `linear-gradient(135deg,${C.navy},${C.ocean})`,
  `linear-gradient(135deg,${C.ocean},${C.teal})`,
  `linear-gradient(135deg,${C.teal},${C.sky})`,
  `linear-gradient(135deg,${C.sky},#c8dde9)`,
];

const IconPlus = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const IconSearch = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const IconGrid = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
const IconLogin = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>;
const IconLock = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
const IconCheck = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><polyline points="20 6 9 17 4 12" /></svg>;
const IconRefresh = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>;
const IconTrash = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>;

function Toast({ message, visible, type = "success" }) {
  const bg = type === "error" ? "#e53e3e" : C.navy;
  return (
    <div style={{ position: "fixed", bottom: "2rem", left: "50%", transform: `translateX(-50%) translateY(${visible ? 0 : "80px"})`, background: bg, color: "#fff", padding: "11px 22px", borderRadius: "14px", fontSize: ".85rem", fontWeight: 600, boxShadow: "0 8px 30px rgba(0,0,0,.2)", display: "flex", alignItems: "center", gap: "9px", opacity: visible ? 1 : 0, transition: "all .35s cubic-bezier(.34,1.56,.64,1)", pointerEvents: "none", zIndex: 9999, whiteSpace: "nowrap" }}>
      <IconCheck /><span>{message}</span>
    </div>
  );
}

function ConfirmModal({ isOpen, title, body, confirmLabel = "Confirm", danger = false, onConfirm, onCancel, isDarkMode }) {
  if (!isOpen) return null;
  const surface = isDarkMode ? "#1f1f1f" : "#fff";
  const border = isDarkMode ? "rgba(255,255,255,0.07)" : "rgba(44,62,80,0.08)";
  const text = isDarkMode ? "#EDF2F7" : "#1C2B38";
  const text2 = isDarkMode ? "#A0AEC0" : "#4A5568";
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 900, background: "rgba(28,43,56,.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 20, padding: "1.75rem 2rem", width: "100%", maxWidth: 400, boxShadow: "0 8px 40px rgba(0,0,0,.18)" }}>
        <div style={{ fontSize: "1rem", fontWeight: 800, color: text, marginBottom: ".5rem" }}>{title}</div>
        <div style={{ fontSize: ".85rem", color: text2, lineHeight: 1.6, marginBottom: "1.5rem" }}>{body}</div>
        <div style={{ display: "flex", gap: ".75rem", justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ padding: "9px 18px", borderRadius: 12, border: `1px solid ${border}`, background: "transparent", color: text2, fontFamily: "inherit", fontWeight: 600, fontSize: ".85rem", cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: "9px 18px", borderRadius: 12, border: "none", background: danger ? "#e53e3e" : C.navy, color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: ".85rem", cursor: "pointer" }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function RoomCard({ room, isDarkMode, onJoin, onDelete }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [joining, setJoining] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");
  const [showMembersTooltip, setShowMembersTooltip] = useState(false);

  const accent = C.ocean;
  const cardBg = isDarkMode ? "#1f1f1f" : "#fff";
  const cardBorder = hovered ? accent + "80" : (isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(44,62,80,0.08)");
  const titleColor = isDarkMode ? "#f0f0f0" : "#1a1a2e";
  const mutedColor = isDarkMode ? "#9a9a9a" : "#686868";
  const surface2 = isDarkMode ? "#2a2a2a" : "#e8eaed";
  const tagBg = isDarkMode ? "rgba(61,113,141,.18)" : "rgba(61,113,141,.09)";
  const tagColor = isDarkMode ? C.sky : C.ocean;
  const memberBg = isDarkMode ? "rgba(52,211,153,.12)" : "rgba(52,211,153,.1)";

  async function handleJoin(e) {
    e.stopPropagation();
    if (room.full || joining) return;
    if (!room.isPublic && !codeInput) {
      setShowCode(true);
      return;
    }
    setJoining(true);
    setCodeError("");
    try {
      await joinRoom(room.id, !room.isPublic ? codeInput : undefined);
      onJoin(room.name, room.id);
    } catch (err) {
      console.error("Join failed:", err);
      setCodeError(!room.isPublic ? "Invalid room code. Please try again." : (err.message || "Failed to join room."));
    } finally {
      setJoining(false);
    }
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowMembersTooltip(false); }}
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
        boxShadow: hovered ? `0 10px 36px ${accent}20` : "none"
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg,${accent},${accent}66)`, opacity: hovered ? 1 : 0, transition: "opacity .2s" }} />

      {/* Tags & Subject */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: ".65rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 9px", borderRadius: "999px", fontSize: ".68rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", background: tagBg, color: tagColor }}>
            {room.isPublic
              ? <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>Public</>
              : <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>Private</>}
          </span>
          {room.isMember && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: "999px", fontSize: ".63rem", fontWeight: 700, background: memberBg, color: "#34d399", letterSpacing: ".03em" }}><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>Joined</span>}
          {room.isOwner && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: "999px", fontSize: ".63rem", fontWeight: 700, background: `linear-gradient(135deg,rgba(44,62,80,.18),rgba(61,113,141,.18))`, color: C.teal, letterSpacing: ".03em" }}>★ Owner</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: ".72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: isDarkMode ? "#8A9BAA" : "#4A5568" }}>{room.subject}</span>
          {room.isOwner && (
            <button onClick={e => { e.stopPropagation(); onDelete(room.id, room.name); }} disabled={deleting} title="Delete room"
              style={{ width: 24, height: 24, borderRadius: 7, border: "none", background: "transparent", color: mutedColor, cursor: deleting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .15s,color .15s", opacity: deleting ? .5 : 1 }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(248,113,113,.12)"; e.currentTarget.style.color = "#f87171"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = mutedColor; }}>
              {deleting ? <span style={{ width: 10, height: 10, borderRadius: "50%", border: "2px solid currentColor", borderTopColor: "transparent", display: "block", animation: "rcSpin .6s linear infinite" }} /> : <IconTrash />}
            </button>
          )}
        </div>
      </div>

      {/* Room Name */}
      <div style={{ fontWeight: 700, fontSize: ".95rem", color: titleColor, marginBottom: ".35rem", lineHeight: 1.3 }}>{room.name}</div>

      {/* Description */}
      <div style={{ fontSize: ".82rem", color: mutedColor, lineHeight: 1.55, marginBottom: ".6rem", flex: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
        {room.desc && room.desc !== "No description available"
          ? room.desc
          : <span style={{ opacity: 0.45, fontStyle: "italic" }}>No description</span>
        }
      </div>

      {/* Creation date */}
      {room.createdAt && (
        <div style={{
          fontSize: ".72rem", color: mutedColor, marginBottom: ".9rem",
          display: "flex", alignItems: "center", gap: 4, opacity: 0.65
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Created {new Date(room.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
      )}

      {/* Members avatars + count */}
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", position: "relative" }}
        onMouseEnter={() => room.current > 0 && setShowMembersTooltip(true)}
        onMouseLeave={() => setShowMembersTooltip(false)}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {room.current > 0 ? (
            <>
              {(room.members.length > 0
                ? room.members.slice(0, 4)
                : Array.from({ length: Math.min(room.current, 4) }, (_, i) => ({ _placeholder: true, _index: i }))
              ).map((member, i) => {
                const isPlaceholder = !member || member._placeholder;
                const name = isPlaceholder
                  ? null
                  : (member.userName || member.name || member.displayName || member.user?.userName || null);
                const initials = name
                  ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
                  : null;

                return (
                  <div
                    key={i}
                    title={name || undefined}
                    style={{
                      width: 28, height: 28, borderRadius: "50%",
                      border: `3px solid ${cardBg}`, marginLeft: i === 0 ? 0 : -10,
                      flexShrink: 0,
                      background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length],
                      zIndex: 5 - i,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: ".48rem", fontWeight: 800, color: "#fff",
                    }}
                  >
                    {initials}
                  </div>
                );
              })}

              {room.current > 4 && (
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  border: `3px solid ${cardBg}`, marginLeft: -10, flexShrink: 0,
                  background: isDarkMode ? "#2a2a2a" : "#e0e4e8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: ".55rem", fontWeight: 700, color: mutedColor, zIndex: 0,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                }}>
                  +{room.current - 4}
                </div>
              )}
            </>
          ) : (
            <span style={{ fontSize: ".75rem", color: mutedColor, fontStyle: "italic" }}>
              No members yet
            </span>
          )}
        </div>

        {/* Member count text — e.g. "3 / 8 members" */}
        {room.current > 0 && (
          <span style={{
            fontSize: ".72rem", fontWeight: 600,
            color: mutedColor, whiteSpace: "nowrap",
            display: "flex", alignItems: "center", gap: 4
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {room.current}{room.max ? ` / ${room.max}` : ""} members
          </span>
        )}

        {/* Tooltip */}
        {showMembersTooltip && room.current > 0 && (
          <div style={{
            position: "absolute", bottom: "35px", left: "50%",
            transform: "translateX(-50%)",
            background: isDarkMode ? "#2a2a2a" : "#fff",
            padding: "8px 12px", borderRadius: "8px",
            border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
            fontSize: ".7rem", color: isDarkMode ? "#e0e0e0" : "#333",
            whiteSpace: "nowrap", boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            zIndex: 10, pointerEvents: "none",
            display: "flex", flexDirection: "column", gap: 4,
            minWidth: 120,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 4, opacity: 0.6, fontSize: ".65rem", textTransform: "uppercase", letterSpacing: ".05em" }}>
              {room.current} {room.current === 1 ? "member" : "members"}
              {room.max ? ` / ${room.max} max` : ""}
            </div>
            {room.members.slice(0, 6).map((m, i) => {
              const name = m?.userName || m?.name || m?.displayName || "Unknown";
              return (
                <div key={m.id ?? i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%",
                    background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length],
                    flexShrink: 0, fontSize: ".45rem", fontWeight: 800, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    {name[0]?.toUpperCase()}
                  </div>
                  <span>{name}</span>
                </div>
              );
            })}
            {room.current > 6 && (
              <div style={{ opacity: 0.5, fontSize: ".65rem" }}>+{room.current - 6} more</div>
            )}
          </div>
        )}
      </div>

      {/* Room Code Input */}
      {showCode && !room.isPublic && (
        <>
          <input
            type="text"
            placeholder="Enter room code..."
            value={codeInput}
            onChange={e => { setCodeInput(e.target.value); setCodeError(""); }}
            style={{
              width: "100%", padding: "7px 10px", borderRadius: "8px", marginBottom: "4px",
              border: `1px solid ${codeError ? "#f87171" : accent + "55"}`,
              background: surface2, color: titleColor, fontFamily: "inherit",
              fontSize: ".8rem", outline: "none", boxSizing: "border-box"
            }}
            onKeyDown={e => e.key === "Enter" && handleJoin(e)}
            autoFocus
          />
          {codeError && (
            <div style={{ fontSize: ".72rem", color: "#f87171", fontWeight: 600, marginBottom: "6px", display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {codeError}
            </div>
          )}
        </>
      )}

      {/* Join Button */}
      <button
        onClick={room.isMember ? () => navigate(`/study-rooms/${room.id}`) : handleJoin}
        disabled={room.full || joining}
        style={{
          width: "100%", padding: "8px", borderRadius: "10px", border: "none",
          background: room.isMember ? "rgba(52,211,153,.12)" : room.full ? surface2 : (joining ? accent : C.navy),
          color: room.isMember ? "#34d399" : room.full ? mutedColor : "#fff",
          fontFamily: "inherit", fontSize: ".8rem", fontWeight: 600,
          cursor: (room.full || joining) ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "6px", transition: "all .2s"
        }}
      >
        {room.isMember ? (
          <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Open Room</>
        ) : room.full ? (
          <><IconLock /> Full</>
        ) : joining ? (
          "Joining..."
        ) : showCode && !room.isPublic ? (
          "Confirm Code"
        ) : (
          <><IconLogin /> Join</>
        )}
      </button>

      <style>{`
        @keyframes rcSpin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
      `}</style>
    </div>
  );
}

function SkeletonCard({ isDarkMode }) {
  const bg = isDarkMode ? "#2a2a2a" : "#e8eaed", cardBg = isDarkMode ? "#1f1f1f" : "#fff";
  return (
    <div style={{ background: cardBg, border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(44,62,80,0.08)"}`, borderRadius: 14, padding: "1.25rem" }}>
      {[80, 55, 100, 40].map((w, i) => (
        <div key={i} style={{
          height: i === 0 ? 14 : i === 2 ? 50 : 12,
          width: `${w}%`, background: bg, borderRadius: 6,
          marginBottom: i === 3 ? 0 : 12,
          animation: "pulse 1.5s ease-in-out infinite"
        }} />
      ))}
    </div>
  );
}

export default function StudyWithFriends() {
  const { isDarkMode } = useThemeContext();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, msg: "", type: "success" });
  const [confirm, setConfirm] = useState({ open: false, roomId: null, roomName: "" });

  const currentUserId = (() => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload?.sub ?? payload?.userId ?? payload?.id ?? null;
    } catch {
      return null;
    }
  })();

  const bg = isDarkMode ? "#171717" : "#F3F4F6";
  const surface = isDarkMode ? "#1e1e1e" : "#fff";
  const border = isDarkMode ? "rgba(255,255,255,0.07)" : "rgba(44,62,80,0.08)";
  const text = isDarkMode ? "#EDF2F7" : "#1C2B38";
  const text2 = isDarkMode ? "#A0AEC0" : "#4A5568";
  const muted = "#8A9BAA";

  const FILTERS = [
    { key: "all", label: "All Rooms" },
    { key: "public", label: "Public" },
    { key: "private", label: "Private" },
  ];

  async function fetchRooms() {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllRooms();
      const list = Array.isArray(data) ? data : data?.rooms ?? [];

      const detailed = await Promise.all(
        list.map(async (r) => {
          try {
            const fullRoom = await getRoomById(r.id);
            return fullRoom;
          } catch {
            return r;
          }
        })
      );

      const withMembers = await Promise.all(
        detailed.map(async (r) => {
          const normalized = normalizeRoom(r, currentUserId);

          const hasRealMembers = normalized.members.some(
            m => m.userName && !m.userName.startsWith("Member ")
          );

          if (!hasRealMembers && normalized.current > 0) {
            try {
              const msgs = await getMessages(r.id);
              const msgList = Array.isArray(msgs) ? msgs : (msgs?.messages ?? []);
              const seenNames = new Set();
              const namesFromMsgs = [];
              for (const msg of msgList) {
                const nm = normalizeMessage(msg);
                if (nm.senderName && nm.senderName !== "Unknown" && !seenNames.has(nm.senderName)) {
                  seenNames.add(nm.senderName);
                  namesFromMsgs.push(nm.senderName);
                }
              }
              if (namesFromMsgs.length > 0) {
                normalized.members = Array.from({ length: normalized.current }, (_, i) => ({
                  id: `msg-member-${i}`,
                  userId: null,
                  userName: namesFromMsgs[i] ?? `Member ${i + 1}`,
                  name: namesFromMsgs[i] ?? `Member ${i + 1}`,
                }));
              }
            } catch { /* يفضل زي ما هو */ }
          }

          return normalized;
        })
      );

      setRooms(withMembers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRooms();
  }, []);

  function showToast(msg, type = "success") {
    setToast({ visible: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3200);
  }

  function handleJoin(name, roomId) {
    showToast(`Joined "${name}" successfully`);
    setRooms(prev => prev.map(r =>
      r.id === roomId
        ? {
          ...r,
          isMember: true,
          current: r.current + 1,
          fill: r.max > 0 ? Math.round(((r.current + 1) / r.max) * 100) : 0,
          full: r.max ? (r.current + 1) >= r.max : false
        }
        : r
    ));
    fetchRooms();
    setTimeout(() => navigate(`/study-rooms/${roomId}`), 800);
  }

  function handleDeleteRequest(roomId, roomName) {
    setConfirm({ open: true, roomId, roomName });
  }

  async function handleDeleteConfirm() {
    const { roomId, roomName } = confirm;
    setConfirm({ open: false, roomId: null, roomName: "" });
    try {
      await deleteRoom(roomId);
      setRooms(prev => prev.filter(r => r.id !== roomId));
      showToast(`Room "${roomName}" deleted`);
    } catch (err) {
      console.error("Delete failed:", err);
      showToast("Failed to delete room", "error");
    }
  }

  function handleCreated(name, newRoomId) {
    showToast(`Room "${name}" created!`);
    fetchRooms();
    if (newRoomId) setTimeout(() => navigate(`/study-rooms/${newRoomId}`), 800);
  }

  const filtered = rooms.filter(r => {
    const matchFilter = filter === "all" ? true : filter === "public" ? r.isPublic : !r.isPublic;
    const q = search.toLowerCase();
    return (!q || r.name.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q)) && matchFilter;
  });

  return (
    <div style={{ background: bg, minHeight: "100vh" }}>
      <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "2.5rem 2rem 6rem" }}>

        {/* Hero Section */}
        <div style={{
          background: `linear-gradient(135deg,${C.navy} 0%,${C.ocean} 60%,${C.teal} 100%)`,
          borderRadius: "26px", padding: "2.5rem 3rem", marginBottom: "2rem",
          position: "relative", overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2rem"
        }}>
          <div style={{ position: "absolute", top: -80, right: 120, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(143,183,204,.2) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, right: -40, width: 220, height: 220, borderRadius: "50%", border: "40px solid rgba(255,255,255,.05)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: ".68rem", fontWeight: 600, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(255,255,255,.55)", marginBottom: ".6rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: 18, height: 2, background: "rgba(255,255,255,.4)", borderRadius: 2, display: "inline-block" }} />Study Station
            </div>
            <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.4rem)", fontWeight: 800, letterSpacing: "-.03em", color: "#fff", lineHeight: 1.1, marginBottom: ".65rem" }}>Study With Friends</h1>
            <p style={{ fontSize: ".9rem", color: "rgba(255,255,255,.6)", lineHeight: 1.6, maxWidth: "420px" }}>Join a virtual study room or create your own — study smarter, together.</p>
            <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", gap: ".85rem" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "5px 13px", borderRadius: "999px",
                background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.15)",
                fontSize: ".75rem", fontWeight: 500, color: "rgba(255,255,255,.85)"
              }}>
                <IconGrid />{rooms.length} active rooms
              </span>
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
              transition: "transform .2s,box-shadow .2s",
              whiteSpace: "nowrap", letterSpacing: "-.01em", flexShrink: 0
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.25)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.2)"; }}
          >
            <IconPlus /> Create Room
          </button>
        </div>

        {/* Filter Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: ".75rem", flexWrap: "wrap", marginBottom: "1.75rem" }}>
          <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: muted, pointerEvents: "none" }}>
              <IconSearch />
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by room name or subject…"
              style={{
                width: "100%", padding: "9px 13px 9px 38px",
                background: surface, border: `1px solid ${border}`,
                borderRadius: "14px", fontFamily: "inherit",
                fontSize: ".875rem", color: text, outline: "none",
                boxShadow: "0 1px 3px rgba(44,62,80,0.06)", transition: "border .2s"
              }}
              onFocus={e => { e.currentTarget.style.borderColor = C.sky; }}
              onBlur={e => { e.currentTarget.style.borderColor = border; }}
            />
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
            {FILTERS.map(f => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{
                    padding: "7px 15px", borderRadius: "999px",
                    fontSize: ".78rem", fontWeight: 600, cursor: "pointer",
                    border: `1px solid ${active ? (isDarkMode ? C.ocean : C.navy) : border}`,
                    background: active ? (isDarkMode ? C.ocean : C.navy) : surface,
                    color: active ? "#fff" : text2,
                    fontFamily: "inherit", transition: "all .2s", whiteSpace: "nowrap"
                  }}
                >
                  {f.label}
                </button>
              );
            })}
            <button
              onClick={fetchRooms}
              style={{
                padding: "7px 12px", borderRadius: "999px",
                fontSize: ".78rem", fontWeight: 600, cursor: "pointer",
                border: `1px solid ${border}`, background: surface, color: text2,
                fontFamily: "inherit", transition: "all .2s",
                display: "flex", alignItems: "center", gap: 5
              }}
            >
              <IconRefresh /> Refresh
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "1.25rem" }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} isDarkMode={isDarkMode} />)}
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "5rem 2rem", color: muted }}>
            <p style={{ fontWeight: 700, fontSize: "1rem", marginBottom: ".5rem", color: "#e53e3e" }}>Failed to load rooms</p>
            <p style={{ fontSize: ".85rem", marginBottom: "1rem" }}>{error}</p>
            <button
              onClick={fetchRooms}
              style={{
                padding: "8px 20px", borderRadius: "10px", border: "none",
                background: C.navy, color: "#fff", fontFamily: "inherit",
                fontSize: ".85rem", fontWeight: 600, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 6
              }}
            >
              <IconRefresh /> Try Again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 2rem", color: muted }}>
            <p style={{ fontWeight: 600, fontSize: "1rem", marginBottom: ".4rem" }}>No rooms found</p>
            <p style={{ fontSize: ".85rem" }}>Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "1.25rem" }}>
            {filtered.map(room => (
              <RoomCard
                key={room.id}
                room={room}
                isDarkMode={isDarkMode}
                onJoin={handleJoin}
                onDelete={handleDeleteRequest}
              />
            ))}
          </div>
        )}
      </div>

      <CreateRoomModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onCreated={handleCreated} isDarkMode={isDarkMode} />
      <Toast message={toast.msg} visible={toast.visible} type={toast.type} />
      <ConfirmModal
        isOpen={confirm.open}
        title="Delete Room"
        body={`Are you sure you want to delete "${confirm.roomName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        isDarkMode={isDarkMode}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirm({ open: false, roomId: null, roomName: "" })}
      />
    </div>
  );
}