import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faRobot } from "@fortawesome/free-solid-svg-icons";
import { SidebarConvItem } from "./ChatComponents";
import ModeSelector from "./ModeSelector";
import { MODE_CONFIG, C, FONT } from "./constants";

export default function ChatSidebar({
    context, conversations, conversationId, isDark, sidebarBg, borderColor, border2,
    textPrimary, muted, onContextChange, onNewChat, onSelect, onDelete,
}) {
    const showConversations = MODE_CONFIG[context]?.showConversations;

    return (
        <aside style={{
            width: 270, background: sidebarBg,
            borderRight: `1px solid ${borderColor}`,
            display: "flex", flexDirection: "column", flexShrink: 0,
            overflow: "hidden",
            boxShadow: isDark ? "2px 0 8px rgba(0,0,0,0.2)" : "2px 0 8px rgba(0,0,0,0.04)",
        }}>
            <ModeSelector
                context={context}
                onContextChange={onContextChange}
                isDark={isDark}
                borderColor={borderColor}
                textPrimary={textPrimary}
                muted={muted}
            />

            <div style={{ padding: "10px 10px 8px" }}>
                <button
                    onClick={onNewChat}
                    style={{
                        width: "100%", padding: "10px 14px", borderRadius: 12,
                        border: `1px solid ${border2}`, background: "transparent",
                        color: textPrimary, fontSize: FONT.sm, fontWeight: 600, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 9, fontFamily: "inherit",
                        transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.navy; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = C.navy; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = textPrimary; e.currentTarget.style.borderColor = border2; }}
                >
                    <FontAwesomeIcon icon={faPenToSquare} /> New in {MODE_CONFIG[context]?.shortLabel}
                </button>
            </div>

            {showConversations && (
                <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px 10px" }}>
                    {conversations.length === 0 ? (
                        <div style={{ textAlign: "center", color: muted, fontSize: FONT.sm, padding: "1.5rem 1rem" }}>
                            No conversations yet
                        </div>
                    ) : (
                        <>
                            <div style={{
                                fontSize: 10, fontWeight: 700, color: muted,
                                textTransform: "uppercase", letterSpacing: "0.07em",
                                padding: "0 8px 8px",
                            }}>Recent Chats</div>
                            {conversations.map(conv => (
                                <SidebarConvItem
                                    key={conv.id} conv={conv}
                                    active={conv.id === conversationId}
                                    isDark={isDark}
                                    onSelect={onSelect}
                                    onDelete={onDelete}
                                    textPrimary={textPrimary}
                                    muted={muted}
                                />
                            ))}
                        </>
                    )}
                </div>
            )}

            {!showConversations && (
                <div style={{
                    flex: 1, padding: "12px 14px", margin: "0 10px 10px",
                    borderRadius: 12, fontSize: FONT.sm, color: muted, lineHeight: 1.65,
                    background: isDark ? "rgba(255,255,255,0.03)" : "rgba(44,62,80,0.03)",
                    border: `1px dashed ${borderColor}`,
                }}>
                    {MODE_CONFIG[context]?.description}
                </div>
            )}

            <div style={{ borderTop: `1px solid ${borderColor}`, padding: 14 }}>
                <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", borderRadius: 12,
                    background: isDark ? "rgba(78,135,168,0.12)" : "rgba(78,135,168,0.08)",
                    border: `1px solid rgba(78,135,168,0.2)`,
                }}>
                    <FontAwesomeIcon icon={faRobot} style={{ color: C.ocean, fontSize: 16 }} />
                    <div style={{ fontSize: FONT.sm, fontWeight: 700, color: C.ocean }}>Study Station AI</div>
                </div>
            </div>
        </aside>
    );
}
