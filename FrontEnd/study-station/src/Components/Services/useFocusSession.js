import { useEffect, useRef, useState, useCallback } from "react";
import { startFocusSession, stopFocusSession } from "./studyWithFriendsService";

export function useFocusSession(roomId) {
    const [sharedTimer, setSharedTimer] = useState(null);
    const sessionIdRef = useRef(null);
    const tickRef      = useRef(null);

    // clear the local tick interval
    const clearTick = useCallback(() => {
        if (tickRef.current) {
            clearInterval(tickRef.current);
            tickRef.current = null;
        }
    }, []);

    // start a 1-second countdown from `remaining` seconds
    const startTick = useCallback((remaining) => {
        clearTick();
        tickRef.current = setInterval(() => {
            setSharedTimer(prev => {
                if (!prev || !prev.isRunning) { clearTick(); return prev; }
                const next = prev.remaining - 1;
                if (next <= 0) {
                    clearTick();
                    return { ...prev, remaining: 0, isRunning: false };
                }
                return { ...prev, remaining: next };
            });
        }, 1000);
    }, [clearTick]);

    // cleanup on unmount
    useEffect(() => () => clearTick(), [clearTick]);

    // ── handleStart ──────────────────────────────────────────────────────────
    const handleStart = useCallback(async (durationMinutes = 25) => {
        try {
            const data = await startFocusSession(roomId, durationMinutes);
            sessionIdRef.current = data?.sessionId ?? data?.id ?? null;

            // if server sends back remaining/startTime, use it; else calculate
            let remaining;
            if (data?.remaining) {
                remaining = data.remaining;
            } else if (data?.startTime) {
                const start = new Date(data.startTime).getTime();
                const end   = start + durationMinutes * 60 * 1000;
                remaining   = Math.max(0, Math.round((end - Date.now()) / 1000));
            } else {
                remaining = durationMinutes * 60;
            }

            setSharedTimer({
                remaining,
                isRunning: true,
                durationMinutes,
                sessionId: sessionIdRef.current,
            });

            startTick(remaining);
        } catch (err) {
            console.error("Failed to start focus session:", err);
        }
    }, [roomId, startTick]);

    // ── handleStop ───────────────────────────────────────────────────────────
    const handleStop = useCallback(async () => {
        clearTick();
        const sid = sessionIdRef.current;
        sessionIdRef.current = null;
        setSharedTimer(null);

        if (sid) {
            try {
                await stopFocusSession(roomId, sid);
            } catch (err) {
                console.error("Failed to stop focus session:", err);
            }
        }
    }, [roomId, clearTick]);

    return { sharedTimer, handleStart, handleStop };
}