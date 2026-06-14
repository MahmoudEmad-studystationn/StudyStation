import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faPaperclip, faSpinner, faTimes } from "@fortawesome/free-solid-svg-icons";
import { ContextHint } from "./ContextToolbar";
import { C, FONT } from "./constants";

const PLACEHOLDERS = {
    quiz: "Enter a topic — e.g. HTML tags, JavaScript, C#…",
    flashcards: "Enter a topic — e.g. Git commands, API terms…",
    explain: "Enter a concept — e.g. JWT, async/await…",
    summarize: "Enter a topic to summarize — e.g. HTTP methods…",
    general: "Ask about frontend, backend, or anything…",
};

export default function ChatInputArea({
    context, messagesCount, inputVal, isTyping, uploading,
    uploadedFileName, inputRef, fileInputRef,
    onInputChange, onKeyDown, onSend, onFileChange, onClearFile,
    textPrimary, muted, inputBg, border2, cardBg, borderColor, isDark,
}) {
    const showHint = messagesCount === 0 && !isTyping;

    return (
        <div style={{
            padding: "14px 18px", background: cardBg,
            borderTop: `1px solid ${borderColor}`, flexShrink: 0,
        }}>
            {showHint && <ContextHint context={context} />}

            {uploadedFileName && (
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: "5px 12px", borderRadius: 999, marginBottom: 10,
                    background: "rgba(78,135,168,0.1)",
                    border: `1px solid rgba(78,135,168,0.2)`,
                    fontSize: FONT.sm, color: C.ocean, fontWeight: 600,
                }}>
                    <FontAwesomeIcon icon={faPaperclip} /> {uploadedFileName}
                    <button
                        onClick={onClearFile}
                        style={{ background: "none", border: "none", cursor: "pointer", color: C.ocean, fontSize: 14 }}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
            )}

            <div style={{
                display: "flex", alignItems: "flex-end", gap: 10,
                background: inputBg, border: `1.5px solid ${border2}`,
                borderRadius: 16, padding: "10px 12px 10px 16px",
            }}>
                <input type="file" ref={fileInputRef} onChange={onFileChange} style={{ display: "none" }} />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{
                        background: "none", border: "none",
                        cursor: uploading ? "not-allowed" : "pointer",
                        color: uploading ? C.ocean : muted, fontSize: 18,
                        display: "flex", alignItems: "center", padding: "2px 4px",
                    }}
                    title="Attach file"
                >
                    <FontAwesomeIcon icon={uploading ? faSpinner : faPaperclip} spin={uploading} />
                </button>

                <textarea
                    ref={inputRef}
                    value={inputVal}
                    onChange={onInputChange}
                    onKeyDown={onKeyDown}
                    placeholder={PLACEHOLDERS[context] || PLACEHOLDERS.general}
                    rows={1}
                    style={{
                        flex: 1, border: "none", outline: "none",
                        background: "transparent", color: textPrimary,
                        fontSize: FONT.base, fontFamily: "inherit",
                        resize: "none", minHeight: 24, maxHeight: 120,
                        lineHeight: 1.55, padding: "2px 0",
                    }}
                />

                <button
                    onClick={() => onSend()}
                    disabled={!inputVal.trim() || isTyping}
                    style={{
                        width: 38, height: 38, borderRadius: 12,
                        border: "none", flexShrink: 0,
                        background: !inputVal.trim() || isTyping
                            ? (isDark ? "#363636" : "#e8eaed") : C.navy,
                        color: !inputVal.trim() || isTyping ? muted : "#fff",
                        cursor: !inputVal.trim() || isTyping ? "default" : "pointer",
                        fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { if (inputVal.trim() && !isTyping) e.currentTarget.style.background = C.ocean; }}
                    onMouseLeave={e => { if (inputVal.trim() && !isTyping) e.currentTarget.style.background = C.navy; }}
                >
                    <FontAwesomeIcon icon={faPaperPlane} />
                </button>
            </div>
            <div style={{ textAlign: "center", fontSize: FONT.xs, color: muted, marginTop: 8 }}>
                Press <strong>Enter</strong> to send · <strong>Shift+Enter</strong> for new line
            </div>
        </div>
    );
}
