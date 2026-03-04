import React, { useState, createContext, useContext, useEffect } from 'react';
import { Upload, Image } from 'lucide-react';
import { useThemeContext } from "../Theme/ThemeContext";
import img1 from '../../assets/images/solo1.mp4';
import img2 from '../../assets/images/solo5.png';
import img3 from '../../assets/images/solo4.jpg';

const backgrounds = [
    { id: 1, src: img1, alt: 'Clouds', isVideo: true },
    { id: 2, src: img2, alt: 'Study', isVideo: false },
];

const BackgroundContext = createContext();

export function BackgroundProvider({ children }) {
    const [selectedBg, setSelectedBg] = useState(() => {
        const saved = localStorage.getItem('selectedBg');
        return saved ? JSON.parse(saved) : null;
    });
    const [customBg, setCustomBg] = useState(() => localStorage.getItem('customBg') || null);
    const [isVideo, setIsVideo] = useState(() => localStorage.getItem('isVideoBg') === 'true');

    useEffect(() => {
        if (selectedBg !== null) localStorage.setItem('selectedBg', JSON.stringify(selectedBg));
    }, [selectedBg]);
    useEffect(() => {
        if (customBg) localStorage.setItem('customBg', customBg);
    }, [customBg]);
    useEffect(() => {
        localStorage.setItem('isVideoBg', isVideo.toString());
    }, [isVideo]);

    const getBackgroundImage = () => {
        if (selectedBg === 'custom') return customBg;
        if (selectedBg) return backgrounds.find(b => b.id === selectedBg)?.src;
        return null;
    };

    return (
        <BackgroundContext.Provider value={{ selectedBg, setSelectedBg, customBg, setCustomBg, isVideo, setIsVideo, getBackgroundImage }}>
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
            // ✅ fixed عشان تغطي كل الشاشة بما فيها السايدبار
            <div style={{ position: 'fixed', inset: 0, zIndex: 1 }}>
                <video key={backgroundImage} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
                    <source src={backgroundImage} type="video/mp4" />
                </video>
            </div>
        );
    }
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1,
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        }} />
    );
}

export default function BackgroundWidget() {
    const { isDarkMode } = useThemeContext();
    const { selectedBg, setSelectedBg, customBg, setCustomBg, setIsVideo } = useContext(BackgroundContext);

    const textPrimary   = isDarkMode ? "#E5E7EB" : "#394f65ff";
    const textSecondary = isDarkMode ? "#B0B0B0" : "#6b6f76";
    const cardBg        = isDarkMode ? "#2a2a2a36" : "rgba(255, 255, 255, 0.7)";
    const itemBg        = isDarkMode ? "#1a1a1a50" : "#f9fafb";
    const itemHoverBg   = isDarkMode ? "#2a2a2a80" : "#f3f4f6";
    const borderColor   = isDarkMode ? "#2C3E50" : "#E5E7EB";
    const selectedRing  = "#2C3E50";

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const isVideoFile = file.type.startsWith('video/');
        const reader = new FileReader();
        reader.onloadend = () => {
            setCustomBg(reader.result);
            setSelectedBg('custom');
            setIsVideo(isVideoFile);
        };
        reader.readAsDataURL(file);
    };

    const handleSelect = (bgId) => {
        setSelectedBg(bgId);
        setIsVideo(backgrounds.find(b => b.id === bgId)?.isVideo || false);
    };

    const allItems = [
        ...backgrounds,
        ...(customBg ? [{ id: 'custom', src: customBg, alt: 'Custom', isVideo: false }] : [])
    ];

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
                <h2 className="text-base md:text-lg font-semibold" style={{ color: textPrimary }}>Background</h2>
                <Image className="w-4 h-4 md:w-5 md:h-5" style={{ color: textSecondary }} />
            </div>

            <div className="space-y-2 mb-4">
                {allItems.map((bg) => (
                    <div
                        key={bg.id}
                        onClick={() => handleSelect(bg.id)}
                        className="flex items-center justify-between p-2 md:p-2.5 rounded-lg transition-colors cursor-pointer"
                        style={{
                            backgroundColor: selectedBg === bg.id ? (isDarkMode ? "#1e3a4f" : "#e8f4fd") : itemBg,
                            boxShadow: isDarkMode ? "0 2px 6px rgba(0, 0, 0, 0.2)" : "0 2px 6px rgba(0, 0, 0, 0.05)",
                            border: selectedBg === bg.id ? `1.5px solid ${selectedRing}` : '1.5px solid transparent',
                        }}
                        onMouseEnter={(e) => {
                            if (selectedBg !== bg.id) e.currentTarget.style.backgroundColor = itemHoverBg;
                        }}
                        onMouseLeave={(e) => {
                            if (selectedBg !== bg.id) e.currentTarget.style.backgroundColor = itemBg;
                        }}
                    >
                        <div className="flex items-center gap-2.5">
                            <div style={{
                                width: 44, height: 30, borderRadius: 7,
                                overflow: 'hidden', flexShrink: 0,
                                border: `1px solid ${borderColor}`,
                            }}>
                                {bg.isVideo ? (
                                    <video src={bg.src} muted loop autoPlay playsInline
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <img src={bg.src} alt={bg.alt}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                )}
                            </div>
                            <span className="text-xs md:text-sm font-medium" style={{ color: textPrimary }}>
                                {bg.alt}
                            </span>
                        </div>

                        <div style={{
                            width: 16, height: 16, borderRadius: '50%',
                            border: `2px solid ${selectedBg === bg.id ? selectedRing : borderColor}`,
                            backgroundColor: selectedBg === bg.id ? selectedRing : 'transparent',
                            flexShrink: 0,
                            transition: 'all 0.2s ease',
                        }} />
                    </div>
                ))}
            </div>

            <label
                htmlFor="bgUpload"
                className="w-full px-3 py-2 border-2 border-dashed rounded-lg cursor-pointer hover:opacity-80 transition-all flex items-center justify-center gap-2"
                style={{ borderColor: borderColor, backgroundColor: itemBg }}
            >
                <Upload className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ color: textSecondary }} />
                <span className="text-xs md:text-sm font-medium" style={{ color: textSecondary }}>Upload Background</span>
                <input id="bgUpload" type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
            </label>
        </div>
    );
}