import React, { useState, useEffect } from 'react'
import { useThemeContext } from '../Theme/ThemeContext'
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input } from "@heroui/react";
import { libraryApi } from '../Services/libraryService';
import ResourceCard from "./Resourcecard"; 

export const SearchIcon = (props) => (
  <svg aria-hidden="true" fill="none" focusable="false" height="1em" role="presentation" viewBox="0 0 24 24" width="1em" {...props}>
    <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path d="M22 22L20 20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

// ── Category map (ID → name) ───────────────────────────────
const CATEGORY_MAP = {
  1: "Frontend",
  2: "Backend",
  3: "AI / ML",
  4: "Cyber Security",
  5: "UI/UX",
};

// ── Resource Type map (ID → name) ─────────────────────────
const RESOURCE_TYPE_MAP = {
  1: "Videos",
  2: "Articles",
  3: "Books",
};

const TYPE_STYLES = {
  roadmap:  { color: "#8FB7CC", darkBg: "rgba(143,183,204,0.18)", bg: "rgba(143,183,204,0.15)", label: "Roadmap",   icon: "M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" },
  resource: { color: "#3D718D", darkBg: "rgba(61,113,141,0.2)",   bg: "rgba(61,113,141,0.12)",  label: "Resource",  icon: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" },
  video:    { color: "#658FA5", darkBg: "rgba(101,143,165,0.2)",   bg: "rgba(101,143,165,0.12)", label: "Video",     icon: "M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" },
  default:  { color: "#3D718D", darkBg: "rgba(61,113,141,0.2)",   bg: "rgba(61,113,141,0.12)",  label: "Resource",  icon: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" },
};

function getTypeStyle(type) {
  if (!type) return TYPE_STYLES.default;
  const t = type.toLowerCase();
  if (t === "roadmap")                   return TYPE_STYLES.roadmap;
  if (t === "video" || t === "playlist") return TYPE_STYLES.video;
  return TYPE_STYLES.resource;
}

const SECTIONS = {
  roadmap:  { label: "Roadmaps",             color: "#8FB7CC" },
  resource: { label: "Resources & Materials", color: "#3D718D" },
  video:    { label: "Videos & Playlists",    color: "#658FA5" },
};

function getSectionKey(type) {
  if (!type) return "resource";
  const t = type.toLowerCase();
  if (t === "roadmap")                   return "roadmap";
  if (t === "video" || t === "playlist") return "video";
  return "resource";
}

function groupBySections(resources) {
  const groups = { roadmap: [], resource: [], video: [] };
  resources.forEach(r => { groups[getSectionKey(r.type)].push(r); });
  return groups;
}

function SkeletonCard({ isDarkMode }) {
  const bg    = isDarkMode ? "#1f1f1f" : "#ffffff";
  const pulse = isDarkMode ? "#2a2a2a" : "#e8eaed";
  return (
    <div style={{ background: bg, border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(44,62,80,0.08)"}`, borderRadius: "14px", padding: "1.25rem" }}>
      {[60, 100, 80, 40].map((w, i) => (
        <div key={i} style={{ height: i === 0 ? 20 : i === 1 ? 16 : 12, width: `${w}%`, background: pulse, borderRadius: 6, marginBottom: 10 }} />
      ))}
    </div>
  );
}

// ── Section Header ─────────────────────────────────────────
function SectionHeader({ sectionKey, count, isDarkMode }) {
  const s = SECTIONS[sectionKey];
  const t = TYPE_STYLES[sectionKey] || TYPE_STYLES.default;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
      <div style={{
        width: "32px", height: "32px", borderRadius: "8px",
        background: isDarkMode ? t.darkBg : t.bg,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={t.color} style={{ width: "16px", height: "16px" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
        </svg>
      </div>
      <div>
        <p style={{ fontWeight: 700, fontSize: ".78rem", letterSpacing: ".1em", textTransform: "uppercase", color: s.color, margin: 0 }}>
          {s.label}
        </p>
        <p style={{ fontSize: ".7rem", color: isDarkMode ? "#9a9a9a" : "#6b6f76", margin: 0 }}>
          {count} {count === 1 ? "resource" : "resources"}
        </p>
      </div>
      <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, ${s.color}40, transparent)` }} />
    </div>
  );
}

function EmptyState({ isDarkMode }) {
  return (
    <div style={{ textAlign: "center", padding: "4rem 2rem", color: isDarkMode ? "#9a9a9a" : "#6b6f76" }}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "48px", height: "48px", margin: "0 auto 1rem", display: "block", opacity: .4 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
      </svg>
      <p style={{ fontWeight: 600, fontSize: "1rem", marginBottom: ".4rem" }}>No resources found</p>
      <p style={{ fontSize: ".85rem" }}>Try adjusting your search or filter.</p>
    </div>
  );
}

function ErrorState({ message, onRetry, isDarkMode }) {
  return (
    <div style={{ textAlign: "center", padding: "4rem 2rem", color: isDarkMode ? "#9a9a9a" : "#6b6f76" }}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#dc2626" style={{ width: "48px", height: "48px", margin: "0 auto 1rem", display: "block" }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
      <p style={{ fontWeight: 600, fontSize: "1rem", marginBottom: ".4rem", color: "#dc2626" }}>Failed to load resources</p>
      <p style={{ fontSize: ".85rem", marginBottom: "1.25rem" }}>{message}</p>
      <button onClick={onRetry} style={{ padding: "8px 20px", borderRadius: "10px", border: "none", background: "#8FB7CC", color: "#2C3E50", fontWeight: 600, fontSize: ".85rem", cursor: "pointer" }}>
        Try Again
      </button>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────
export default function Library() {
  const { isDarkMode } = useThemeContext();
  const navigate = useNavigate();

  const [resources,    setResources]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery,  setSearchQuery]  = useState("");

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await libraryApi.getAll();
      setResources(Array.isArray(data) ? data : data.data ?? data.resources ?? []);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResources(); }, []);

  // Build category filter list from resolved names
  const categories = ["All", ...new Set(
    resources.map(r =>
      r.categoryName || CATEGORY_MAP[r.categoryId] || r.category
    ).filter(Boolean)
  )];

  const filtered = resources.filter(r => {
    const cat = r.categoryName || CATEGORY_MAP[r.categoryId] || r.category || "";
    const matchCat = activeFilter === "All" || cat.toLowerCase() === activeFilter.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchQ = !q ||
      (r.title       || "").toLowerCase().includes(q) ||
      (r.description || "").toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const grouped = groupBySections(filtered);

  const btnInactiveBg     = isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const btnInactiveColor  = isDarkMode ? "#B0B0B0" : "#6b6f76";
  const btnInactiveBorder = isDarkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";

  return (
    <div>
      {/* ── HERO ── */}
      <div style={{ padding: "2.5rem 2.5rem 2rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(143,183,204,.2) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "960px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: ".7rem", fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase", color: "#8FB7CC", marginBottom: ".75rem" }}>
            <div style={{ width: "20px", height: "2px", background: "#8FB7CC" }} />
            Learning Hub
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
            <div style={{ flex: 1, minWidth: "260px" }}>
              <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 800, color: isDarkMode ? "white" : "#2C3E50", lineHeight: 1.15, marginBottom: ".5rem", letterSpacing: ".06em", textTransform: "uppercase" }}>
                The <span style={{ color: "#8FB7CC" }}>Library</span>
              </h1>
              <p style={{ color: isDarkMode ? "rgba(255,255,255,.55)" : "#6b6f76", fontSize: ".9rem", lineHeight: 1.65, maxWidth: "480px" }}>
                Structured learning tracks with curated{" "}
                <span style={{ color: isDarkMode ? "rgba(255,255,255,.85)" : "#2C3E50", fontWeight: 700 }}>Courses & Playlists</span>,{" "}
                <span style={{ color: isDarkMode ? "rgba(255,255,255,.85)" : "#2C3E50", fontWeight: 700 }}>Resources</span>, and{" "}
                <span style={{ color: isDarkMode ? "rgba(255,255,255,.85)" : "#2C3E50", fontWeight: 700 }}>Roadmaps</span> all in one place.
              </p>

              {/* ── CTA Buttons ── */}
              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginTop: "1.25rem" }}>
                <Link to="/share-resource">
                  <button
                    style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "9px 18px", borderRadius: "10px", border: "none", background: "#8FB7CC", color: "#2C3E50", fontWeight: 600, fontSize: ".85rem", cursor: "pointer", transition: "all .2s", whiteSpace: "nowrap" }}
                    onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.07)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.filter = ""; e.currentTarget.style.transform = ""; }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "15px", height: "15px" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    Share a Resource
                  </button>
                </Link>

                {/* ── Saved Items Button ── */}
                <button
                  onClick={() => navigate("/saved")}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "7px",
                    padding: "9px 18px", borderRadius: "10px",
                    background: isDarkMode ? "rgba(143,183,204,0.12)" : "rgba(143,183,204,0.15)",
                    color: "#8FB7CC",
                    border: `1px solid ${isDarkMode ? "rgba(143,183,204,0.25)" : "rgba(143,183,204,0.4)"}`,
                    fontWeight: 600, fontSize: ".85rem", cursor: "pointer",
                    transition: "all .2s", whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = isDarkMode ? "rgba(143,183,204,0.2)" : "rgba(143,183,204,0.25)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isDarkMode ? "rgba(143,183,204,0.12)" : "rgba(143,183,204,0.15)"; e.currentTarget.style.transform = ""; }}
                >
                  {/* filled bookmark icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: "15px", height: "15px" }}>
                    <path d="M5 3h14a1 1 0 0 1 1 1v17l-8-4-8 4V4a1 1 0 0 1 1-1Z" />
                  </svg>
                  Saved Items
                </button>

                <button
                  onClick={() => document.getElementById('library-tracks')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "9px 18px", borderRadius: "10px", background: isDarkMode ? "rgba(255,255,255,.08)" : "rgba(0,0,0,0.05)", color: isDarkMode ? "rgba(255,255,255,.8)" : "#6b6f76", border: `1px solid ${isDarkMode ? "rgba(255,255,255,.12)" : "rgba(0,0,0,0.1)"}`, fontWeight: 500, fontSize: ".85rem", cursor: "pointer", transition: "all .2s", whiteSpace: "nowrap", backdropFilter: "blur(12px) saturate(200%)" }}
                  onMouseEnter={e => e.currentTarget.style.background = isDarkMode ? "rgba(255,255,255,.14)" : "rgba(0,0,0,0.09)"}
                  onMouseLeave={e => e.currentTarget.style.background = isDarkMode ? "rgba(255,255,255,.08)" : "rgba(0,0,0,0.05)"}
                >
                  Browse Tracks ↓
                </button>
              </div>
            </div>

            {!loading && !error && (
              <div style={{ alignSelf: "flex-end", background: isDarkMode ? "rgba(255,255,255,0.07)" : "rgba(143,183,204,0.12)", border: `1px solid ${isDarkMode ? "rgba(255,255,255,0.12)" : "rgba(143,183,204,0.3)"}`, borderRadius: "12px", padding: "1rem 1.5rem", textAlign: "center", minWidth: "120px" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#8FB7CC", lineHeight: 1 }}>{resources.length}</div>
                <div style={{ fontSize: ".7rem", color: isDarkMode ? "rgba(255,255,255,.5)" : "#6b6f76", textTransform: "uppercase", letterSpacing: ".1em", marginTop: ".3rem" }}>Resources</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "1.25rem 2.5rem" }}>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
          <div className="w-full sm:max-w-[500px]">
            <Input
              isClearable
              value={searchQuery}
              onValueChange={setSearchQuery}
              classNames={{
                input: ["bg-transparent", "text-black/90 dark:text-white/90", "placeholder:text-default-700/50 dark:placeholder:text-white/60", "text-base"],
                innerWrapper: "bg-transparent",
                inputWrapper: ["shadow-sm", "bg-default-200/50", "dark:bg-default/60", "backdrop-blur-xl", "backdrop-saturate-200", "hover:bg-default-200/70", "dark:hover:bg-default/70", "group-data-[focus=true]:bg-default-200/50", "dark:group-data-[focus=true]:bg-default/60", "cursor-text!", "h-12", "px-4"],
              }}
              placeholder="Search a resource..."
              radius="lg"
              size="lg"
              startContent={<SearchIcon className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none shrink-0" />}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {categories.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <Button
                  key={filter}
                  radius="full"
                  onClick={() => setActiveFilter(filter)}
                  style={{
                    backgroundColor: isActive ? "#6b6f76" : btnInactiveBg,
                    color: isActive ? "#ffffff" : btnInactiveColor,
                    border: `1px solid ${isActive ? "#6b6f76" : btnInactiveBorder}`,
                    backdropFilter: "blur(12px) saturate(200%)",
                    height: "48px", fontWeight: 500, fontSize: "14px",
                    transition: "all 0.2s ease",
                    boxShadow: isActive ? "0 2px 8px rgba(107,111,118,0.3)" : "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  {filter}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div id="library-tracks" style={{ maxWidth: "960px", margin: "0 auto", padding: "0 2.5rem 4rem" }}>
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "14px" }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} isDarkMode={isDarkMode} />)}
          </div>
        )}

        {!loading && error && <ErrorState message={error} onRetry={fetchResources} isDarkMode={isDarkMode} />}
        {!loading && !error && filtered.length === 0 && <EmptyState isDarkMode={isDarkMode} />}

        {!loading && !error && filtered.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
            {Object.entries(grouped).map(([key, items]) => {
              if (items.length === 0) return null;
              return (
                <div key={key}>
                  <SectionHeader sectionKey={key} count={items.length} isDarkMode={isDarkMode} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "14px" }}>
                    {items.map((res) => (
                      <ResourceCard key={res.id} resource={res} isDarkMode={isDarkMode} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}