import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createPostsApi } from '../Services/PostServices';
import { Spinner } from '@heroui/react';
import { useThemeContext } from "../Theme/ThemeContext";

export default function PostComposer({ callBack }) {
    const { isDarkMode } = useThemeContext();
    const [postTitle, setPostTitle] = useState('');
    const [postBody, setPostBody] = useState('');
    const [image, setImage] = useState(null);
    const [imageURL, setImageURL] = useState('');
    const [loading, setLoading] = useState(false);

    const navy   = "#2C3E50";
    const steel  = "#8FB7CC";
    const cardBg = isDarkMode ? "#1f1f1f" : "#ffffff";
    const textPrimary   = isDarkMode ? "#f0f0f0" : "#1a1a2e";
    const textSecondary = isDarkMode ? "#9a9a9a" : "#686868";
    const borderColor   = isDarkMode ? "rgba(255,255,255,0.07)" : "rgba(44,62,80,0.1)";
    const composerBg    = isDarkMode ? "#2a2a2a" : "#F3F4F6";
    const accentSoft    = isDarkMode ? "rgba(143,183,204,0.1)" : "rgba(143,183,204,0.18)";

    function handleImage(e) {
        setImage(e.target.files[0]);
        setImageURL(URL.createObjectURL(e.target.files[0]));
        e.target.value = '';
    }

    async function createPost(e) {
        e.preventDefault();
        if (!postTitle.trim()) {
            toast.error("Please add a title");
            return;
        }
        if (postTitle.trim().length < 5) {
            toast.error("Title must be at least 5 characters");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('title', postTitle);
        if (postBody) formData.append('content', postBody);
        if (image) formData.append('image', image);

        const res = await createPostsApi(formData);
        if (res) {
            await callBack();
            setPostTitle('');
            setPostBody('');
            setImage(null);
            setImageURL('');
        }
        setLoading(false);
    }

    const canSubmit = postTitle.trim().length >= 5 && !loading;

    return (
        <>
            <style>{`
                .composer-wrap {
                    background: ${cardBg};
                    border: 1px solid ${borderColor};
                    border-radius: 14px;
                    padding: 1.25rem;
                    position: relative;
                    margin-bottom: 1.5rem;
                    transition: box-shadow .25s;
                }
                .composer-wrap::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 3px;
                    border-radius: 14px 14px 0 0;
                    background: linear-gradient(90deg, ${navy}, ${steel});
                }
                .composer-fields {
                    border-radius: 10px;
                    border: 1px solid ${borderColor};
                    background: ${composerBg};
                    overflow: hidden;
                    margin-bottom: 1rem;
                }
                .composer-title {
                    width: 100%;
                    padding: .75rem 1rem;
                    background: transparent;
                    border: none;
                    border-bottom: 1px solid ${borderColor};
                    font-weight: 700;
                    font-size: .95rem;
                    color: ${textPrimary};
                    outline: none;
                }
                .composer-title::placeholder { color: ${textSecondary}; font-weight: 600; }
                .composer-body {
                    width: 100%;
                    padding: .75rem 1rem;
                    background: transparent;
                    border: none;
                    font-size: .875rem;
                    color: ${textPrimary};
                    resize: none;
                    outline: none;
                    min-height: 90px;
                }
                .composer-body::placeholder { color: ${textSecondary}; }
                .composer-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding-top: .9rem;
                    border-top: 1px solid ${borderColor};
                    flex-wrap: wrap;
                }
                .composer-secondary-btn {
                    display: inline-flex; align-items: center; gap: 6px;
                    padding: 7px 14px;
                    border-radius: 8px;
                    border: 1px solid ${borderColor};
                    background: transparent;
                    font-size: .78rem; font-weight: 500;
                    color: ${textSecondary};
                    cursor: pointer;
                    transition: all .2s;
                }
                .composer-secondary-btn:hover {
                    border-color: ${steel};
                    color: ${textPrimary};
                    background: ${accentSoft};
                }
                .composer-submit {
                    padding: 8px 22px;
                    border-radius: 9px;
                    border: none;
                    background: ${navy};
                    color: white;
                    font-size: .82rem; font-weight: 600;
                    cursor: pointer;
                    transition: all .2s;
                    letter-spacing: .02em;
                }
                .composer-submit:hover:not(:disabled) {
                    background: ${steel};
                    color: ${navy};
                    transform: translateY(-1px);
                }
                .composer-submit:disabled {
                    opacity: .45;
                    cursor: not-allowed;
                }
            `}</style>

            <form onSubmit={createPost} className="composer-wrap">
                <div className="composer-fields">
                    <input
                        type="text"
                        className="composer-title"
                        value={postTitle}
                        onChange={e => setPostTitle(e.target.value)}
                        placeholder="Title…"
                        maxLength={50}
                    />
                    <textarea
                        className="composer-body"
                        value={postBody}
                        onChange={e => setPostBody(e.target.value)}
                        placeholder="What's on your mind?"
                        rows={4}
                    />
                </div>

                {imageURL && (
                    <div style={{ position: "relative", marginBottom: "1rem" }}>
                        <img
                            src={imageURL} alt="Preview"
                            style={{ width: "100%", maxHeight: "220px", objectFit: "cover", borderRadius: "10px", border: `1px solid ${borderColor}` }}
                        />
                        <button
                            type="button"
                            onClick={() => { setImageURL(''); setImage(null); }}
                            style={{
                                position: "absolute", top: "10px", right: "10px",
                                width: "30px", height: "30px", borderRadius: "50%",
                                background: "rgba(0,0,0,0.55)", border: "none",
                                color: "white", cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center"
                            }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}

                <div className="composer-footer">
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <label className="composer-secondary-btn">
                            Photo
                            <input type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
                        </label>
                        <button type="button" className="composer-secondary-btn">Shared Room</button>
                    </div>
                    <button type="submit" className="composer-submit" disabled={!canSubmit}>
                        Share
                    </button>
                </div>

                {loading && (
                    <div style={{
                        position: "absolute", inset: 0, borderRadius: "14px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: isDarkMode ? "rgba(31,31,31,0.75)" : "rgba(255,255,255,0.75)"
                    }}>
                        <Spinner />
                    </div>
                )}
            </form>
        </>
    );
}