import { useState, useRef, useEffect, useCallback } from "react";
import { useThemeContext } from "../Theme/ThemeContext";

const Icon = ({ d, points, circles, paths, poly, size = 16, strokeWidth = 2.5 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
    width={size} height={size}>
    {d && <path d={d} />}
    {paths && paths.map((p, i) => <path key={i} d={p} />)}
    {points && <polyline points={points} />}
    {poly && poly.map((p, i) => <polyline key={i} points={p} />)}
    {circles && circles.map((c, i) => <circle key={i} {...c} />)}
  </svg>
);

const tokens = {
  light: {
    "--navy": "#2C3E50",
    "--ocean": "#3D718D",
    "--teal": "#658FA5",
    "--sky": "#8FB7CC",
    "--bg": "#F3F4F6",
    "--surface": "#ffffff",
    "--surface2": "#EAECEF",
    "--surface3": "#f8f9fa",
    "--text": "#1C2B38",
    "--text-2": "#4A5568",
    "--muted": "#8A9BAA",
    "--border": "rgba(44,62,80,0.08)",
    "--border-2": "rgba(44,62,80,0.05)",
    "--accent": "#3D718D",
    "--accent-soft": "rgba(61,113,141,0.10)",
    "--sh-sm": "0 1px 2px rgba(44,62,80,0.05), 0 2px 8px rgba(44,62,80,0.05)",
    "--sh-md": "0 2px 4px rgba(44,62,80,0.04), 0 6px 20px rgba(44,62,80,0.07)",
    "--sh-lg": "0 4px 8px rgba(44,62,80,0.04), 0 16px 40px rgba(44,62,80,0.09)",
  },
  dark: {
    "--navy": "#2C3E50",
    "--ocean": "#3D718D",
    "--teal": "#658FA5",
    "--sky": "#8FB7CC",
    "--bg": "#171717",
    "--surface": "#1e1e1e",
    "--surface2": "#252525",
    "--surface3": "#2a2a2a",
    "--text": "#EDF2F7",
    "--text-2": "#A0AEC0",
    "--muted": "#5A7080",
    "--border": "rgba(255,255,255,0.07)",
    "--border-2": "rgba(255,255,255,0.04)",
    "--accent": "#8FB7CC",
    "--accent-soft": "rgba(143,183,204,0.10)",
    "--sh-sm": "0 1px 2px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.2)",
    "--sh-md": "0 2px 4px rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.3)",
    "--sh-lg": "0 4px 8px rgba(0,0,0,0.2), 0 16px 40px rgba(0,0,0,0.4)",
  },
};

const API_BASE = "https://study-station.runasp.net/api";

const FALLBACK_DAYS = [
  { name: "Mon", tasks: [] },
  { name: "Tue", tasks: [] },
  { name: "Wed", tasks: [] },
  { name: "Thu", tasks: [] },
  { name: "Fri", tasks: [] },
  { name: "Sat", tasks: [] },
  { name: "Sun", tasks: [] },
];

const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const BAR_DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const LS_KEY = "study_planner_days";
const LS_SESSION_KEY = "study_session";

function getInitials(firstName, lastName) {
  const f = (firstName || "").trim()[0] || "";
  const l = (lastName || "").trim()[0] || "";
  return (f + l).toUpperCase() || "??";
}

function formatDOB(isoString) {
  if (!isoString) return "";
  try { return new Date(isoString).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }); }
  catch { return isoString; }
}

function loadDaysFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length === 7) return parsed;
    return null;
  } catch { return null; }
}

function saveDaysToStorage(days) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(days)); } catch { }
}

function loadSessionSeconds() {
  try {
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem(LS_SESSION_KEY) || "{}");
    return saved.date === today ? (saved.seconds || 0) : 0;
  } catch { return 0; }
}

function saveSessionSeconds(seconds) {
  try {
    localStorage.setItem(LS_SESSION_KEY, JSON.stringify({
      date: new Date().toDateString(),
      seconds,
    }));
  } catch { }
}

function buildDaysFromAPI(plannerTasks) {
  const days = DAY_SHORT.map(name => ({ name, tasks: [] }));
  if (!Array.isArray(plannerTasks) || plannerTasks.length === 0) return days;
  plannerTasks.forEach(task => {
    const text = task.text || task.title || task.taskName || task.name || "Untitled";
    const done = task.done ?? task.isCompleted ?? task.completed ?? false;
    const priority = task.priority ?? task.isPriority ?? false;
    let dayIdx = -1;
    if (task.dayOfWeek) {
      dayIdx = DAY_ORDER.findIndex(d =>
        d.toLowerCase().startsWith((task.dayOfWeek || "").toLowerCase().slice(0, 3))
      );
    } else if (task.scheduledDate || task.date) {
      const d = new Date(task.scheduledDate || task.date);
      dayIdx = (d.getDay() + 6) % 7;
    }
    if (dayIdx >= 0 && dayIdx < 7) {
      days[dayIdx].tasks.push({ id: task.id ?? Date.now() + Math.random(), text, done, priority });
    }
  });
  return days;
}

