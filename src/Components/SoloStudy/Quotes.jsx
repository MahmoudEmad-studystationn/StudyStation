import React, { useState, useEffect } from 'react';
import { useThemeContext } from "../Theme/ThemeContext";


export default function Quotes() {
    const { isDarkMode } = useThemeContext();
    const [isVisible, setIsVisible] = useState(false);
    const [quote, setQuote] = useState({
        text: "Life isn't about getting and having, it's about giving and being.",
        author: "Kevin Kruse"
    });
    const [allQuotes, setAllQuotes] = useState([]);

    useEffect(() => {
        const loadQuote = async () => {
            try {
                const response = await fetch("https://dummyjson.com/quotes?limit=1000");
                const data = await response.json();
                const formattedQuotes = data.quote.map(q => ({
                    text: q.quote,
                    author: q.author
                }));
                setAllQuotes(formattedQuotes);
            } catch (e) {
                console.log(e);

                setAllQuotes([
                    { text: "Life isn't about getting and having, it's about giving and being.", author: "Kevin Kruse" },
                    { text: "Whatever the mind of man can conceive and believe, it can achieve.", author: "Napoleon Hill" },
                    { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
                    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
                    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
                    { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
                    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
                    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
                    { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
                    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" }
                ]);
            }
        };
        loadQuote();
    }, [])

    useEffect(() => {
        if (allQuotes.length === 0) return;
        setIsVisible(true);
        const timer = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * allQuotes.length);
            const newQuote = allQuotes[randomIndex];
            setIsVisible(false);
            setTimeout(() => {
                setQuote({
                    text: newQuote.text,
                    author: newQuote.author
                });
                setIsVisible(true);
            }, 600);

        }, 10000);

        return () => {
            clearInterval(timer);
        };
    }, [allQuotes]);

    return (
        <>
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                
                @keyframes fadeInSlide {
                    from {
                        opacity: 0;
                        transform: translateX(30px) translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0) translateY(0);
                    }
                }

                .quote-bubble {
                    animation: fadeInSlide 0.6s ease-out forwards, float 3s ease-in-out infinite 0.6s;
                }

                .quote-text {
                    animation: fadeIn 0.8s ease-out 0.3s forwards;
                    opacity: 0;
                }

                @keyframes fadeIn {
                    to { opacity: 1; }
                }

                .bubble-tail {
                    position: absolute;
                    bottom: -6px;
                    right: 20px;
                    width: 0;
                    height: 0;
                    border-left: 8px solid transparent;
                    border-right: 8px solid transparent;
                    border-top: 8px solid rgba(255, 255, 255, 0.15);
                    filter: blur(1px);
                }

                .bubble-tail::before {
                    content: '';
                    position: absolute;
                    bottom: 1px;
                    right: -6px;
                    width: 0;
                    height: 0;
                    border-left: 6px solid transparent;
                    border-right: 6px solid transparent;
                    border-top: 6px solid rgba(255, 255, 255, 0.25);
                    filter: blur(0.5px);
                }
            `}</style>

            <div
                className="quote-bubble"
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    boxShadow: '0 8px 10px rgba(0, 0, 0, 0.1)',
                    maxWidth: '250px',
                    opacity: isVisible ? 1 : 0,
                }}
            >
                {/* <div className="bubble-tail"></div> */}

                <div className="quote-text" key={quote.text}>
                    <p
                        style={{
                            margin: 0,
                            fontSize: '15px',
                            fontWeight: '500',
                            color: isDarkMode ? '#cfcfcfff' : '#646464',
                            lineHeight: '1.6',
                            fontStyle: 'italic'
                        }}
                    >
                        "{quote.text}"
                    </p>
                    <p
                        style={{
                            margin: '8px 0 0 0',
                            fontSize: '12px',
                            color: isDarkMode ? '#b1b1b1ff' : '#cfcfcfff',
                            textAlign: 'right',
                            fontWeight: '600'
                        }}
                    >
                        — {quote.author}
                    </p>
                </div>
            </div>
        </>
    );
}