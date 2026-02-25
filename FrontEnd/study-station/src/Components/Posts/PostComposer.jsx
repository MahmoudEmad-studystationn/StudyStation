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

    const cardBg = isDarkMode ? "#2A2A2A" : "white";
    const textPrimary = isDarkMode ? "#E0E0E0" : "#2f3b48";
    const textSecondary = isDarkMode ? "#B0B0B0" : "#6b6f76";
    const buttonPrimary = "#7daebd";
    const buttonPrimaryHover = "#6a9ab3";
    const buttonSecondary = isDarkMode ? "#363636" : "#e4e6eb";
    const buttonSecondaryHover = isDarkMode ? "#404040" : "#d8dadf";
    const composerBg = isDarkMode ? "#363636" : "#f0f2f5";
    const borderCol = isDarkMode ? "#404040" : "#e4e6eb";

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

    return (
        <form
            onSubmit={createPost}
            className="relative rounded-lg shadow-sm p-4 sm:p-5 md:p-6 transition-colors duration-300 mb-6"
            style={{ backgroundColor: cardBg }}
        >
            <div className="mb-4">
                <div
                    className="rounded-lg overflow-hidden"
                    style={{
                        backgroundColor: composerBg,
                        border: `1px solid ${borderCol}`
                    }}
                >
                    {/* Title */}
                    <input
                        type="text"
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        placeholder="Title..."
                        maxLength={50}
                        className="w-full px-4 pt-3 pb-2 text-md font-bold focus:outline-none bg-transparent"
                        style={{
                            color: textPrimary,
                            borderBottom: `1px solid ${borderCol}`,
                        }}
                    />

                    {/* Content */}
                    <textarea
                        value={postBody}
                        onChange={(e) => setPostBody(e.target.value)}
                        placeholder="What's on your mind?"
                        rows="4"
                        className="w-full px-4 py-3 text-md focus:outline-none resize-none bg-transparent"
                        style={{ color: textPrimary }}
                    />
                </div>

                {/* Image Preview */}
                {imageURL && (
                    <div className="mt-3 relative">
                        <img src={imageURL} alt="Preview" className="w-full object-cover rounded-lg" />
                        <button
                            type="button"
                            onClick={() => { setImageURL(''); setImage(null); }}
                            className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition cursor-pointer"
                        >
                            <X className="w-5 h-5 text-gray-700" />
                        </button>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div
                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 pt-4"
                style={{ borderTop: `1px solid ${borderCol}` }}
            >
                <div className="flex items-center gap-2 sm:gap-3">
                    <label
                        className="rounded text-xs font-medium px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 transition-colors cursor-pointer"
                        style={{ backgroundColor: buttonSecondary, color: textPrimary }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = buttonSecondaryHover)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = buttonSecondary)}
                    >
                        Photo
                        <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                    </label>
                    <button
                        type="button"
                        className="rounded text-xs font-medium px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 transition-colors"
                        style={{ backgroundColor: buttonSecondary, color: textPrimary }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = buttonSecondaryHover)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = buttonSecondary)}
                    >
                        Shared Room
                    </button>
                </div>
                <button
                    type="submit"
                    disabled={loading || postTitle.trim().length < 5} className="text-white text-xs sm:text-sm font-medium px-6 sm:px-7 md:px-8 py-1.5 sm:py-2 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: isDarkMode ? "#2C3E50" : buttonPrimary }}
                    onMouseEnter={(e) => {
                        if (!loading && postTitle.trim())
                            e.currentTarget.style.backgroundColor = isDarkMode ? "#34495e" : buttonPrimaryHover;
                    }}
                    onMouseLeave={(e) =>
                        e.currentTarget.style.backgroundColor = isDarkMode ? "#2C3E50" : buttonPrimary
                    }
                >
                    Share
                </button>
            </div>

            {/* Loading Spinner */}
            {loading && (
                <div
                    className="absolute flex justify-center items-center inset-0 rounded-lg"
                    style={{ backgroundColor: isDarkMode ? "rgba(42, 42, 42, 0.7)" : "rgba(255, 255, 255, 0.7)" }}
                >
                    <Spinner />
                </div>
            )}
        </form>
    );
}