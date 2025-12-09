import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Upload, X } from 'lucide-react';
import { useThemeContext } from "../Theme/ThemeContext";

const rainIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234A90E2'%3E%3Cpath d='M12 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zM4.22 5.64a1 1 0 0 1 1.42 0l.7.7a1 1 0 1 1-1.42 1.42l-.7-.7a1 1 0 0 1 0-1.42zm15.56 0a1 1 0 0 1 0 1.42l-.7.7a1 1 0 1 1-1.42-1.42l.7-.7a1 1 0 0 1 1.42 0zM12 7a5 5 0 0 1 5 5 1 1 0 1 1-2 0 3 3 0 1 0-6 0 1 1 0 1 1-2 0 5 5 0 0 1 5-5zm-7 8a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1zm4 3a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1zm6-3a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1zm4 3a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1z'/%3E%3C/svg%3E";
const forestIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2334A853'%3E%3Cpath d='M17 8C17 10.76 14.76 13 12 13C9.24 13 7 10.76 7 8C7 5.24 9.24 3 12 3C14.76 3 17 5.24 17 8ZM19.43 12.94L17.67 11.18C18.47 10.07 19 8.59 19 7C19 3.13 15.87 0 12 0C8.13 0 5 3.13 5 7C5 8.59 5.53 10.07 6.33 11.18L4.57 12.94C3.6 11.5 3 9.81 3 8C3 3.58 6.58 0 11 0H13C17.42 0 21 3.58 21 8C21 9.81 20.4 11.5 19.43 12.94ZM11 15V24H13V15H11Z'/%3E%3C/svg%3E";
const oceanIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%231E90FF'%3E%3Cpath d='M3 18c2.5-2 5-2 7.5 0s5 2 7.5 0 5-2 7.5 0M3 12c2.5-2 5-2 7.5 0s5 2 7.5 0 5-2 7.5 0M3 6c2.5-2 5-2 7.5 0s5 2 7.5 0S23 4 25.5 6' stroke='%231E90FF' stroke-width='2' fill='none'/%3E%3C/svg%3E";

const defaultSounds = [
    {
        id: 1,
        name: 'Rain',
        icon: rainIcon,
        audioSrc: "/Sounds/rain.mp3"
    },
    {
        id: 2,
        name: 'Forest',
        icon: forestIcon,
        audioSrc: "/Sounds/forest.mp3"
    },
    {
        id: 3,
        name: 'Ocean',
        icon: oceanIcon,
        audioSrc: "/Sounds/ocean.mp3"
    },
];

