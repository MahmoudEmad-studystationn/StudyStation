import { useState, useEffect } from "react";
import { createRoom } from "../Services/studyWithFriendsService";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  .crm-overlay {
    position: fixed; inset: 0; z-index: 800;
    background: rgba(28,43,56,.55); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 1.5rem;
    opacity: 0; pointer-events: none; transition: opacity .3s;
  }
  .crm-overlay.open { opacity: 1; pointer-events: all; }
  .crm-modal {
    background: var(--surface, #fff);
    border: 1px solid var(--border, rgba(44,62,80,0.08));
    border-radius: 26px;
    box-shadow: 0 8px 24px rgba(44,62,80,.08), 0 32px 80px rgba(44,62,80,.14);
    width: 100%; max-width: 540px; max-height: 90vh;
    overflow-y: auto; overflow-x: hidden;
    transform: translateY(20px) scale(.97); opacity: 0;
    transition: transform .45s cubic-bezier(.34,1.56,.64,1), opacity .3s ease;
    scrollbar-width: thin;
    font-family: 'Plus Jakarta Sans', sans-serif; -webkit-font-smoothing: antialiased;
  }
  .crm-overlay.open .crm-modal { transform: translateY(0) scale(1); opacity: 1; }
  .crm-bar { height: 4px; background: linear-gradient(90deg,#2C3E50,#3D718D,#658FA5,#8FB7CC); }
  .crm-header {
    padding: 1.75rem 2rem 0;
    display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;
    margin-bottom: 1.5rem;
  }
  .crm-eyebrow {
    font-size: .65rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase;
    color: var(--muted, #8A9BAA); margin-bottom: .3rem;
  }
  .crm-title { font-size: 1.2rem; font-weight: 800; letter-spacing: -.025em; color: var(--text,#1C2B38); }
  .crm-close {
    width: 34px; height: 34px; border-radius: 10px;
    background: var(--surface2,#EAECF0); border: 1px solid var(--border,rgba(44,62,80,0.08));
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; flex-shrink: 0; color: var(--muted,#8A9BAA); transition: background .2s, color .2s;
  }
  .crm-close:hover { background: var(--border,rgba(44,62,80,0.08)); color: var(--text,#1C2B38); }
  .crm-close:disabled { opacity: .5; cursor: not-allowed; }
  .crm-body { padding: 0 2rem 1.5rem; display: flex; flex-direction: column; gap: 1.1rem; }
  .crm-field { display: flex; flex-direction: column; gap: 5px; }
  .crm-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .crm-label {
    font-size: .75rem; font-weight: 700; color: var(--text2,#4A5568);
    letter-spacing: .02em; display: block; margin-bottom: 5px;
  }
  .crm-label span { color: var(--muted,#8A9BAA); font-weight: 500; }
  .crm-input, .crm-textarea, .crm-select {
    padding: 10px 13px; background: var(--surface3,#f8f9fb);
    border: 1px solid var(--border,rgba(44,62,80,0.08)); border-radius: 14px;
    font-family: 'Plus Jakarta Sans',sans-serif; font-size: .875rem;
    color: var(--text,#1C2B38); outline: none; width: 100%;
    transition: border .2s, box-shadow .2s; -webkit-appearance: none; appearance: none; box-sizing: border-box;
  }
  .crm-input::placeholder, .crm-textarea::placeholder { color: var(--muted,#8A9BAA); }
  .crm-input:focus, .crm-textarea:focus, .crm-select:focus {
    border-color: #8FB7CC; box-shadow: 0 0 0 3px rgba(143,183,204,.18); background: var(--surface,#fff);
  }
  .crm-input.error, .crm-select.error, .crm-textarea.error {
    border-color: #f87171; box-shadow: 0 0 0 3px rgba(248,113,113,.15);
  }
  .crm-input:disabled, .crm-select:disabled, .crm-textarea:disabled { opacity: .6; cursor: not-allowed; }
  .crm-textarea { resize: vertical; min-height: 78px; }
  .crm-type-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .crm-type-lbl {
    display: flex; align-items: center; justify-content: center; gap: 7px;
    padding: 10px 12px; border-radius: 14px;
    border: 1.5px solid var(--border,rgba(44,62,80,0.08));
    cursor: pointer; font-size: .83rem; font-weight: 600; color: var(--text2,#4A5568);
    background: var(--surface3,#f8f9fb); transition: all .2s; font-family: 'Plus Jakarta Sans',sans-serif;
  }
  .crm-type-lbl:hover { border-color: #8FB7CC; color: var(--text,#1C2B38); background: var(--surface,#fff); }
  .crm-type-lbl.active { border-color: #3D718D; background: rgba(61,113,141,.09); color: #3D718D; }
  [data-theme="dark"] .crm-type-lbl.active { border-color: #8FB7CC; background: rgba(143,183,204,.1); color: #8FB7CC; }
  .crm-roomcode-wrap {
    overflow: hidden; max-height: 0; opacity: 0;
    transition: max-height .35s ease, opacity .3s ease, margin .3s ease; margin-top: 0;
  }
  .crm-roomcode-wrap.visible { max-height: 80px; opacity: 1; margin-top: .5rem; }
  .crm-error-msg { font-size: .7rem; font-weight: 600; color: #f87171; margin-top: 3px; }
  .crm-footer {
    padding: 1.25rem 2rem 1.75rem; display: flex; gap: .75rem; justify-content: flex-end;
    border-top: 1px solid var(--border,rgba(44,62,80,0.08));
  }
  .crm-btn-cancel {
    padding: 10px 20px; border-radius: 14px; border: 1px solid var(--border,rgba(44,62,80,0.08));
    background: transparent; color: var(--text2,#4A5568);
    font-family: 'Plus Jakarta Sans',sans-serif; font-size: .875rem; font-weight: 600;
    cursor: pointer; transition: all .2s;
  }
  .crm-btn-cancel:hover { background: var(--surface2,#EAECF0); }
  .crm-btn-cancel:disabled { opacity: .5; cursor: not-allowed; }
  .crm-btn-submit {
    padding: 10px 24px; border-radius: 14px; border: none; background: #2C3E50; color: #fff;
    font-family: 'Plus Jakarta Sans',sans-serif; font-size: .875rem; font-weight: 700;
    cursor: pointer; transition: all .2s; display: flex; align-items: center; gap: 7px;
    letter-spacing: -.01em; min-width: 130px; justify-content: center;
  }
  .crm-btn-submit:hover:not(:disabled) { background: #3D718D; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(44,62,80,.22); }
  .crm-btn-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }
  .crm-spinner {
    width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.3);
    border-top-color: #fff; border-radius: 50%; animation: crmSpin .7s linear infinite;
  }
  @keyframes crmSpin { to { transform: rotate(360deg); } }
  @media (max-width: 580px) {
    .crm-header, .crm-body, .crm-footer { padding-left: 1.25rem; padding-right: 1.25rem; }
    .crm-field-row { grid-template-columns: 1fr; }
  }
`;

const SUBJECTS = ["Computer Science", "Frontend", "Backend", "AI / ML", "Design", "Mathematics", "General"];

export default function CreateRoomModal({ isOpen, onClose, onCreated, isDarkMode }) {
    const [roomName, setRoomName] = useState("");
    const [description, setDescription] = useState("");
    const [subject, setSubject] = useState("");
    const [maxParticipants, setMaxParticipants] = useState(8);
    const [roomType, setRoomType] = useState("public");
    const [roomCode, setRoomCode] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        function onKey(e) { if (e.key === "Escape" && !loading) handleClose(); }
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [loading]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    function handleClose() {
        if (loading) return;
        setRoomName(""); setDescription(""); setSubject("");
        setMaxParticipants(8); setRoomType("public"); setRoomCode(""); setErrors({});
        onClose();
    }

    function overlayClick(e) { if (e.target === e.currentTarget) handleClose(); }

    const validate = () => {
        const e = {};
        if (!roomName.trim()) e.roomName = "Room name is required.";
        if (!subject) e.subject = "Please select a subject.";
        if (roomType === "private" && !roomCode.trim())
            e.roomCode = "Room code is required for private rooms.";
        const mp = Number(maxParticipants);
        if (isNaN(mp) || mp < 2 || mp > 100)
            e.maxParticipants = "Must be between 2 and 100.";
        return e;
    };

    const handleSubmit = async () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setErrors({});
        setLoading(true);
        const payload = {
            name: roomName.trim(),
            description: description.trim() || null,
            subject,
            isPublic: roomType === "public",
            maxParticipants: Number(maxParticipants),
            ...(roomType === "private" && { roomCode: roomCode.trim() }),
        };

        try {
            const newRoom = await createRoom(payload);
            onCreated(newRoom.name ?? roomName, newRoom.id ?? newRoom.roomId);
            handleClose();
        } catch (err) {
            setErrors({ submit: err?.response?.data?.message ?? err?.message ?? "Something went wrong." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{styles}</style>
            <div
                className={`crm-overlay${isOpen ? " open" : ""}`}
                onClick={overlayClick}
                data-theme={isDarkMode ? "dark" : "light"}
                style={isDarkMode ? {
                    "--surface": "#1f1f1f", "--surface2": "#2a2a2a", "--surface3": "#252525",
                    "--border": "rgba(255,255,255,0.07)",
                    "--text": "#EDF2F7", "--text2": "#A0AEC0", "--muted": "#8A9BAA",
                } : {}}
            >
                <div className="crm-modal">
                    <div className="crm-bar" />

                    {/* Header */}
                    <div className="crm-header">
                        <div>
                            <div className="crm-eyebrow">Study Station</div>
                            <div className="crm-title">Create a Study Room</div>
                        </div>
                        <button className="crm-close" onClick={handleClose} disabled={loading}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    <div className="crm-body">
                        {/* Room Name */}
                        <div className="crm-field">
                            <label className="crm-label">Room Name <span>*</span></label>
                            <input
                                className={`crm-input${errors.roomName ? " error" : ""}`}
                                value={roomName}
                                onChange={e => { setRoomName(e.target.value); setErrors(er => ({ ...er, roomName: "" })); }}
                                disabled={loading}
                            />
                            {errors.roomName && <span className="crm-error-msg">{errors.roomName}</span>}
                        </div>

                        {/* Description */}
                        <div className="crm-field">
                            <label className="crm-label">Description <span>(optional)</span></label>
                            <textarea
                                className="crm-textarea"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        {/* Subject + Max Participants — side by side */}
                        <div className="crm-field-row">
                            <div className="crm-field">
                                <label className="crm-label">Study Subject <span>*</span></label>
                                <select
                                    className={`crm-select${errors.subject ? " error" : ""}`}
                                    value={subject}
                                    onChange={e => { setSubject(e.target.value); setErrors(er => ({ ...er, subject: "" })); }}
                                    disabled={loading}
                                >
                                    <option value="">Select subject…</option>
                                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                {errors.subject && <span className="crm-error-msg">{errors.subject}</span>}
                            </div>

                            <div className="crm-field">
                                <label className="crm-label">Max Participants</label>
                                <input
                                    className={`crm-input${errors.maxParticipants ? " error" : ""}`}
                                    type="number"
                                    min={2}
                                    max={100}
                                    value={maxParticipants}
                                    onChange={e => { setMaxParticipants(e.target.value); setErrors(er => ({ ...er, maxParticipants: "" })); }}
                                    disabled={loading}
                                />
                                {errors.maxParticipants && <span className="crm-error-msg">{errors.maxParticipants}</span>}
                            </div>
                        </div>

                        {/* Room Type */}
                        <div className="crm-field">
                            <label className="crm-label">Room Type</label>
                            <div className="crm-type-toggle">
                                <button
                                    className={`crm-type-lbl${roomType === "public" ? " active" : ""}`}
                                    onClick={() => { setRoomType("public"); setRoomCode(""); setErrors(er => ({ ...er, roomCode: "" })); }}
                                    disabled={loading}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                    </svg>
                                    Public
                                </button>
                                <button
                                    className={`crm-type-lbl${roomType === "private" ? " active" : ""}`}
                                    onClick={() => setRoomType("private")}
                                    disabled={loading}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                    Private
                                </button>
                            </div>
                            <div className={`crm-roomcode-wrap${roomType === "private" ? " visible" : ""}`}>
                                <input
                                    className={`crm-input${errors.roomCode ? " error" : ""}`}
                                    type="text" placeholder="Enter a room code (e.g. SEC123)"
                                    value={roomCode}
                                    onChange={e => { setRoomCode(e.target.value); setErrors(er => ({ ...er, roomCode: "" })); }}
                                    disabled={loading}
                                />
                                {errors.roomCode && <span className="crm-error-msg">{errors.roomCode}</span>}
                            </div>
                        </div>

                        {errors.submit && (
                            <span className="crm-error-msg" style={{ textAlign: "center" }}>{errors.submit}</span>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="crm-footer">
                        <button className="crm-btn-cancel" onClick={handleClose} disabled={loading}>Cancel</button>
                        <button className="crm-btn-submit" onClick={handleSubmit} disabled={loading}>
                            {loading
                                ? <><div className="crm-spinner" /> Creating…</>
                                : <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    Create Room
                                </>
                            }
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}