function firstNumber(...values) {
  for (const value of values) {
    if (value === null || value === undefined || value === "" || value === "—") continue;
    const n = Number(value);
    if (!Number.isNaN(n)) return n;
  }
  return 0;
}

function formatHours(value) {
  return Number(value).toFixed(1);
}

function buildBarHeights(weeklyHours) {
  if (!Array.isArray(weeklyHours) || weeklyHours.length === 0) return new Array(7).fill(0);
  const ordered = DAY_ORDER.map(dayName => {
    const found = weeklyHours.find(d =>
      (d.dayOfWeek || "").toLowerCase().startsWith(dayName.slice(0, 3).toLowerCase())
    );
    return found?.hours ?? 0;
  });
  const max = Math.max(...ordered, 1);
  return ordered.map(h => Math.round((h / max) * 80));
}

function formatActivity(activityLogs, accent) {
  if (!Array.isArray(activityLogs) || activityLogs.length === 0) return [];
  const typeIcon = {
    session: <Icon points="9 11 12 14 22 4" paths={["M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"]} />,
    library: <Icon paths={["M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z", "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"]} />,
    room: <Icon paths={["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M23 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"]} circles={[{ cx: 9, cy: 7, r: 4 }]} />,
    task: <Icon paths={["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"]} points="14 2 14 8 20 8" />,
    default: <Icon poly={["22 12 18 12 15 21 9 3 6 12 2 12"]} />,
  };
  const colorMap = { session: "teal", library: "sky", room: "navy", task: "teal", default: "sky" };
  return activityLogs.slice(0, 4).map((log) => {
    const typeKey = (log.type || "").toLowerCase();
    const icon = typeIcon[typeKey] || typeIcon.default;
    const color = colorMap[typeKey] || colorMap.default;
    const desc = log.description || log.activity || log.action || "Activity";
    const subject = log.subject || log.course || log.topic || "";
    const ts = log.timestamp || log.createdAt || log.date || "";
    const duration = log.durationMinutes ? `· ${log.durationMinutes} min` : "";
    let timeLabel = "";
    if (ts) {
      try {
        const d = new Date(ts);
        const now = new Date();
        const diffH = Math.round((now - d) / 36e5);
        if (diffH < 1) timeLabel = "Just now";
        else if (diffH < 24) timeLabel = `${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} · today`;
        else if (diffH < 48) timeLabel = `${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} · yesterday`;
        else timeLabel = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      } catch { timeLabel = ""; }
    }
    return {
      color, icon,
      text: <span>{desc}{subject ? <> · <strong>{subject}</strong></> : ""}</span>,
      time: [timeLabel, duration].filter(Boolean).join(" "),
    };
  });
}

