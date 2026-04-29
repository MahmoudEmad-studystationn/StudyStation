import React, { useState, useEffect } from 'react';
import { useThemeContext } from "../Theme/ThemeContext";

const studyQuotes = [
    { text: "Every hour you study today is an investment in who you'll be tomorrow.", author: "Study Mindset" },
    { text: "The pain of studying is temporary. The pride of achievement is permanent.", author: "Academic Wisdom" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Study Mindset" },
    { text: "Hard work beats talent when talent doesn't work hard.", author: "Study Mindset" },
    { text: "Your brain is a muscle. Every study session makes it stronger.", author: "Academic Wisdom" },
    { text: "Closed books don't open doors. Start reading.", author: "Study Mindset" },
    { text: "The student who wins is not the smartest — it's the one who doesn't quit.", author: "Academic Wisdom" },
    { text: "A year from now you will wish you had started today.", author: "Study Mindset" },
    { text: "Distraction is the enemy of your dreams. Close the tab and open the book.", author: "Academic Wisdom" },
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    { text: "Don't wish it were easier. Wish you were better.", author: "Jim Rohn" },
    { text: "Studying now means options later. The choice is yours.", author: "Study Mindset" },
    { text: "One page, one concept, one hour at a time — that's how mountains are moved.", author: "Academic Wisdom" },
    { text: "Focus on the step in front of you, not the whole staircase.", author: "Study Mindset" },
    { text: "Your future self is watching you right now through your memories.", author: "Aubrey De Grey" },
    { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
    { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
    { text: "Education is the passport to the future.", author: "Malcolm X" },
    { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
    { text: "Push yourself, because no one else is going to do it for you.", author: "Study Mindset" },
    { text: "Great things never come from comfort zones.", author: "Academic Wisdom" },
    { text: "Dream it. Believe it. Study for it. Achieve it.", author: "Study Mindset" },
    { text: "You don't have to be perfect. You just have to keep going.", author: "Academic Wisdom" },
    { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Wake up with determination. Go to bed with satisfaction.", author: "Study Mindset" },
    { text: "Little by little, a little becomes a lot.", author: "Tanzanian Proverb" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Knowledge is power. Power to change the world.", author: "Academic Wisdom" },
    { text: "You are capable of more than you know.", author: "Study Mindset" },
    { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
    { text: "The difference between who you are and who you want to be is what you do.", author: "Study Mindset" },
    { text: "Small progress is still progress. Keep going.", author: "Academic Wisdom" },
    { text: "Do something today that your future self will thank you for.", author: "Study Mindset" },
    { text: "Success doesn't come from what you do occasionally, it comes from what you do consistently.", author: "Marie Forleo" },
    { text: "Your only limit is your mind.", author: "Study Mindset" },
    { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Academic Wisdom" },
    { text: "Don't stop until you're proud.", author: "Study Mindset" },
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
    { text: "Work hard in silence. Let success make the noise.", author: "Frank Ocean" },
    { text: "You are one study session away from a better understanding.", author: "Academic Wisdom" },
    { text: "Consistency is what transforms average into excellence.", author: "Study Mindset" },
    { text: "If it feels difficult, you're doing it right.", author: "Academic Wisdom" },
    { text: "Your goals don't care about your mood. Stay consistent.", author: "Study Mindset" },
    { text: "The secret to getting ahead is getting started.", author: "Mark Twain" },
    { text: "Doubt kills more dreams than failure ever will.", author: "Suzy Kassem" },
    { text: "You won't always be motivated, so you must learn to be disciplined.", author: "Study Mindset" },
    { text: "The best way to predict your future is to create it.", author: "Peter Drucker" },
    { text: "Make each day your masterpiece.", author: "John Wooden" },
    { text: "Your education is your strongest asset. Protect it and grow it.", author: "Academic Wisdom" },
    { text: "Effort is the currency of success.", author: "Study Mindset" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
    { text: "Success is built on discipline and consistency.", author: "Academic Wisdom" },
    { text: "Stay patient and trust your journey.", author: "Study Mindset" },
    { text: "The struggle you feel today builds the strength you need tomorrow.", author: "Academic Wisdom" },
    { text: "Keep showing up, even on the hard days.", author: "Study Mindset" },
    { text: "Your dreams are worth the effort.", author: "Academic Wisdom" },
    { text: "Progress, not perfection, is the goal.", author: "Study Mindset" },
    { text: "Every small step counts towards your big goal.", author: "Academic Wisdom" }
];

export default function Quotes() {
    const { isDarkMode } = useThemeContext();
    const [isVisible, setIsVisible] = useState(false);
    const [quote, setQuote] = useState(studyQuotes[0]);

    useEffect(() => {
        setIsVisible(true);
        const timer = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * studyQuotes.length);
            setIsVisible(false);
            setTimeout(() => {
                setQuote(studyQuotes[randomIndex]);
                setIsVisible(true);
            }, 600);
        }, 10000);
        return () => clearInterval(timer);
    }, []);

    return (
        <>
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes fadeInSlide {
                    from { opacity: 0; transform: translateX(30px) translateY(-10px); }
                    to { opacity: 1; transform: translateX(0) translateY(0); }
                }
                .quote-bubble {
                    animation: fadeInSlide 0.6s ease-out forwards, float 3s ease-in-out infinite 0.6s;
                }
                .quote-text {
                    animation: fadeIn 0.8s ease-out 0.3s forwards;
                    opacity: 0;
                }
                @keyframes fadeIn { to { opacity: 1; } }
            `}</style>

            <div
                className="quote-bubble w-full max-w-[240px] md:max-w-[260px] lg:max-w-[280px] rounded-xl p-4 md:p-4 lg:p-5 shadow-md backdrop-blur-md"
                style={{
                    backgroundColor: isDarkMode ? "#2a2a2a36" : "rgba(255, 255, 255, 0.7)",
                    boxShadow: isDarkMode ? "0 10px 10px rgba(0,0,0,0.3)" : "0 10px 10px rgba(0,0,0,0.08)",
                    opacity: isVisible ? 1 : 0,
                    transition: 'opacity 0.6s ease-in-out',
                    position: 'relative',
                    zIndex: 10
                }}
            >
                <div className="quote-text" key={quote.text}>
                    <p style={{
                        margin: 0, fontSize: '15px', fontWeight: '500',
                        color: isDarkMode ? '#cfcfcfff' : '#646464',
                        lineHeight: '1.6', fontStyle: 'italic'
                    }}>
                        "{quote.text}"
                    </p>
                    <p style={{
                        margin: '8px 0 0 0', fontSize: '12px',
                        color: isDarkMode ? '#b1b1b1ff' : '#999999',
                        textAlign: 'right', fontWeight: '600'
                    }}>
                        — {quote.author}
                    </p>
                </div>
            </div>
        </>
    );
}