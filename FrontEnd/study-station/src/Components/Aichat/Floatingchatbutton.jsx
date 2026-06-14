import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useThemeContext } from "../Theme/ThemeContext";

export default function FloatingChatButton() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isDarkMode } = useThemeContext();

    const [tooltip, setTooltip] = useState(false);
    const [pulse, setPulse] = useState(true);

    // hide the button when already on the chat page
    const isOnChat = location.pathname === "/aichat";

    // stop pulse after 4 seconds
    useEffect(() => {
        const t = setTimeout(() => setPulse(false), 4000);
        return () => clearTimeout(t);
    }, []);

    if (isOnChat) return null;

    return (
        <>
            <style>{`
        @keyframes fab-pulse {
          0%   { box-shadow: 0 0 0 0   rgba(44,62,80,0.55); }
          70%  { box-shadow: 0 0 0 14px rgba(44,62,80,0);   }
          100% { box-shadow: 0 0 0 0   rgba(44,62,80,0);    }
        }
        @keyframes fab-spin-in {
          from { opacity:0; transform:scale(0.5) rotate(-30deg); }
          to   { opacity:1; transform:scale(1)   rotate(0deg);   }
        }
        .fab-btn {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 9999;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          color: #fff;
          background: linear-gradient(135deg, #2c3e50 0%, #4e87a8 100%);
          box-shadow: 0 6px 20px rgba(44,62,80,0.45);
          transition: transform 0.2s cubic-bezier(.34,1.56,.64,1),
                      box-shadow 0.2s ease;
          animation: fab-spin-in 0.45s cubic-bezier(.34,1.56,.64,1) both;
        }
        .fab-btn:hover {
          transform: scale(1.12);
          box-shadow: 0 10px 28px rgba(44,62,80,0.55);
        }
        .fab-btn:active {
          transform: scale(0.95);
        }
        .fab-btn.pulsing {
          animation: fab-spin-in 0.45s cubic-bezier(.34,1.56,.64,1) both,
                     fab-pulse 1.6s ease-out 0.5s 2;
        }
        .fab-tooltip {
          position: fixed;
          bottom: 38px;
          right: 92px;
          z-index: 9998;
          background: #2c3e50;
          color: #fff;
          font-size: 12.5px;
          font-weight: 600;
          padding: 7px 13px;
          border-radius: 10px;
          white-space: nowrap;
          pointer-events: none;
          box-shadow: 0 4px 14px rgba(0,0,0,0.25);
          opacity: 0;
          transform: translateX(6px);
          transition: opacity 0.18s ease, transform 0.18s ease;
        }
        .fab-tooltip.visible {
          opacity: 1;
          transform: translateX(0);
        }
        .fab-tooltip::after {
          content: "";
          position: absolute;
          top: 50%;
          right: -6px;
          transform: translateY(-50%);
          border: 6px solid transparent;
          border-left-color: #2c3e50;
          border-right: none;
        }
      `}</style>

            {/* Tooltip */}
            <div className={`fab-tooltip ${tooltip ? "visible" : ""}`}>
                Ask AI Assistant
            </div>

            {/* Button */}
            <button
                className={`fab-btn ${pulse ? "pulsing" : ""}`}
                onClick={() => navigate("/aichat")}
                onMouseEnter={() => setTooltip(true)}
                onMouseLeave={() => setTooltip(false)}
                aria-label="Open AI Chat"
                title="AI Study Assistant"
            >
                <FontAwesomeIcon icon={faRobot} />
            </button>
        </>
    );
}