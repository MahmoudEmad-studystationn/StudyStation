import React, { useState, createContext, useContext, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { useThemeContext } from "../Theme/ThemeContext";
import img1 from '../../assets/images/solo1.mp4';
import img2 from '../../assets/images/solo2.jpg';
import img3 from '../../assets/images/solo3.jpg';
import img4 from '../../assets/images/solo4.jpg';

const backgrounds = [
    { id: 1, src: img1, alt: 'Study Background 1', isVideo: true },
    { id: 2, src: img2, alt: 'Study Background 2', isVideo: false },
    { id: 3, src: img3, alt: 'Study Background 3', isVideo: false },
    { id: 4, src: img4, alt: 'Study Background 4', isVideo: false },
];

const BackgroundContext = createContext();

export function BackgroundProvider({ children }) {
    const [selectedBg, setSelectedBg] = useState(() => {
        const saved = localStorage.getItem('selectedBg');
        return saved ? JSON.parse(saved) : null;
    });
    const [customBg, setCustomBg] = useState(() => {
        return localStorage.getItem('customBg') || null;
    });
    const [isVideo, setIsVideo] = useState(() => {
        const saved = localStorage.getItem('isVideoBg');
        return saved === 'true';
    });

    // حفظ في localStorage كل ما يتغيروا
    useEffect(() => {
        if (selectedBg !== null) {
            localStorage.setItem('selectedBg', JSON.stringify(selectedBg));
        }
    }, [selectedBg]);

    useEffect(() => {
        if (customBg) {
            localStorage.setItem('customBg', customBg);
        }
    }, [customBg]);

    useEffect(() => {
        localStorage.setItem('isVideoBg', isVideo.toString());
    }, [isVideo]);

    const getBackgroundImage = () => {
        if (selectedBg === 'custom') return customBg;
        if (selectedBg) {
            const bg = backgrounds.find(b => b.id === selectedBg);
            return bg?.src;
        }
        return null;
    };

    return (
        <BackgroundContext.Provider value={{
            selectedBg,
            setSelectedBg,
            customBg,
            setCustomBg,
            isVideo,
            setIsVideo,
            getBackgroundImage
        }}>
            {children}
        </BackgroundContext.Provider>
    );
}

export function BackgroundImage() {
    const { getBackgroundImage, isVideo } = useContext(BackgroundContext);
    const backgroundImage = getBackgroundImage();

    if (!backgroundImage) return null;

    if (isVideo) {
        return (
            <div className="fixed inset-0" style={{ zIndex: 0 }}>
                <video
                    key={backgroundImage}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                >
                    <source src={backgroundImage} type="video/mp4" />
                </video>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                zIndex: 0
            }}
        />
    );
}

export default function BackgroundWidget() {
    const { isDarkMode } = useThemeContext();
    const { selectedBg, setSelectedBg, customBg, setCustomBg, setIsVideo } = useContext(BackgroundContext);

    const textPrimary = isDarkMode ? "#E5E7EB" : "#394f65ff";
    const textSecondary = isDarkMode ? "#B0B0B0" : "#6b6f76";
    const cardBg = isDarkMode ? "#2a2a2a36" : "rgba(255, 255, 255, 0.7)";
    const itemBg = isDarkMode ? "#1a1a1a50" : "#f9fafb";
    const borderColor = isDarkMode ? "#2C3E50" : "#E5E7EB";
    const selectedRing = "#2C3E50";

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const isVideoFile = file.type.startsWith('video/');
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomBg(reader.result);
                setSelectedBg('custom');
                setIsVideo(isVideoFile);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBackgroundSelect = (bgId) => {
        setSelectedBg(bgId);
        // تحقق لو الـ background المختار فيديو ولا لا
        const selectedBackground = backgrounds.find(b => b.id === bgId);
        setIsVideo(selectedBackground?.isVideo || false);
    };

    return (
        <div
            className="w-full max-w-[240px] md:max-w-[260px] lg:max-w-[280px] rounded-xl p-4 md:p-4 lg:p-5 shadow-md backdrop-blur-md"
            style={{
                backgroundColor: cardBg,
                boxShadow: isDarkMode
                    ? "0 10px 10px rgba(0, 0, 0, 0.3)"
                    : "0 10px 10px rgba(0, 0, 0, 0.08)",
                position: 'relative',
                zIndex: 10
            }}
        >
            <h2 className="text-base md:text-lg font-semibold mb-3" style={{ color: textPrimary }}>Background</h2>

            <div className="grid grid-cols-2 gap-2 mb-3">
                {backgrounds.map((bg) => (
                    <div
                        key={bg.id}
                        onClick={() => handleBackgroundSelect(bg.id)}
                        className="relative cursor-pointer rounded-lg overflow-hidden transition-all duration-300 hover:scale-105"
                        style={{
                            boxShadow: selectedBg === bg.id
                                ? `0 0 0 2px ${selectedRing}`
                                : isDarkMode ? "0 2px 6px rgba(0, 0, 0, 0.2)" : "0 2px 6px rgba(0, 0, 0, 0.05)",
                        }}
                    >
                        {bg.isVideo ? (
                            <video
                                src={bg.src}
                                className="w-full h-16 md:h-18 object-cover"
                                muted
                                loop
                                autoPlay
                                playsInline
                            />
                        ) : (
                            <img
                                src={bg.src}
                                alt={bg.alt}
                                className="w-full h-16 md:h-18 object-cover"
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="flex flex-col items-center gap-2">
                <label
                    htmlFor="customUpload"
                    className="w-16 h-16 md:w-18 md:h-18 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-all"
                    style={{
                        borderColor: borderColor,
                        backgroundColor: itemBg,
                        boxShadow: selectedBg === 'custom'
                            ? `0 0 0 2px ${selectedRing}`
                            : "none",
                    }}
                    onClick={() => customBg && handleBackgroundSelect('custom')}
                >
                    {customBg ? (
                        <img src={customBg} alt="Custom" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                        <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: textSecondary }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    )}
                    <input
                        id="customUpload"
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                </label>

                <label
                    htmlFor="customUpload2"
                    className="w-full px-3 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:opacity-80 transition-all flex items-center justify-center gap-2"
                    style={{
                        borderColor: borderColor,
                        backgroundColor: itemBg,
                    }}
                >
                    <Upload className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ color: textSecondary }} />
                    <span className="text-xs md:text-sm font-medium" style={{ color: textSecondary }}>Upload Media</span>
                    <input
                        id="customUpload2"
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                </label>
            </div>
        </div>
    );
}