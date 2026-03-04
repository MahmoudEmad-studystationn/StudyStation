import React from 'react'
import { useThemeContext } from '../Theme/ThemeContext'
import { Link } from 'react-router-dom';

export default function Library() {

  const { isDarkMode } = useThemeContext();
  const textSecondary = isDarkMode ? "#B0B0B0" : "#6b6f76";

  return (
    <>
      <div className="my-6 mx-3">
        <div className="py-5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-2 h-2 rounded-full bg-[#8FB7CC] shadow-[0_0_8px_#8FB7CC] animate-pulse" />
            <span className="text-[11px] tracking-[0.12em] uppercase text-[#8FB7CC] font-semibold">
              Learning Hub
            </span>
          </div>
          <h1 className='text-3xl font-bold text-[#8FB7CC] tracking-[0.12em] uppercase'>The Library</h1>
          <div className="flex gap-4 items-center">
            <p className="py-3 text-[15px] leading-[1.65] max-w-[460px] font-medium" style={{ color: textSecondary }}>
              Structured learning tracks with curated Courses and{" "}
              <span className="font-bold">Playlist</span>,
              <span className="font-bold"> Resources and Materials</span>, and{" "}
              <span className="font-bold">Roadmaps</span> all in one place.
            </p>

            <Link to="/share-resource">
              <button
                className="
                  group flex items-center gap-2
                  px-4 py-2.5 rounded-xl
                  bg-[#8FB7CC] text-white font-semibold text-[13px]
                  shadow-[0_2px_10px_rgba(143,183,204,0.35)]
                  hover:bg-[#7aaabf] hover:shadow-[0_4px_16px_rgba(143,183,204,0.45)]
                  hover:scale-[1.04] active:scale-[0.96]
                  transition-all duration-200 ease-out
                  cursor-pointer
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                <span>Share a Resource</span>
              </button>
            </Link>

          </div>
        </div>
      </div>
    </>
  )
}