import React, { useState, createContext, useContext, useEffect } from 'react';
import { useThemeContext } from "../Theme/ThemeContext";
import img1 from '../../assets/images/solo1.mp4';
import img2 from '../../assets/images/solo2.jpg';
import img3 from '../../assets/images/solo3.jpg';
import img4 from '../../assets/images/solo4.jpg';

const backgrounds = [
    { id: 1, src: img1, alt: 'Clouds', isVideo: true },
    { id: 2, src: img2, alt: 'Ocean', isVideo: false },
    { id: 3, src: img3, alt: 'Nature', isVideo: false },
    { id: 4, src: img4, alt: 'Room', isVideo: false },
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
            <div className="absolute inset-0" style={{ zIndex: 0 }}>
                <video key={backgroundImage} autoPlay loop muted playsInline className="w-full h-full object-cover">
                    <source src={backgroundImage} type="video/mp4" />
                </video>
            </div>
        );
    }
    return (
        <div className="absolute inset-0" style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 0
        }} />
    );
}

export default function BackgroundWidget() {
    const { isDarkMode } = useThemeContext();
    const { selectedBg, setSelectedBg, customBg, setCustomBg, setIsVideo } = useContext(BackgroundContext);

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

    const glass = isDarkMode
        ? 'rgba(15, 25, 40, 0.55)'
        : 'rgba(255, 255, 255, 0.45)';
    const border = isDarkMode
        ? 'rgba(255,255,255,0.08)'
        : 'rgba(255,255,255,0.6)';
    const labelColor = isDarkMode ? 'rgba(255,255,255,0.85)' : 'rgba(30,45,60,0.9)';
    const subColor = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(30,45,60,0.45)';

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

                .bg-widget {
                    font-family: 'DM Sans', sans-serif;
                    width: 220px;
                    background: ${glass};
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid ${border};
                    border-radius: 20px;
                    padding: 16px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
                    position: relative;
                    z-index: 10;
                }

                .bg-widget-title {
                    font-size: 11px;
                    font-weight: 600;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: ${subColor};
                    margin-bottom: 12px;
                }

                .bg-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    margin-bottom: 10px;
                }

                .bg-thumb {
                    position: relative;
                    border-radius: 12px;
                    overflow: hidden;
                    cursor: pointer;
                    aspect-ratio: 16/10;
                    border: 2px solid transparent;
                    transition: all 0.2s ease;
                }

                .bg-thumb:hover {
                    transform: scale(1.04);
                    border-color: rgba(255,255,255,0.5);
                }

                .bg-thumb.active {
                    border-color: #38bdf8;
                    box-shadow: 0 0 0 1px #38bdf8, 0 4px 12px rgba(56,189,248,0.3);
                }

                .bg-thumb img,
                .bg-thumb video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }

                .bg-thumb-label {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 4px 6px;
                    font-size: 9px;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    color: white;
                    background: linear-gradient(to top, rgba(0,0,0,0.55), transparent);
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }

                .bg-thumb:hover .bg-thumb-label {
                    opacity: 1;
                }

                .bg-thumb.active .bg-thumb-label {
                    opacity: 1;
                }

                .bg-upload-btn {
                    width: 100%;
                    padding: 9px;
                    border-radius: 12px;
                    border: 1.5px dashed ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'};
                    background: ${isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'};
                    color: ${subColor};
                    font-family: 'DM Sans', sans-serif;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 7px;
                    transition: all 0.2s ease;
                }

                .bg-upload-btn:hover {
                    border-color: #38bdf8;
                    color: #38bdf8;
                    background: rgba(56,189,248,0.06);
                }

                .bg-upload-btn svg {
                    width: 14px;
                    height: 14px;
                    flex-shrink: 0;
                }

                .bg-divider {
                    height: 1px;
                    background: ${isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'};
                    margin: 10px 0;
                }
            `}</style>

            <div className="bg-widget">
                <div className="bg-widget-title">Scene</div>

                <div className="bg-grid">
                    {backgrounds.map((bg) => (
                        <div
                            key={bg.id}
                            className={`bg-thumb ${selectedBg === bg.id ? 'active' : ''}`}
                            onClick={() => handleSelect(bg.id)}
                        >
                            {bg.isVideo ? (
                                <video src={bg.src} muted loop autoPlay playsInline />
                            ) : (
                                <img src={bg.src} alt={bg.alt} />
                            )}
                            <div className="bg-thumb-label">{bg.alt}</div>
                        </div>
                    ))}

                    {/* Custom thumbnail if uploaded */}
                    {customBg && (
                        <div
                            className={`bg-thumb ${selectedBg === 'custom' ? 'active' : ''}`}
                            onClick={() => { setSelectedBg('custom'); }}
                        >
                            <img src={customBg} alt="Custom" />
                            <div className="bg-thumb-label">Custom</div>
                        </div>
                    )}
                </div>

                <div className="bg-divider" />

                <label className="bg-upload-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload your own
                    <input type="file" accept="image/*,video/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
            </div>
        </>
    );
}