export default function SoundPlayer({ isFullscreen = false }) {
    const { isDarkMode } = useThemeContext();
    
    const [sounds, setSounds] = useState(() => {
        const saved = localStorage.getItem('customSounds');
        if (saved) {
            const parsed = JSON.parse(saved);
            return [...defaultSounds, ...parsed];
        }
        return defaultSounds;
    });
    
    const [playingSounds, setPlayingSounds] = useState([]);
    const [volumes, setVolumes] = useState({});
    const [showVolumeFor, setShowVolumeFor] = useState(null);
    const audioRefs = useRef({});

    const textPrimary = isDarkMode ? "#E5E7EB" : "#394f65ff";
    const textSecondary = isDarkMode ? "#B0B0B0" : "#6b6f76";
    const cardBg = isDarkMode ? "#2a2a2a36" : "rgba(255, 255, 255, 0.7)";
    const itemBg = isDarkMode ? "#1a1a1a50" : "#f9fafb";
    const itemHoverBg = isDarkMode ? "#2a2a2a80" : "#f3f4f6";
    const buttonBg = "#2C3E50";
    const borderColor = isDarkMode ? "#2C3E50" : "#E5E7EB";

    useEffect(() => {
        const customSounds = sounds.filter(s => s.id > 3);
        if (customSounds.length > 0) {
            localStorage.setItem('customSounds', JSON.stringify(customSounds));
        }
    }, [sounds]);

    useEffect(() => {
        sounds.forEach(sound => {
            if (!audioRefs.current[sound.id] && sound.audioSrc) {
                const audio = new Audio(sound.audioSrc);
                audio.loop = true;
                audio.volume = volumes[sound.id] ?? 0.5;
                audioRefs.current[sound.id] = audio;
            }
        });

        return () => {
            Object.values(audioRefs.current).forEach(audio => {
                if (audio) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            });
        };
    }, [sounds]);

    const handleSoundToggle = (soundId) => {
        const audio = audioRefs.current[soundId];
        if (!audio) return;

        if (playingSounds.includes(soundId)) {
            audio.pause();
            audio.currentTime = 0;
            setPlayingSounds(playingSounds.filter(id => id !== soundId));
        } else {
            audio.currentTime = 0;
            audio.play().catch(err => console.error('Play error:', err));
            setPlayingSounds([...playingSounds, soundId]);
        }
    };

    const handleVolumeChange = (soundId, value) => {
        const audio = audioRefs.current[soundId];
        if (audio) {
            const volumeValue = value / 100;
            audio.volume = volumeValue;
            setVolumes(prev => ({ ...prev, [soundId]: volumeValue }));
        }
    };

    const handleDeleteSound = (soundId) => {
        if (playingSounds.includes(soundId)) {
            const audio = audioRefs.current[soundId];
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
            setPlayingSounds(playingSounds.filter(id => id !== soundId));
        }
        
        delete audioRefs.current[soundId];
        setSounds(sounds.filter(s => s.id !== soundId));
    };

    const handleAudioUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newSound = {
                    id: Date.now(),
                    name: file.name.replace(/\.[^/.]+$/, ""),
                    icon: '🎵',
                    audioSrc: reader.result,
                    isCustom: true
                };
                setSounds([...sounds, newSound]);
            };
            reader.readAsDataURL(file);
        }
    };

    // لو في fullscreen mode، نخفي الـ UI بس نخلي الأصوات تشتغل
    if (isFullscreen) {
        return null; // الأصوات هتفضل شغالة لأن الـ audio refs موجودة
    }

    return (
        <div 
            className="w-full max-w-[280px] md:max-w-[300px] lg:max-w-[320px] rounded-xl p-4 md:p-5 lg:p-6 shadow-md backdrop-blur-md"
            style={{
                backgroundColor: cardBg,
                boxShadow: isDarkMode
                    ? "0 10px 10px rgba(0, 0, 0, 0.3)"
                    : "0 10px 10px rgba(0, 0, 0, 0.08)",
            }}
        >
            <div className="flex items-center justify-between mb-3 pb-3" style={{ borderBottom: `1px solid ${borderColor}` }}>
                <h2 className="text-base md:text-lg font-semibold" style={{ color: textPrimary }}>Add Sound</h2>
                <Volume2 className="w-4 h-4 md:w-5 md:h-5" style={{ color: textSecondary }} />
            </div>

            <div className="space-y-2 mb-4">
                {sounds.map((sound) => (
                    <div
                        key={sound.id}
                        className="flex items-center justify-between p-2 md:p-2.5 rounded-lg transition-colors relative"
                        style={{
                            backgroundColor: itemBg,
                            boxShadow: isDarkMode ? "0 2px 6px rgba(0, 0, 0, 0.2)" : "0 2px 6px rgba(0, 0, 0, 0.05)",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = itemHoverBg}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = itemBg}
                    >
                        <div className="flex items-center gap-2">
                            {typeof sound.icon === 'string' && sound.icon.startsWith('data:') ? (
                                <img src={sound.icon} alt={sound.name} className="w-4 h-4 md:w-5 md:h-5 object-contain" />
                            ) : (
                                <span className="text-lg md:text-xl">{sound.icon}</span>
                            )}
                            <span className="text-xs md:text-sm font-medium" style={{ color: textPrimary }}>
                                {sound.name}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {playingSounds.includes(sound.id) && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowVolumeFor(showVolumeFor === sound.id ? null : sound.id)}
                                        className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded transition-all hover:opacity-80"
                                        style={{
                                            backgroundColor: buttonBg,
                                        }}
                                    >
                                        <Volume2 className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />
                                    </button>

                                    {showVolumeFor === sound.id && (
                                        <div 
                                            className="absolute bottom-full right-0 mb-2 p-2 rounded-lg shadow-lg"
                                            style={{
                                                backgroundColor: cardBg,
                                                backdropFilter: 'blur(10px)',
                                                border: `1px solid ${borderColor}`,
                                                minWidth: '120px',
                                            }}
                                        >
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={(volumes[sound.id] ?? 0.5) * 100}
                                                onChange={(e) => handleVolumeChange(sound.id, parseFloat(e.target.value))}
                                                className="w-full h-1 rounded-lg appearance-none cursor-pointer"
                                                style={{
                                                    background: `linear-gradient(to right, ${buttonBg} 0%, ${buttonBg} ${(volumes[sound.id] ?? 0.5) * 100}%, ${borderColor} ${(volumes[sound.id] ?? 0.5) * 100}%, ${borderColor} 100%)`,
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={() => handleSoundToggle(sound.id)}
                                disabled={!sound.audioSrc}
                                className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded transition-all hover:opacity-80 active:scale-95"
                                style={{
                                    backgroundColor: playingSounds.includes(sound.id) ? "#e74c3c" : buttonBg,
                                    boxShadow: "0 2px 6px rgba(44, 62, 80, 0.3)",
                                }}
                            >
                                {playingSounds.includes(sound.id) ? (
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-white">
                                        <rect x="0" y="0" width="10" height="10" fill="currentColor" />
                                    </svg>
                                ) : (
                                    <svg width="10" height="12" viewBox="0 0 10 12" fill="none" className="text-white">
                                        <path d="M0 1.5V10.5L9 6L0 1.5Z" fill="currentColor" />
                                    </svg>
                                )}
                            </button>

                            {sound.isCustom && (
                                <button
                                    onClick={() => handleDeleteSound(sound.id)}
                                    className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded transition-all hover:opacity-80 active:scale-95"
                                    style={{
                                        backgroundColor: "#e74c3c",
                                        boxShadow: "0 2px 6px rgba(231, 76, 60, 0.3)",
                                    }}
                                >
                                    <X className="w-3 h-3 md:w-4 md:h-4 text-white" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <label
                htmlFor="audioUpload"
                className="w-full px-3 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:opacity-80 transition-all flex items-center justify-center gap-2"
                style={{
                    borderColor: borderColor,
                    backgroundColor: itemBg,
                }}
            >
                <Upload className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ color: textSecondary }} />
                <span className="text-xs md:text-sm font-medium" style={{ color: textSecondary }}>Upload Audio</span>
                <input
                    id="audioUpload"
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="hidden"
                />
            </label>
        </div>
    );
}