function EditProfileModal({ t, accent, profile, onSave, onClose }) {
  const [form, setForm] = useState({
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    gender: profile.gender || "",
    dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setSaving(true); setError(null);
    try {
      const token = localStorage.getItem("accessToken") || "";
      const body = {
        firstName: form.firstName, lastName: form.lastName,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : null,
      };
      const res = await fetch(`${API_BASE}/Profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      // GET بعد الـ PUT عشان ناخد الـ profile كامل مع id و email
      const updatedRes = await fetch(`${API_BASE}/Profile`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!updatedRes.ok) throw new Error(`Fetch error: ${updatedRes.status}`);
      const updatedProfile = await updatedRes.json();

      onSave(updatedProfile);
      onClose();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const field = (label, key, type = "text", options = null) => (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: ".75rem", fontWeight: 700, color: t["--muted"], marginBottom: 5, letterSpacing: ".04em", textTransform: "uppercase" }}>{label}</label>
      {options ? (
        <select value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          style={{ width: "100%", boxSizing: "border-box", background: t["--surface2"], border: `1px solid ${t["--border"]}`, borderRadius: 10, padding: "10px 14px", fontSize: ".85rem", fontWeight: 500, color: t["--text"], outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <option value="">Select…</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          style={{ width: "100%", boxSizing: "border-box", background: t["--surface2"], border: `1px solid ${t["--border"]}`, borderRadius: 10, padding: "10px 14px", fontSize: ".85rem", fontWeight: 500, color: t["--text"], outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
      )}
    </div>
  );

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: t["--surface"], border: `1px solid ${t["--border"]}`, borderRadius: 20, boxShadow: t["--sh-lg"], padding: "1.75rem", width: 360, fontFamily: "'Plus Jakarta Sans', sans-serif", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ fontSize: "1rem", fontWeight: 800, color: t["--text"], marginBottom: "1.25rem" }}>Edit Profile</div>
        {field("First Name", "firstName")}
        {field("Last Name", "lastName")}
        {field("Gender", "gender", "text", ["Male", "Female", "Other", "Prefer not to say"])}
        {field("Date of Birth", "dateOfBirth", "date")}
        {error && <div style={{ fontSize: ".78rem", color: "#e53e3e", marginBottom: ".75rem", padding: "8px 12px", background: "rgba(229,62,62,.08)", borderRadius: 8 }}>{error}</div>}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} disabled={saving} style={{ padding: "8px 16px", borderRadius: 10, border: `1px solid ${t["--border"]}`, background: t["--surface2"], color: t["--text-2"], fontSize: ".8rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "8px 20px", borderRadius: 10, border: "none", background: accent, color: "#fff", fontSize: ".8rem", fontWeight: 700, cursor: saving ? "wait" : "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddTaskModal({ t, accent, days, initialDayIdx, onAdd, onClose }) {
  const [text, setText] = useState("");
  const [dayIdx, setDayIdx] = useState(initialDayIdx);
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const handleAdd = () => { if (!text.trim()) return; onAdd(dayIdx, text.trim()); onClose(); };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: t["--surface"], border: `1px solid ${t["--border"]}`, borderRadius: 20, boxShadow: t["--sh-lg"], padding: "1.75rem", width: 320, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ fontSize: "1rem", fontWeight: 800, color: t["--text"], marginBottom: ".25rem" }}>Add Task</div>
        <div style={{ fontSize: ".75rem", color: t["--muted"], marginBottom: "1rem" }}>Choose a day and write your task</div>

        <label style={{ display: "block", fontSize: ".72rem", fontWeight: 700, color: t["--muted"], marginBottom: 5, letterSpacing: ".04em", textTransform: "uppercase" }}>Day</label>
        <select
          value={dayIdx}
          onChange={e => setDayIdx(Number(e.target.value))}
          style={{ width: "100%", boxSizing: "border-box", background: t["--surface2"], border: `1px solid ${t["--border"]}`, borderRadius: 10, padding: "10px 14px", fontSize: ".85rem", fontWeight: 600, color: t["--text"], outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: "1rem", cursor: "pointer" }}>
          {days.map((d, i) => (
            <option key={d.name + i} value={i}>{DAY_ORDER[i]}</option>
          ))}
        </select>

        <label style={{ display: "block", fontSize: ".72rem", fontWeight: 700, color: t["--muted"], marginBottom: 5, letterSpacing: ".04em", textTransform: "uppercase" }}>Task</label>
        <input ref={inputRef} value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") onClose(); }}
          placeholder="Task name…"
          style={{ width: "100%", boxSizing: "border-box", background: t["--surface2"], border: `1px solid ${t["--border"]}`, borderRadius: 10, padding: "10px 14px", fontSize: ".85rem", fontWeight: 500, color: t["--text"], outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: "1rem" }} />

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 10, border: `1px solid ${t["--border"]}`, background: t["--surface2"], color: t["--text-2"], fontSize: ".8rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Cancel</button>
          <button onClick={handleAdd} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: accent, color: "#fff", fontSize: ".8rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", opacity: text.trim() ? 1 : 0.5 }}>Add</button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { isDarkMode: dark } = useThemeContext();

  const [days, setDays] = useState(() => loadDaysFromStorage() || FALLBACK_DAYS);
  const [modal, setModal] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  const [profile, setProfile] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const [sessionSeconds, setSessionSeconds] = useState(() => loadSessionSeconds());

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionSeconds(prev => {
        const next = prev + 1;
        saveSessionSeconds(next);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const todayIndex = new Date().getDay();
  const normalizedToday = (todayIndex + 6) % 7;

  const t = tokens[dark ? "dark" : "light"];
  const accent = dark ? t["--sky"] : t["--ocean"];

  useEffect(() => {
    saveDaysToStorage(days);
  }, [days]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const token = localStorage.getItem("accessToken") || "";
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [profileRes, dashRes] = await Promise.all([
        fetch(`${API_BASE}/Profile`, { headers }),
        fetch(`${API_BASE}/Profile/dashboard`, { headers }),
      ]);

      if (!profileRes.ok) throw new Error(`Profile error (${profileRes.status})`);
      if (!dashRes.ok) throw new Error(`Dashboard error (${dashRes.status})`);

      const [profileData, dashData] = await Promise.all([
        profileRes.json(),
        dashRes.json(),
      ]);

      setProfile(profileData);
      setDashboard(dashData);

      const plannerTasks =
        dashData?.plannerTasks ??
        dashData?.tasks ??
        [];

      if (Array.isArray(plannerTasks) && plannerTasks.length > 0) {
        const apiDays = buildDaysFromAPI(plannerTasks);
        setDays(prevDays => {
          const merged = apiDays.map((apiDay, i) => {
            const localDay = prevDays[i];
            const localOnlyTasks = localDay.tasks.filter(lt =>
              !apiDay.tasks.some(at => String(at.id) === String(lt.id))
            );
            return { ...apiDay, tasks: [...apiDay.tasks, ...localOnlyTasks] };
          });
          return merged;
        });
      }

    } catch (e) {
      setApiError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const firstName = profile?.firstName || dashboard?.userDetails?.name?.split(" ")[0] || "";
  const lastName = profile?.lastName || dashboard?.userDetails?.name?.split(" ").slice(1).join(" ") || "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || dashboard?.userDetails?.name || "Student";
  const initials = getInitials(firstName, lastName);
  const gender = profile?.gender || "";
  const dob = profile?.dateOfBirth || "";

  const track = (profile?.track) || (dashboard?.userDetails?.track) || "Frontend Track";
  const streak = (profile?.streak) || ((dashboard?.userDetails?.currentStreak) ?? 0);

  const stats = dashboard?.stats ?? {};

  const weeklyHoursRaw = dashboard?.weeklyHours ?? [];
  const weeklyHoursFromArray = Array.isArray(weeklyHoursRaw) && weeklyHoursRaw.length > 0
    ? weeklyHoursRaw.reduce((sum, d) => sum + (d.hours ?? 0), 0)
    : null;

  const weeklyHoursTotalNum = firstNumber(
    weeklyHoursFromArray,
    stats.thisWeekHours,
    dashboard?.thisWeekHours,
    stats.totalStudyHours,
    dashboard?.totalStudyHours,
    dashboard?.totalHours,
  );
  const weeklyHoursTotal = formatHours(weeklyHoursTotalNum);

  // ✅ التعديل: Tasks Today يعتمد على days array أولاً عشان يتحدث فوراً مع كل toggle
  const doneTodayCount = days[normalizedToday]?.tasks?.filter(tk => tk.done).length ?? 0;
  const totalTodayCount = days[normalizedToday]?.tasks?.length ?? 0;

  const tasksToday = firstNumber(
    stats.tasksToday > 0 ? stats.tasksToday : null,
    dashboard?.tasksToday > 0 ? dashboard.tasksToday : null,
    dashboard?.todayTasks > 0 ? dashboard.todayTasks : null,
    doneTodayCount,
  );

  const focusRooms = firstNumber(
    stats.activeStudyRooms,
    stats.focusRooms,
    dashboard?.focusRooms,
    dashboard?.activeRooms,
  );

  const resources = firstNumber(
    stats.resources,
    dashboard?.resources,
    dashboard?.totalResources,
  );

  const totalStudyHours = weeklyHoursTotal;

  const BAR_HEIGHTS = Array.isArray(weeklyHoursRaw) && weeklyHoursRaw.length > 0
    ? buildBarHeights(weeklyHoursRaw)
    : days.map(day => Math.min(day.tasks.filter(tk => tk.done).length * 20, 80));

  const maxBarHeight = Math.max(...BAR_HEIGHTS, 1);

  const activityLogs = (dashboard?.activityLogs) ?? [];
  const activityItems = formatActivity(activityLogs, accent);

  const todayStudiedFromAPI = stats.todayStudyHours ?? 0;
  const sessionHours = sessionSeconds / 3600;
  const totalTodayHours = parseFloat(todayStudiedFromAPI) + sessionHours;
  const totalTodayDisplay = totalTodayHours.toFixed(1);

  const dailyGoal = (profile?.dailyGoalHours) ?? (dashboard?.dailyGoalHours) ?? 6;
  const progressPct = dailyGoal > 0 ? Math.min(Math.round((totalTodayHours / dailyGoal) * 100), 100) : 0;
  const progressCircle = 2 * Math.PI * 20;
  const progressDash = progressCircle * (progressPct / 100);

  const toggleTask = (dayIdx, taskId) =>
    setDays(prev => prev.map((d, i) =>
      i !== dayIdx ? d : { ...d, tasks: d.tasks.map(tk => tk.id === taskId ? { ...tk, done: !tk.done } : tk) }
    ));

  const deleteTask = (dayIdx, taskId) =>
    setDays(prev => prev.map((d, i) =>
      i !== dayIdx ? d : { ...d, tasks: d.tasks.filter(tk => tk.id !== taskId) }
    ));

  const addTask = (dayIdx, text) =>
    setDays(prev => prev.map((d, i) =>
      i !== dayIdx ? d : { ...d, tasks: [...d.tasks, { id: Date.now(), text, done: false, priority: false }] }
    ));

  const card = {
    background: t["--surface"], border: `1px solid ${t["--border"]}`,
    borderRadius: 22, boxShadow: t["--sh-md"], transition: "box-shadow .25s, transform .25s",
  };

  const Skeleton = ({ w = "100%", h = 16, r = 8 }) => (
    <div style={{ width: w, height: h, borderRadius: r, background: t["--surface2"], animation: "pulse 1.5s ease-in-out infinite" }} />
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${t["--bg"]}; transition: background .35s; }
        @keyframes fadeUp   { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes breathe  { 0%,100% { box-shadow: 0 0 0 0 rgba(52,211,153,.5); } 50% { box-shadow: 0 0 0 5px rgba(52,211,153,0); } }
        @keyframes pulse    { 0%,100% { opacity:1 } 50% { opacity:.45 } }
        .fade-up { animation: fadeUp .5s ease both; }
        .fade-up:nth-child(1){ animation-delay:.04s }
        .fade-up:nth-child(2){ animation-delay:.10s }
        .fade-up:nth-child(3){ animation-delay:.16s }
        .fade-up:nth-child(4){ animation-delay:.22s }
        .card-hover:hover  { box-shadow: ${t["--sh-lg"]} !important; transform: translateY(-1px); }
        .tile-hover:hover  { box-shadow: ${t["--sh-md"]} !important; transform: translateY(-2px); }
        .task-chip-el:hover { background: ${t["--accent-soft"]} !important; color: ${accent} !important; transform: scale(1.02); }
        .task-chip-el:hover .delete-btn-el { opacity: 1 !important; }
        .add-chip-el:hover  { background: ${t["--accent-soft"]} !important; color: ${accent} !important; }
        .card-action-el:hover { opacity: .75; }
        @media (max-width: 900px) {
          .stat-strip-grid { grid-template-columns: repeat(2,1fr) !important; }
          .main-grid-el    { grid-template-columns: 1fr !important; }
          .week-grid-el    { grid-template-columns: repeat(4,1fr) !important; }
          .profile-stats-el{ display: none !important; }
        }
        @media (max-width: 600px) {
          .page-el         { padding: 1.25rem 1rem 4rem !important; }
          .stat-strip-grid { grid-template-columns: 1fr 1fr !important; }
          .week-grid-el    { grid-template-columns: repeat(3,1fr) !important; }
          .avatar-ring-el  { width: 70px !important; height: 70px !important; }
          .profile-name-el { font-size: 1.2rem !important; }
        }
      `}</style>

      {modal && (
        <AddTaskModal t={t} accent={accent} days={days} initialDayIdx={modal.dayIdx}
          onAdd={(dayIdx, text) => addTask(dayIdx, text)} onClose={() => setModal(null)} />
      )}
      {editOpen && profile && (
        <EditProfileModal t={t} accent={accent} profile={profile}
          onSave={updated => setProfile(prev => ({ ...prev, ...updated }))}
          onClose={() => setEditOpen(false)} />
      )}

      <div className="page-el" style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 2rem 5rem", display: "flex", flexDirection: "column", gap: "1.5rem", fontFamily: "'Plus Jakarta Sans', sans-serif", color: t["--text"], WebkitFontSmoothing: "antialiased" }}>

        {apiError && (
          <div style={{ padding: "12px 18px", borderRadius: 12, background: "rgba(229,62,62,.08)", border: "1px solid rgba(229,62,62,.2)", fontSize: ".82rem", color: "#e53e3e", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span>⚠ {apiError}</span>
            <button onClick={fetchAll} style={{ fontSize: ".78rem", fontWeight: 700, color: "#e53e3e", background: "transparent", border: "1px solid rgba(229,62,62,.3)", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Retry</button>
          </div>
        )}

        {/* PROFILE HEADER */}
        <div className="fade-up card-hover" style={{ ...card, padding: 0, overflow: "hidden", display: "grid", gridTemplateColumns: "1fr auto" }}>
          <div style={{ padding: "2rem", display: "flex", alignItems: "center", gap: "1.75rem" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div className="avatar-ring-el" style={{ width: 86, height: 86, borderRadius: "50%", padding: 3, background: "linear-gradient(135deg, #3D718D, #8FB7CC)" }}>
                <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "linear-gradient(150deg, #658FA5 0%, #2C3E50 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 800, color: "#fff", letterSpacing: "-.02em" }}>
                  {loading ? "…" : initials}
                </div>
              </div>
              <div style={{ position: "absolute", bottom: 4, right: 4, width: 14, height: 14, borderRadius: "50%", background: "#34D399", border: `2.5px solid ${t["--surface"]}`, animation: "breathe 2.8s ease-in-out infinite" }} />
            </div>

            <div style={{ flex: 1 }}>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Skeleton w="160px" h={22} r={10} />
                  <Skeleton w="100px" h={16} r={8} />
                  <Skeleton w="220px" h={14} r={8} />
                </div>
              ) : (
                <>
                  <div className="profile-name-el" style={{ fontSize: "1.45rem", fontWeight: 800, letterSpacing: "-.025em", color: t["--text"], marginBottom: ".35rem", lineHeight: 1.1 }}>
                    {fullName}
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: ".78rem", fontWeight: 600, color: accent, background: t["--accent-soft"], padding: "4px 11px", borderRadius: 999, marginBottom: ".75rem" }}>
                    <Icon poly={["16 18 22 12 16 6", "8 6 2 12 8 18"]} size={12} />
                    {track}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[
                      { icon: <Icon poly={["22 12 18 12 15 21 9 3 6 12 2 12"]} size={11} />, label: `${streak}-day streak` },
                      { icon: <Icon circles={[{ cx: 12, cy: 12, r: 10 }]} points="12 6 12 12 16 14" size={11} />, label: "Active now" },
                      ...(gender ? [{ icon: <Icon paths={["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"]} circles={[{ cx: 12, cy: 7, r: 4 }]} size={11} />, label: gender }] : []),
                      ...(dob ? [{ icon: <Icon paths={["M3 4h18v18H3z", "M16 2v4", "M8 2v4", "M3 10h18"]} size={11} />, label: formatDOB(dob) }] : []),
                    ].map(b => (
                      <span key={b.label} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: ".73rem", fontWeight: 600, padding: "4px 11px", borderRadius: 999, border: `1px solid ${t["--border"]}`, background: t["--surface2"], color: t["--text-2"], whiteSpace: "nowrap" }}>
                        <span style={{ color: accent }}>{b.icon}</span>{b.label}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="profile-stats-el" style={{ padding: "2rem 2.5rem 2rem 1.5rem", display: "flex", flexDirection: "column", justifyContent: "center", gap: "1rem", borderLeft: `1px solid ${t["--border"]}` }}>
            {loading ? (
              <><Skeleton w="90px" h={28} r={8} /><Skeleton w="70px" h={28} r={8} /><Skeleton w="80px" h={28} r={8} /></>
            ) : (
              <>
                {[
                  { val: totalStudyHours, unit: "h", label: "Total Study" },
                  { val: tasksToday, unit: "", label: "Tasks Done" },
                  { val: focusRooms, unit: "", label: "Sessions" },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-.03em", color: t["--text"], lineHeight: 1 }}>
                      {s.val}
                      {s.unit && <span style={{ fontSize: ".85rem", fontWeight: 500, color: t["--muted"], marginLeft: 2 }}>{s.unit}</span>}
                    </div>
                    <div style={{ fontSize: ".68rem", fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase", color: t["--muted"], marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
                <button onClick={() => setEditOpen(true)}
                  style={{ marginTop: ".25rem", padding: "7px 14px", borderRadius: 10, border: `1px solid ${t["--border"]}`, background: t["--surface2"], color: t["--text-2"], fontSize: ".75rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                  <Icon paths={["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"]} size={12} />
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>

        {/* STAT STRIP */}
        <div className="fade-up stat-strip-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem" }}>
          {[
            { grad: "#2C3E50,#3D718D", trend: "↑ 14%", up: true, icon: <Icon circles={[{ cx: 12, cy: 12, r: 10 }]} points="12 6 12 12 16 14" />, val: String(weeklyHoursTotal), sup: "h", label: "This Week" },
            { grad: "#3D718D,#658FA5", trend: "↑ 8%", up: true, icon: <Icon points="9 11 12 14 22 4" paths={["M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"]} />, val: String(tasksToday), sup: "", label: "Tasks Today" },
            { grad: "#658FA5,#8FB7CC", trend: "= same", up: false, icon: <Icon paths={["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M23 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"]} circles={[{ cx: 9, cy: 7, r: 4 }]} />, val: String(focusRooms), sup: "", label: "Focus Rooms" },
            { grad: "#8FB7CC,#b8d4e4", trend: "↑ 5%", up: true, icon: <Icon paths={["M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z", "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"]} />, val: String(resources), sup: "", label: "Resources" },
          ].map(st => (
            <div key={st.label} className="tile-hover" style={{ ...card, boxShadow: t["--sh-sm"], padding: "1.25rem 1.4rem", position: "relative", overflow: "hidden", borderTop: "none" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2.5, borderRadius: "16px 16px 0 0", background: `linear-gradient(90deg, ${st.grad})` }} />
              <div style={{ position: "absolute", top: "1.1rem", right: "1.2rem", fontSize: ".68rem", fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: st.up ? "rgba(52,211,153,.12)" : t["--surface2"], color: st.up ? (dark ? "#34d399" : "#059669") : t["--muted"] }}>{st.trend}</div>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: t["--accent-soft"], display: "flex", alignItems: "center", justifyContent: "center", marginBottom: ".85rem" }}>
                <span style={{ color: accent }}>{st.icon}</span>
              </div>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-.03em", color: t["--text"], lineHeight: 1, marginBottom: ".2rem" }}>
                {loading ? <Skeleton w="50px" h={24} r={6} /> : st.val}
                {!loading && st.sup && <sup style={{ fontSize: ".75rem", fontWeight: 600, color: t["--muted"], verticalAlign: "super", marginLeft: 1 }}>{st.sup}</sup>}
              </div>
              <div style={{ fontSize: ".72rem", fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", color: t["--muted"] }}>{st.label}</div>
              <div style={{ height: 3, background: t["--surface2"], borderRadius: 999, overflow: "hidden", marginTop: ".75rem" }}>
                <div style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #3D718D, #8FB7CC)", width: loading ? "0%" : "60%", transition: "width .9s cubic-bezier(.4,0,.2,1)" }} />
              </div>
            </div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div className="fade-up main-grid-el" style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: "1.5rem" }}>

          {/* PLANNER */}
          <div className="card-hover" style={{ ...card, padding: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.4rem" }}>
              <div style={{ fontSize: "1rem", fontWeight: 800, letterSpacing: "-.02em", color: t["--text"], display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ color: accent }}><Icon paths={["M3 4h18v18H3z", "M16 2v4", "M8 2v4", "M3 10h18"]} size={17} /></span>
                Study Planner
              </div>
              <button className="card-action-el" onClick={() => setModal({ dayIdx: normalizedToday })}
                style={{ fontSize: ".75rem", fontWeight: 700, color: accent, background: t["--accent-soft"], border: "none", padding: "5px 12px", borderRadius: 999, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "opacity .2s", letterSpacing: ".02em" }}>
                + Add Task
              </button>
            </div>

            {!loading && days.every(d => d.tasks.length === 0) && (
              <div style={{ textAlign: "center", padding: "2rem 1rem", color: t["--muted"], fontSize: ".82rem" }}>
                No tasks yet — add your first task to get started!
              </div>
            )}

            <div className="week-grid-el" style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
              {days.map((day, dayIdx) => (
                <div key={day.name} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: ".62rem", fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", textAlign: "center", paddingBottom: 6, borderBottom: `1px solid ${t["--border"]}`, color: dayIdx === normalizedToday ? accent : t["--muted"] }}>
                    {dayIdx === normalizedToday
                      ? <span style={{ display: "inline-block", background: t["--accent-soft"], borderRadius: 6, padding: "2px 6px" }}>{day.name}</span>
                      : day.name}
                  </div>
                  {day.tasks.map(task => (
                    <div key={task.id} className="task-chip-el" onClick={() => toggleTask(dayIdx, task.id)}
                      style={{ background: task.done ? t["--accent-soft"] : t["--surface2"], borderRadius: 8, padding: "7px 8px", fontSize: ".67rem", fontWeight: 600, color: task.done ? accent : t["--text-2"], lineHeight: 1.3, cursor: "pointer", transition: "background .15s, color .15s, transform .15s", border: `1px solid ${t["--border-2"]}`, display: "flex", alignItems: "flex-start", gap: 5, wordBreak: "break-word", textDecoration: task.done ? "line-through" : "none", opacity: task.done ? .65 : 1, position: "relative" }}>
                      {task.done
                        ? <Icon points="20 6 9 17 4 12" size={11} strokeWidth={2.5} />
                        : <Icon circles={[{ cx: 12, cy: 12, r: 2 }, { cx: 12, cy: 5, r: 2 }, { cx: 12, cy: 19, r: 2 }]} size={11} strokeWidth={2.5} />}
                      <span style={{ flex: 1 }}>{task.text}</span>
                      <span className="delete-btn-el" onClick={e => { e.stopPropagation(); deleteTask(dayIdx, task.id); }}
                        style={{ opacity: 0, transition: "opacity .15s", cursor: "pointer", color: t["--muted"], flexShrink: 0 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={10} height={10}>
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </span>
                    </div>
                  ))}
                  <button className="add-chip-el" onClick={() => setModal({ dayIdx })}
                    style={{ background: "transparent", borderRadius: 8, padding: "7px 8px", fontSize: ".67rem", fontWeight: 700, color: t["--muted"], lineHeight: 1.3, cursor: "pointer", transition: "background .15s, color .15s", border: `1px dashed ${t["--border"]}`, display: "flex", alignItems: "center", gap: 5, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={11} height={11}>
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

            {/* WEEKLY HOURS CHART */}
            <div className="card-hover" style={{ ...card, padding: "1.4rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.2rem" }}>
                <div style={{ fontSize: "1rem", fontWeight: 800, letterSpacing: "-.02em", color: t["--text"], display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ color: accent }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={17} height={17}>
                      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                  </span>
                  Weekly Hours
                </div>
                <span style={{ fontSize: ".7rem", color: t["--muted"], fontWeight: 600 }}>
                  {loading ? "—" : `${weeklyHoursTotal}h total`}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
                {BAR_DAYS.map((label, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
                    <div style={{ width: "100%", height: loading ? 0 : (BAR_HEIGHTS[i] || 0), borderRadius: 4, background: i === normalizedToday ? "#3D718D" : (BAR_HEIGHTS[i] === maxBarHeight && maxBarHeight > 0 ? "#3D718D" : t["--surface2"]), transition: "height .6s ease" }} />
                    <span style={{ fontSize: ".6rem", fontWeight: 700, color: i === normalizedToday ? "#3D718D" : t["--muted"], letterSpacing: ".05em" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ACTIVITY */}
            <div className="card-hover" style={{ ...card, padding: "1.4rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.2rem" }}>
                <div style={{ fontSize: "1rem", fontWeight: 800, letterSpacing: "-.02em", color: t["--text"], display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ color: accent }}><Icon poly={["22 12 18 12 15 21 9 3 6 12 2 12"]} size={17} /></span>
                  Activity
                </div>
                <button className="card-action-el" style={{ fontSize: ".75rem", fontWeight: 700, color: accent, background: t["--accent-soft"], border: "none", padding: "5px 12px", borderRadius: 999, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif", transition: "opacity .2s", letterSpacing: ".02em" }}>See all</button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.2rem", padding: "1rem", background: t["--surface2"], borderRadius: 14 }}>
                <svg viewBox="0 0 52 52" width={56} height={56} style={{ flexShrink: 0 }}>
                  <circle cx="26" cy="26" r="20" fill="none" stroke={t["--border"]} strokeWidth="5" />
                  <circle cx="26" cy="26" r="20" fill="none" stroke="url(#tg)" strokeWidth="5"
                    strokeDasharray={`${progressDash} ${progressCircle}`}
                    strokeDashoffset={`${progressCircle * 0.25}`}
                    strokeLinecap="round"
                    style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                  />
                  <defs>
                    <linearGradient id="tg" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3D718D" /><stop offset="100%" stopColor="#8FB7CC" />
                    </linearGradient>
                  </defs>
                </svg>
                <div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-.03em", color: t["--text"], lineHeight: 1 }}>
                    {loading ? "—" : `${totalTodayDisplay}h`}
                  </div>
                  <div style={{ fontSize: ".7rem", fontWeight: 600, color: t["--muted"], marginTop: 3, textTransform: "uppercase", letterSpacing: ".06em" }}>Time Today</div>
                  <div style={{ fontSize: ".72rem", color: t["--text-2"], marginTop: 4 }}>
                    Goal: <span style={{ color: accent, fontWeight: 600 }}>{dailyGoal}h</span> · {progressPct}% done
                  </div>
                </div>
              </div>

              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                  {[1, 2, 3].map(i => <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}><Skeleton w={34} h={34} r={10} /><div style={{ flex: 1 }}><Skeleton h={12} r={6} /><div style={{ marginTop: 6 }}><Skeleton w="60%" h={10} r={6} /></div></div></div>)}
                </div>
              ) : activityItems.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
                  {activityItems.map((item, i) => {
                    const iconBg = { teal: "rgba(101,143,165,0.15)", sky: "rgba(143,183,204,0.15)", navy: "rgba(44,62,80,0.12)" }[item.color] || t["--accent-soft"];
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.85rem" }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ color: accent }}>{item.icon}</span>
                        </div>
                        <div>
                          <div style={{ fontSize: ".8rem", fontWeight: 500, color: t["--text-2"], lineHeight: 1.4 }}>{item.text}</div>
                          <div style={{ fontSize: ".7rem", color: t["--muted"], marginTop: 3 }}>{item.time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "1rem", color: t["--muted"], fontSize: ".8rem" }}>
                  No recent activity yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
