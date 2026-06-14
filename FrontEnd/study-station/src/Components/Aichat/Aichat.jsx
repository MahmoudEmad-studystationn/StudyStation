import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useThemeContext } from "../Theme/ThemeContext";
import {
    uploadFile, getConversations, getConversationMessages, deleteConversation,
} from "../Services/AiServices";

import ChatHeader from "./ChatHeader";
import ChatSidebar from "./ChatSidebar";
import ChatWelcome from "./ChatWelcome";
import ChatInputArea from "./ChatInputArea";
import QuizView from "./QuizView";
import FlashcardsView from "./FlashcardsView";
import ExplainView from "./ExplainView";
import { Toast, TypingDots, MessageBubble } from "./ChatComponents";
import {
    MODE_CONFIG, createEmptyModeState, createInitialContextStates,
} from "./constants";
import {
    nowTime, extractReply, dispatchByContext, mapConversationMessages,
    resolveGeneratedContent, getEmptyContentMessage,
} from "./helpers";

export const openChatEvent = {
    dispatch: () => window.dispatchEvent(new CustomEvent("open-ai-chat")),
};

let msgIdCounter = 0;
function nextMsgId() {
    msgIdCounter += 1;
    return `msg-${Date.now()}-${msgIdCounter}`;
}

export default function AiChat() {
    const { isDarkMode } = useThemeContext();
    const navigate = useNavigate();
    const isDark = isDarkMode;

    const bgColor       = isDark ? "#171717" : "#F3F4F6";
    const cardBg        = isDark ? "#2A2A2A" : "white";
    const sidebarBg     = isDark ? "#1f1f1f" : "#ffffff";
    const textPrimary   = isDark ? "#E0E0E0" : "#2f3b48";
    const textSecondary = isDark ? "#B0B0B0" : "#6b6f76";
    const borderColor   = isDark ? "#404040" : "#d1d5db";
    const iconBg        = isDark ? "#363636" : "#eef1f4";
    const inputBg       = isDark ? "#363636" : "#ffffff";
    const muted         = isDark ? "#6B7A86" : "#8A9BAA";
    const border2       = isDark ? "#505050" : "#c4cdd6";
    const cardShadow    = isDark ? "0 8px 16px rgba(0,0,0,0.3)" : "0 8px 16px rgba(0,0,0,0.07)";

    const [context, setContext] = useState("general");
    const [contextStates, setContextStates] = useState(createInitialContextStates);
    const [isTyping, setIsTyping] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [uploadedFileId, setUploadedFileId] = useState(null);
    const [uploadedFileName, setUploadedFileName] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState({ visible: false, msg: "", type: "success" });
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [lastFailedPrompt, setLastFailedPrompt] = useState(null);

    const { messages, conversationId, structuredResult, inputVal } = contextStates[context];

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

    const patchContext = useCallback((ctx, patch) => {
        setContextStates(prev => ({
            ...prev,
            [ctx]: { ...prev[ctx], ...patch },
        }));
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [context, messages, isTyping, structuredResult]);

    useEffect(() => { loadConversations(); }, []);

    async function loadConversations() {
        try {
            const data = await getConversations();
            const list = Array.isArray(data) ? data : data?.conversations ?? [];
            setConversations(list);
        } catch { /* silent */ }
    }

    function showToast(msg, type = "success") {
        setToast({ visible: true, msg, type });
        setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
    }

    const startNewChat = useCallback(() => {
        patchContext(context, createEmptyModeState());
        setUploadedFileId(null);
        setUploadedFileName(null);
        setLastFailedPrompt(null);
        inputRef.current?.focus();
    }, [context, patchContext]);

    const handleSend = useCallback(async (overrideText, overrideContext) => {
        const activeContext = overrideContext ?? context;
        const text = (overrideText ?? contextStates[activeContext].inputVal).trim();
        if (!text || isTyping) return;

        const fileIdToSend = uploadedFileId;
        const fileNameToSend = uploadedFileName;

        const userMsg = {
            id: nextMsgId(), role: "user", text,
            time: nowTime(), file: fileNameToSend,
        };

        let convIdForRequest = null;
        setContextStates(prev => {
            convIdForRequest = prev[activeContext].conversationId;
            return {
                ...prev,
                [activeContext]: {
                    ...prev[activeContext],
                    messages: [...prev[activeContext].messages, userMsg],
                    inputVal: "",
                    structuredResult: null,
                },
            };
        });

        setUploadedFileId(null);
        setUploadedFileName(null);
        setLastFailedPrompt(null);
        setIsTyping(true);

        try {
            const data = await dispatchByContext(activeContext, text, convIdForRequest, fileIdToSend);

            if (data?.conversationId) {
                setContextStates(prev => ({
                    ...prev,
                    [activeContext]: {
                        ...prev[activeContext],
                        conversationId: data.conversationId,
                    },
                }));
            }

            const isSpecialMode = ["quiz", "flashcards", "explain"].includes(activeContext);

            if (isSpecialMode) {
                const { structured, success } = await resolveGeneratedContent(data, activeContext);

                if (success && structured) {
                    setContextStates(prev => ({
                        ...prev,
                        [activeContext]: {
                            ...prev[activeContext],
                            structuredResult: {
                                type: structured.type,
                                payload: structured.payload,
                                topic: text,
                            },
                        },
                    }));
                } else {
                    setLastFailedPrompt({ text, context: activeContext });
                    setContextStates(prev => ({
                        ...prev,
                        [activeContext]: {
                            ...prev[activeContext],
                            messages: [
                                ...prev[activeContext].messages,
                                {
                                    id: nextMsgId(),
                                    role: "ai",
                                    text: getEmptyContentMessage(activeContext, text),
                                    time: nowTime(),
                                    isError: true,
                                },
                            ],
                        },
                    }));
                }
            } else {
                const reply = extractReply(data);
                setContextStates(prev => ({
                    ...prev,
                    [activeContext]: {
                        ...prev[activeContext],
                        messages: [
                            ...prev[activeContext].messages,
                            {
                                id: nextMsgId(),
                                role: "ai",
                                text: reply || "I received your message but got an empty response. Please try again.",
                                time: nowTime(),
                            },
                        ],
                    },
                }));
            }

            loadConversations();
        } catch (err) {
            setLastFailedPrompt({ text, context: activeContext });
            setContextStates(prev => ({
                ...prev,
                [activeContext]: {
                    ...prev[activeContext],
                    messages: [
                        ...prev[activeContext].messages,
                        {
                            id: nextMsgId(),
                            role: "ai",
                            text: `Sorry, something went wrong.\n${err.message}`,
                            time: nowTime(),
                            isError: true,
                        },
                    ],
                },
            }));
        } finally {
            setIsTyping(false);
            inputRef.current?.focus();
        }
    }, [context, contextStates, isTyping, uploadedFileId, uploadedFileName]);

    async function handleSelectConversation(id) {
        try {
            const data = await getConversationMessages(id);
            setContext("general");
            patchContext("general", {
                conversationId: id,
                structuredResult: null,
                messages: mapConversationMessages(data).map(m => ({ ...m, id: nextMsgId() })),
            });
        } catch {
            showToast("Failed to load conversation", "error");
        }
    }

    async function handleDeleteConversation(id) {
        try {
            await deleteConversation(id);
            setConversations(prev => prev.filter(c => c.id !== id));
            if (conversationId === id) startNewChat();
            showToast("Conversation deleted");
        } catch {
            showToast("Failed to delete", "error");
        }
    }

    async function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const data = await uploadFile(file);
            const id = data?.fileId ?? data?.id ?? data?.uploadedFileId;
            setUploadedFileId(id);
            setUploadedFileName(file.name);
            showToast(`"${file.name}" uploaded`);
        } catch {
            showToast("Upload failed", "error");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    }

    function handleCopy(text) {
        navigator.clipboard.writeText(text).then(() => showToast("Copied!"));
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    function handleInputChange(e) {
        patchContext(context, { inputVal: e.target.value });
        e.target.style.height = "auto";
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
    }

    function handleContextChange(key) {
        if (key === context) return;
        setContext(key);
        setLastFailedPrompt(null);
        inputRef.current?.focus();
    }

    function handleExampleClick(prompt) {
        handleSend(prompt, context);
    }

    function handleStructuredReset() {
        patchContext(context, { structuredResult: null, messages: [] });
        setLastFailedPrompt(null);
    }

    function handleRetry() {
        if (lastFailedPrompt) {
            handleSend(lastFailedPrompt.text, lastFailedPrompt.context);
        }
    }

    const showWelcome = messages.length === 0 && !structuredResult && !isTyping;
    const themeProps = { isDark, textPrimary, textSecondary, cardBg, borderColor };
    const loadingText = MODE_CONFIG[context]?.loadingText;

    return (
        <div style={{
            display: "flex", flexDirection: "column", height: "100vh",
            background: bgColor, color: textPrimary,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: "15px",
            transition: "background 0.3s, color 0.3s",
        }}>
            <ChatHeader
                context={context}
                onBack={() => navigate("/home")}
                onToggleSidebar={() => setSidebarOpen(o => !o)}
                onNewChat={startNewChat}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                muted={muted}
                borderColor={borderColor}
                cardBg={cardBg}
                cardShadow={cardShadow}
                iconBg={iconBg}
            />

            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                {sidebarOpen && (
                    <ChatSidebar
                        context={context}
                        conversations={conversations}
                        conversationId={conversationId}
                        sidebarBg={sidebarBg}
                        borderColor={borderColor}
                        border2={border2}
                        textPrimary={textPrimary}
                        muted={muted}
                        onContextChange={handleContextChange}
                        onNewChat={startNewChat}
                        onSelect={handleSelectConversation}
                        onDelete={handleDeleteConversation}
                        isDark={isDark}
                    />
                )}

                <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: bgColor }}>
                    <div style={{
                        flex: 1, overflowY: "auto", padding: "22px 22px",
                        display: "flex", flexDirection: "column", gap: 20,
                        scrollbarWidth: "thin",
                    }}>
                        {showWelcome && (
                            <ChatWelcome
                                context={context}
                                isDark={isDark}
                                textPrimary={textPrimary}
                                textSecondary={textSecondary}
                                cardBg={cardBg}
                                border2={border2}
                                onExampleClick={handleExampleClick}
                            />
                        )}

                        {messages.map(msg => (
                            <MessageBubble
                                key={msg.id}
                                msg={msg}
                                isDark={isDark}
                                onCopy={handleCopy}
                                muted={muted}
                            />
                        ))}

                        {lastFailedPrompt && !isTyping && (
                            <div style={{ display: "flex", justifyContent: "center" }}>
                                <button
                                    onClick={handleRetry}
                                    style={{
                                        padding: "10px 20px", borderRadius: 12,
                                        border: "none", background: "#4e87a8", color: "#fff",
                                        fontSize: "14px", fontWeight: 600, cursor: "pointer",
                                        fontFamily: "inherit",
                                    }}
                                >
                                    Retry generation
                                </button>
                            </div>
                        )}

                        {isTyping && <TypingDots isDark={isDark} message={loadingText} />}

                        {structuredResult?.type === "quiz" && (
                            <QuizView
                                questions={structuredResult.payload}
                                topic={structuredResult.topic}
                                {...themeProps}
                                onReset={handleStructuredReset}
                            />
                        )}

                        {structuredResult?.type === "flashcards" && (
                            <FlashcardsView
                                cards={structuredResult.payload}
                                topic={structuredResult.topic}
                                {...themeProps}
                                onReset={handleStructuredReset}
                            />
                        )}

                        {structuredResult?.type === "explain" && (
                            <ExplainView
                                data={structuredResult.payload}
                                topic={structuredResult.topic}
                                {...themeProps}
                                onCopy={handleCopy}
                            />
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <ChatInputArea
                        context={context}
                        messagesCount={messages.length}
                        inputVal={inputVal}
                        isTyping={isTyping}
                        uploading={uploading}
                        uploadedFileName={uploadedFileName}
                        inputRef={inputRef}
                        fileInputRef={fileInputRef}
                        onInputChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onSend={handleSend}
                        onFileChange={handleFileChange}
                        onClearFile={() => { setUploadedFileId(null); setUploadedFileName(null); }}
                        textPrimary={textPrimary}
                        muted={muted}
                        inputBg={inputBg}
                        border2={border2}
                        cardBg={cardBg}
                        borderColor={borderColor}
                        isDark={isDark}
                    />
                </main>
            </div>

            <Toast message={toast.msg} visible={toast.visible} type={toast.type} />
        </div>
    );
}
