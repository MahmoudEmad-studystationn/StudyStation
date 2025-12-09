import React, { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { useThemeContext } from "../Theme/ThemeContext";

const TodoList = () => {
    const { isDarkMode } = useThemeContext();
    const [tasks, setTasks] = useState([]);
    const [input, setInput] = useState("");

    const textPrimary = isDarkMode ? "#E5E7EB" : "#394f65ff";
    const textSecondary = isDarkMode ? "#B0B0B0" : "#6b6f76";
    const cardBg = isDarkMode ? "#2a2a2a36" : "transparent";
    const inputBg = isDarkMode ? "#1a1a1a" : "#ffffff";
    const inputBorder = isDarkMode ? "#2C3E50" : "#E5E7EB";
    const inputText = isDarkMode ? "#E5E7EB" : "#394f65ff";
    const buttonBg = "#2C3E50";
    const taskItemBg = isDarkMode ? "#1a1a1a50" : "#f9fafb";
    const taskItemHoverBg = isDarkMode ? "#2a2a2a80" : "#f3f4f6";

    const addTask = () => {
        const trimmedInput = input.trim();
        if (!trimmedInput) return;
        if (trimmedInput.length < 2) return;
        if (tasks.some(t => t.text.toLowerCase() === trimmedInput.toLowerCase())) {
            alert("This task already exists!");
            return;
        }
        setTasks([...tasks, { id: Date.now(), text: trimmedInput, done: false }]);
        setInput("");
    };

    const toggleTask = (id) => {
        setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter((t) => t.id !== id));
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") addTask();
    };

    return (
        <div 
            className="w-full max-w-[280px] md:max-w-[300px] lg:max-w-[320px] rounded-xl p-4 md:p-5 lg:p-6 flex flex-col shadow-md backdrop-blur-md"
            style={{
                backgroundColor: cardBg,
                boxShadow: isDarkMode
                    ? "0 10px 10px rgba(0, 0, 0, 0.3)"
                    : "0 10px 10px rgba(0, 0, 0, 0.08)",
            }}
        >
            <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4" style={{ color: textPrimary }}>Tasks</h2>

            <div className="flex gap-2 mb-3 md:mb-4">
                <input
                    type="text"
                    placeholder="Add a new task..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    maxLength={100}
                    className="flex-1 px-3 md:px-4 py-2 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 transition text-sm md:text-base placeholder:opacity-60"
                    style={{
                        backgroundColor: inputBg,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: inputBorder,
                        color: inputText,
                        boxShadow: isDarkMode ? "0 2px 8px rgba(0, 0, 0, 0.2)" : "0 2px 8px rgba(0, 0, 0, 0.05)",
                    }}
                />
                <button
                    onClick={addTask}
                    className="text-white px-4 md:px-5 py-2 rounded-lg md:rounded-xl font-bold transition hover:opacity-90 active:scale-95 text-lg md:text-xl"
                    style={{
                        backgroundColor: buttonBg,
                        boxShadow: "0 4px 10px rgba(44, 62, 80, 0.4)",
                    }}
                >
                    +
                </button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto max-h-80 md:max-h-96">
                {tasks.length === 0 ? (
                    <p className="text-center py-8 text-sm" style={{ color: textSecondary }}>
                        No tasks yet. Add one to get started!
                    </p>
                ) : (
                    tasks.map((task) => (
                        <div
                            key={task.id}
                            className="flex items-center justify-between rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3 transition"
                            style={{
                                backgroundColor: taskItemBg,
                                boxShadow: isDarkMode ? "0 2px 6px rgba(0, 0, 0, 0.2)" : "0 2px 6px rgba(0, 0, 0, 0.05)",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = taskItemHoverBg}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = taskItemBg}
                        >
                            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                <button
                                    onClick={() => toggleTask(task.id)}
                                    className="hover:scale-125 transition-transform flex-shrink-0"
                                >
                                    <Check
                                        className={`w-4 h-4 md:w-5 md:h-5 ${task.done ? "text-green-500" : isDarkMode ? "text-gray-500" : "text-gray-400"
                                            }`}
                                    />
                                </button>
                                <span
                                    className={`text-xs md:text-sm font-medium truncate ${task.done
                                            ? "line-through"
                                            : ""
                                        }`}
                                    style={{ color: task.done ? textSecondary : textPrimary }}
                                >
                                    {task.text}
                                </span>
                            </div>

                            <button
                                onClick={() => deleteTask(task.id)}
                                className="hover:scale-125 transition-transform flex-shrink-0 ml-2"
                            >
                                <Trash2 className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TodoList;