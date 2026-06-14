import {
    faCommentDots, faFileLines, faCircleCheck, faClone, faLightbulb,
} from "@fortawesome/free-solid-svg-icons";

export const C = {
    navy: "#2c3e50",
    navyHover: "#3a4958",
    ocean: "#4e87a8",
    teal: "#658FA5",
    sky: "#8FB7CC",
    skyLight: "#c8dde9",
};

export const AVATAR_GRADIENTS = [
    `linear-gradient(135deg,${C.navy},${C.ocean})`,
    `linear-gradient(135deg,${C.ocean},${C.teal})`,
    `linear-gradient(135deg,${C.teal},${C.sky})`,
];

export const FONT = {
    xs: "12px",
    sm: "13.5px",
    base: "15px",
    md: "16px",
    lg: "18px",
    xl: "22px",
    xxl: "26px",
};

export const CONTEXT_KEYS = ["general", "summarize", "quiz", "flashcards", "explain"];

export const MODE_CONFIG = {
    general: {
        key: "general",
        label: "General Chat",
        shortLabel: "General",
        icon: faCommentDots,
        color: C.navy,
        description: "Chat freely about coding, frontend, backend, or anything you're studying.",
        loadingText: "Thinking…",
        showConversations: true,
        examples: [
            { label: "What is REST API?", prompt: "Explain REST API in simple terms with examples" },
            { label: "React hooks", prompt: "Explain useState and useEffect in React" },
            { label: "Frontend vs Backend", prompt: "What's the difference between frontend and backend development?" },
        ],
    },
    summarize: {
        key: "summarize",
        label: "Summarize",
        shortLabel: "Summarize",
        icon: faFileLines,
        color: C.ocean,
        description: "Summarize notes or topics — great for lectures, docs, or study material.",
        loadingText: "Summarizing…",
        showConversations: true,
        examples: [
            { label: "HTTP methods", prompt: "Summarize HTTP methods (GET, POST, PUT, DELETE)" },
            { label: "SQL basics", prompt: "Summarize SQL joins and when to use each type" },
            { label: "React lifecycle", prompt: "Summarize React component lifecycle and hooks" },
        ],
    },
    quiz: {
        key: "quiz",
        label: "Quiz Me",
        shortLabel: "Quiz",
        icon: faCircleCheck,
        color: "#34d399",
        description: "Generate a multiple-choice quiz on any dev topic.",
        loadingText: "Generating quiz…",
        showConversations: false,
        examples: [
            { label: "HTML quiz", prompt: "HTML tags and structure" },
            { label: "JavaScript quiz", prompt: "JavaScript ES6 fundamentals" },
            { label: "C# / ASP.NET quiz", prompt: "C# and ASP.NET Core basics" },
            { label: "CSS quiz", prompt: "CSS flexbox and grid" },
        ],
    },
    flashcards: {
        key: "flashcards",
        label: "Flashcards",
        shortLabel: "Flashcards",
        icon: faClone,
        color: C.teal,
        description: "Create flip cards to memorize terms, concepts, and definitions.",
        loadingText: "Creating flashcards…",
        showConversations: false,
        examples: [
            { label: "HTML tags", prompt: "Common HTML tags and their purpose" },
            { label: "Git commands", prompt: "Essential Git commands for developers" },
            { label: "API terms", prompt: "REST API and HTTP status codes" },
        ],
    },
    explain: {
        key: "explain",
        label: "Explain",
        shortLabel: "Explain",
        icon: faLightbulb,
        color: "#fbbf24",
        description: "Get a clear, beginner-friendly explanation of any concept.",
        loadingText: "Preparing explanation…",
        showConversations: false,
        examples: [
            { label: "What is JWT?", prompt: "JWT authentication" },
            { label: "Async/Await", prompt: "JavaScript async/await" },
            { label: "Database indexing", prompt: "Database indexing in SQL" },
        ],
    },
};

export const CONTEXT_CHIPS = CONTEXT_KEYS.map(key => ({
    key,
    label: MODE_CONFIG[key].shortLabel,
    icon: MODE_CONFIG[key].icon,
}));

export function createEmptyModeState() {
    return {
        messages: [],
        conversationId: null,
        structuredResult: null,
        inputVal: "",
    };
}

export function createInitialContextStates() {
    return CONTEXT_KEYS.reduce((acc, key) => {
        acc[key] = createEmptyModeState();
        return acc;
    }, {});
}
