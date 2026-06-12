import React, { useState } from 'react';
import { createPostsApi } from '../Services/PostServices';
import { Spinner } from '@heroui/react';
import { useThemeContext } from "../Theme/ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faUsers } from "@fortawesome/free-solid-svg-icons";

export default function PostComposer({ callBack }) {
    const { isDarkMode } = useThemeContext();
    const [postTitle, setPostTitle] = useState('');
    const [postBody, setPostBody] = useState('');
    const [image, setImage] = useState(null);
    const [imageURL, setImageURL] = useState('');
    const [loading, setLoading] = useState(false);

    const navy = "#2C3E50";
    const steel = "#8FB7CC";
    const cardBg = isDarkMode ? "#1f1f1f" : "#ffffff";
    const textPrimary = isDarkMode ? "#f0f0f0" : "#1a1a2e";
    const textSecondary = isDarkMode ? "#9a9a9a" : "#686868";
    const textTertiary = isDarkMode ? "#555" : "#aaa";
    const borderColor = isDarkMode ? "rgba(255,255,255,0.07)" : "rgba(44,62,80,0.1)";
    const borderHover = isDarkMode ? "rgba(255,255,255,0.18)" : "rgba(44,62,80,0.22)";
    const accentSoft = isDarkMode ? "rgba(143,183,204,0.1)" : "rgba(143,183,204,0.18)";
    const fontFamily = '"Noto Sans Arabic", "Open Sans", sans-serif';

    function handleImage(e) {
        if (!e.target.files[0]) return;
        setImage(e.target.files[0]);
        setImageURL(URL.createObjectURL(e.target.files[0]));
        e.target.value = '';
    }

    async function createPost(e) {
        e.preventDefault();
        if (!postTitle.trim() || postTitle.trim().length < 5) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('title', postTitle);
        if (postBody) formData.append('content', postBody);
        if (image) formData.append('image', image);
        const res = await createPostsApi(formData);
        if (res) {
            await callBack();
            setPostTitle(''); setPostBody(''); setImage(null); setImageURL('');
        }
        setLoading(false);
    }

    const canSubmit = postTitle.trim().length >= 5 && !loading;

    return (
        <>
            <style>{`
                .composer-wrap {
                    background: ${cardBg};
                    border: 0.5px solid ${borderColor};
                    border-radius: 16px;
                    position: relative;
                    overflow: visible;
                    margin-bottom: 1.5rem;
                    font-family: ${fontFamily};
                }
                .composer-wrap::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, ${navy}, ${steel});
                    border-radius: 16px 16px 0 0;
                }
                .composer-inner { padding: 1.1rem 1.2rem; }
                .composer-fields { flex: 1; display: flex; flex-direction: column; }
                .composer-title {
                    width: 100%; padding: 9px 0 6px;
                    background: transparent; border: none;
                    border-bottom: 1.5px solid ${borderColor};
                    font-weight: 700; font-size: .95rem;
                    color: ${textPrimary}; outline: none;
                    font-family: ${fontFamily};
                    transition: border-color .2s;
                }
                .composer-title:focus { border-bottom-color: ${steel}; }
                .composer-title::placeholder { color: ${textTertiary}; font-weight: 600; }
                .composer-body {
                    width: 100%; padding: 8px 0 4px;
                    background: transparent; border: none;
                    font-size: .95rem; color: ${textSecondary};
                    resize: none; outline: none; min-height: 68px;
                    line-height: 1.6; font-family: ${fontFamily};
                }
                .composer-body::placeholder { color: ${textTertiary}; }
                .composer-preview { margin: 0 1.2rem 1rem; position: relative; }
                .composer-preview img {
                    width: 100%; border-radius: 10px; display: block;
                    border: 0.5px solid ${borderColor};
                }
                .composer-remove-img {
                    position: absolute; top: 8px; right: 8px;
                    width: 26px; height: 26px; border-radius: 50%;
                    background: rgba(0,0,0,0.55); border: none;
                    color: white; cursor: pointer; font-size: 14px;
                    display: flex; align-items: center; justify-content: center;
                }
                .composer-footer {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: .8rem 1.2rem .9rem; gap: 10px;
                    border-top: 0.5px solid ${borderColor};
                    flex-wrap: wrap;
                }
                .composer-actions { display: flex; gap: 6px; align-items: center; }
                .composer-action-btn {
                    display: inline-flex; align-items: center; gap: 5px;
                    padding: 6px 12px; border-radius: 8px;
                    border: 0.5px solid ${borderHover};
                    background: transparent; font-size: .78rem; font-weight: 500;
                    color: ${textSecondary}; cursor: pointer; transition: all .18s;
                    font-family: ${fontFamily};
                }
                .composer-action-btn:hover {
                    border-color: ${steel}; color: ${textPrimary};
                    background: ${accentSoft};
                }
                .composer-submit {
                    padding: 7px 20px; border-radius: 9px; border: none;
                    background: ${navy}; color: white;
                    font-size: .82rem; font-weight: 600;
                    cursor: pointer; transition: all .18s; letter-spacing: .02em;
                    font-family: ${fontFamily};
                }
                .composer-submit:hover:not(:disabled) {
                    background: ${steel}; color: ${navy}; transform: translateY(-1px);
                }
                .composer-submit:disabled { opacity: .4; cursor: not-allowed; }
                .composer-title-wrap {
                    position: relative;
                }
                .composer-title-tooltip {
                    position: absolute;
                    bottom: calc(100% + 6px);
                    left: 0;
                    background: ${navy};
                    color: white;
                    font-size: .72rem;
                    font-weight: 500;
                    padding: 5px 10px;
                    border-radius: 7px;
                    white-space: nowrap;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity .2s;
                }
                .composer-title-wrap:focus-within .composer-title-tooltip {
                    opacity: 1;
                }
                .composer-title-wrap:focus-within.valid .composer-title-tooltip {
                    opacity: 0;
                }
            `}</style>

            <form onSubmit={createPost} className="composer-wrap">
                <div className="composer-inner">
                    <div className="composer-avatar-row">
                        <div className="composer-fields">
                            <div className={`composer-title-wrap${postTitle.trim().length >= 5 ? " valid" : ""}`}>
                                <div className="composer-title-tooltip">
                                    Title must be at least 5 characters
                                </div>
                                <input
                                    type="text"
                                    className="composer-title"
                                    value={postTitle}
                                    onChange={e => setPostTitle(e.target.value)}
                                    placeholder="About what…"
                                    maxLength={50}
                                />
                            </div>
                            <textarea
                                className="composer-body"
                                value={postBody}
                                onChange={e => setPostBody(e.target.value)}
                                placeholder="Share something with your community…"
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                {imageURL && (
                    <div className="composer-preview">
                        <img src={imageURL} alt="Preview" />
                        <button type="button" className="composer-remove-img"
                            onClick={() => { setImageURL(''); setImage(null); }}>✕</button>
                    </div>
                )}

                <div className="composer-footer">
                    <div className="composer-actions">
                        <label className="composer-action-btn">
                            <FontAwesomeIcon icon={faCamera} style={{ fontSize: ".8rem" }} />
                            Photo
                            <input type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
                        </label>
                        <button type="button" className="composer-action-btn"
                            onClick={() => setPostTitle('Anyone want to join my room?')}>                            <FontAwesomeIcon icon={faUsers} style={{ fontSize: ".8rem" }} />
                            Room
                        </button>
                    </div>
                    <button type="submit" className="composer-submit" disabled={!canSubmit}>
                        Share
                    </button>
                </div>

                {loading && (
                    <div style={{
                        position: "absolute", inset: 0, borderRadius: "16px",
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