import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faClone, faLightbulb, faFileLines } from "@fortawesome/free-solid-svg-icons";
import { MODE_CONFIG, C, FONT } from "./constants";

const HINT_ICONS = {
    quiz: faCircleCheck,
    flashcards: faClone,
    explain: faLightbulb,
    summarize: faFileLines,
};

export function ContextHint({ context }) {
    const mode = MODE_CONFIG[context];
    if (!mode) return null;

    const example = mode.examples?.[0];
    const text = example
        ? `Try "${example.label}" — type a topic like "${example.prompt}"`
        : mode.description;

    return (
        <div style={{
            marginBottom: 10, padding: "9px 14px", borderRadius: 10,
            background: "rgba(78,135,168,0.08)",
            border: `1px solid rgba(78,135,168,0.2)`,
            fontSize: FONT.sm, color: C.ocean,
            display: "flex", alignItems: "center", gap: 8,
        }}>
            <FontAwesomeIcon icon={HINT_ICONS[context] || mode.icon} />
            {text}
        </div>
    );
}
