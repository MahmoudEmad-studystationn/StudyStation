import React, { useEffect, useState } from "react";
import { Check, Trash2, Maximize2 } from "lucide-react";

// --------------------------------------------------
//  TO-DO LIST COMPONENT
// --------------------------------------------------
function TodoList() {
    const [tasks, setTasks] = useState([
        { id: 1, text: "Study CSS", done: false },
        { id: 2, text: "Study JS", done: false },
    ]);
    const [input, setInput] = useState("");

    const addTask = () => {
        if (!input.trim()) return;
        setTasks([...tasks, { id: Date.now(), text: input, done: false }]);
        setInput("");
    };

    const toggleTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') addTask();
    };

    return (
        <div className="w-full bg-white shadow-lg rounded-2xl p-4 mx-auto mt-4 flex flex-col max-h-96">
            <h2 className="text-lg font-semibold mb-3">Tasks</h2>

            <div className="flex gap-2 mb-3">
                <input
                    type="text"
                    placeholder="Type a task"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={addTask}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-xl font-semibold transition-colors"
                >
                    +
                </button>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="flex items-center justify-between bg-gray-100 rounded-xl p-2.5 shadow-sm transition-opacity duration-200"
                    >
                        <div className="flex items-center gap-2.5">
                            <button onClick={() => toggleTask(task.id)} className="hover:scale-110 transition-transform">
                                <Check
                                    className={`w-4 h-4 ${task.done ? "text-green-600" : "text-gray-400"}`}
                                />
                            </button>
                            <span className={`${task.done ? "line-through text-gray-400" : "text-gray-800"} text-sm`}>
                                {task.text}
                            </span>
                        </div>

                        <button onClick={() => deleteTask(task.id)} className="hover:scale-110 transition-transform">
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --------------------------------------------------
//  MAIN COMPONENT
// --------------------------------------------------
const SoloStudy = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Fullscreen toggle function
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsFullscreen(true);
                const mainSidebar = document.querySelector('aside');
                if (mainSidebar) {
                    mainSidebar.style.display = 'none';
                }
            }).catch((err) => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().then(() => {
                    setIsFullscreen(false);
                    const mainSidebar = document.querySelector('aside');
                    if (mainSidebar) {
                        mainSidebar.style.display = 'flex';
                    }
                });
            }
        }
    };

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isNowFullscreen = !!document.fullscreenElement;
            setIsFullscreen(isNowFullscreen);

            const mainSidebar = document.querySelector('aside');
            if (mainSidebar) {
                mainSidebar.style.display = isNowFullscreen ? 'none' : 'flex';
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    return (
        <div className="relative h-screen overflow-hidden bg-gray-50">
            {/* TOP BUTTON */}
            <div className="absolute top-4 right-4 z-50">
                <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-lg bg-white shadow hover:bg-gray-100 transition-colors"
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                    <Maximize2 className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex flex-col lg:flex-row items-start justify-between gap-4 p-4 h-full">
                {/* TODO LIST */}
                <div className="flex flex-col items-start gap-4">
                    <div className="w-full lg:w-80">
                        <TodoList />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SoloStudy;