import {
    sendChat, summarize, generateQuiz, generateFlashcards, explainConcept,
    getGeneratedContentById,
} from "../Services/AiServices";

export function nowTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function extractReply(data) {
    if (typeof data === "string") return data;
    if (!data || typeof data !== "object") return String(data ?? "");

    const direct =
        data.message ?? data.response ?? data.content ?? data.reply
        ?? data.summary ?? data.explanation ?? data.text ?? data.answer;

    if (typeof direct === "string" && direct.trim()) return direct;

    if (data.data) {
        const nested = extractReply(data.data);
        if (nested && !nested.startsWith("{")) return nested;
    }

    if (data.title && typeof data.title === "string") return data.title;

    return "";
}

function pickString(obj, keys) {
    for (const key of keys) {
        const val = obj?.[key];
        if (typeof val === "string" && val.trim()) return val.trim();
    }
    return "";
}

function normalizeOptions(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) {
        return raw.map(o => {
            if (typeof o === "string") return o;
            if (typeof o === "object" && o !== null) {
                return o.text ?? o.label ?? o.option ?? o.value ?? o.answer ?? JSON.stringify(o);
            }
            return String(o);
        });
    }
    return [];
}

function getCorrectIndex(q, options) {
    if (typeof q.correctAnswer === "number") return q.correctAnswer;
    if (typeof q.correctIndex === "number") return q.correctIndex;
    if (typeof q.correctOptionIndex === "number") return q.correctOptionIndex;

    const answerText = pickString(q, [
        "correctAnswer", "correct", "answer", "correctOption", "correctChoice",
    ]);
    if (answerText) {
        const idx = options.findIndex(o =>
            o.toLowerCase() === answerText.toLowerCase()
            || o.toLowerCase().startsWith(answerText.toLowerCase())
        );
        if (idx >= 0) return idx;
    }
    return options.findIndex(o => o === q.correctAnswer || o === q.answer);
}

export function normalizeQuizQuestions(raw) {
    const list = Array.isArray(raw) ? raw : raw?.questions ?? raw?.items ?? [];
    if (!Array.isArray(list)) return [];

    return list.map((item, i) => {
        if (typeof item === "string") {
            return { question: item, options: [], correctAnswer: 0, explanation: "" };
        }

        const options = normalizeOptions(
            item.options ?? item.choices ?? item.answers ?? item.Options ?? item.Choices
        );

        const question = pickString(item, [
            "question", "text", "prompt", "Question", "questionText",
            "title", "query", "stem", "body", "content",
        ]) || (options.length === 0 ? `Question ${i + 1}` : "");

        return {
            ...item,
            question,
            options,
            correctAnswer: getCorrectIndex(item, options),
            explanation: pickString(item, ["explanation", "hint", "reason", "feedback"]),
        };
    }).filter(q => q.question || q.options.length > 0);
}

function normalizeFlashcards(raw) {
    const list = Array.isArray(raw) ? raw : raw?.flashcards ?? raw?.cards ?? raw?.items ?? [];
    if (!Array.isArray(list)) return [];

    return list.map(item => {
        if (typeof item === "string") {
            return { front: item, back: "" };
        }
        const front = pickString(item, ["term", "front", "question", "word", "title", "Term", "Front"]);
        const back = pickString(item, [
            "definition", "back", "answer", "meaning", "description",
            "Definition", "Back", "Answer",
        ]);
        return { ...item, front, back };
    }).filter(c => c.front || c.back);
}

export function extractStructured(data, context) {
    if (!data) return null;

    const root = data.data ?? data.result ?? data.payload ?? data.content ?? data;

    if (context === "quiz" || !context) {
        const quizRaw =
            root.questions ?? root.quiz?.questions ?? root.quiz
            ?? (Array.isArray(root) && root[0]?.question ? root : null)
            ?? (Array.isArray(root) && root[0]?.options ? root : null)
            ?? (Array.isArray(root) && root[0]?.choices ? root : null);

        if (quizRaw !== undefined && quizRaw !== null) {
            const questions = normalizeQuizQuestions(quizRaw);
            if (questions.length) return { type: "quiz", payload: questions };
        }
    }

    if (context === "flashcards" || !context) {
        const cardsRaw =
            root.flashcards ?? root.cards ?? root.flashCards
            ?? (Array.isArray(root) && (root[0]?.term || root[0]?.front || root[0]?.definition) ? root : null);

        if (cardsRaw !== undefined && cardsRaw !== null) {
            const cards = normalizeFlashcards(cardsRaw);
            if (cards.length) return { type: "flashcards", payload: cards };
        }
    }

    if (context === "explain" || !context) {
        const explanation = pickString(root, ["explanation", "content", "text", "message"]);
        if (explanation) return { type: "explain", payload: explanation };
    }

    return null;
}

function getContentId(data) {
    if (!data || typeof data !== "object") return null;
    return data.id ?? data.contentId ?? data.generatedContentId
        ?? data.data?.id ?? data.result?.id ?? null;
}

export async function resolveGeneratedContent(data, context) {
    let structured = extractStructured(data, context);
    if (structured?.payload?.length) {
        return { structured, data, success: true };
    }

    const contentId = getContentId(data);
    if (!contentId || !["quiz", "flashcards"].includes(context)) {
        return { structured: null, data, success: false };
    }

    for (let attempt = 0; attempt < 4; attempt++) {
        if (attempt > 0) await sleep(1200 * attempt);
        try {
            const full = await getGeneratedContentById(contentId);
            structured = extractStructured(full, context);
            if (structured?.payload?.length) {
                return { structured, data: full, success: true };
            }
        } catch { /* retry */ }
    }

    return { structured: null, data, success: false, contentId };
}

export function getEmptyContentMessage(context, topic) {
    const messages = {
        quiz: `Couldn't generate quiz questions for "${topic}". The server returned an empty quiz — try again or pick a more specific topic like "HTML semantic tags".`,
        flashcards: `Couldn't create flashcards for "${topic}". Try again with a clearer topic like "React hooks".`,
        explain: `Couldn't get an explanation for "${topic}". Please try again.`,
    };
    return messages[context] || "No content was generated. Please try again.";
}

export async function dispatchByContext(context, message, conversationId, uploadedFileId) {
    switch (context) {
        case "summarize":
            return summarize({ topic: message, uploadedFileId });
        case "quiz":
            return generateQuiz({
                topic: message, count: 5, difficulty: "medium",
                questionType: "multiple-choice", uploadedFileId,
            });
        case "flashcards":
            return generateFlashcards({
                topic: message, count: 8, difficulty: "medium", uploadedFileId,
            });
        case "explain":
            return explainConcept({ concept: message, level: "beginner" });
        default:
            return sendChat({ message, context: "general", conversationId, uploadedFileId });
    }
}

export function mapConversationMessages(data) {
    const msgs = Array.isArray(data) ? data : data?.messages ?? [];
    return msgs.map(m => ({
        role: m.role === "user" || m.role === "User" ? "user" : "ai",
        text: m.content ?? m.message ?? m.text ?? "",
        time: m.createdAt
            ? new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "",
    }));
}
