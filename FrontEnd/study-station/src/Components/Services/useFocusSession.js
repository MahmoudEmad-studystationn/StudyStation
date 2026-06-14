import { useEffect, useRef, useState, useCallback } from "react";
import { startFocusSession, stopFocusSession, getCurrentFocusSession } from "./studyWithFriendsService";

function calcRemaining(startTime, durationMinutes) {
    if (!startTime || !durationMinutes) return durationMinutes * 60;
    const end = new Date(startTime).getTime() + durationMinutes * 60 * 1000;
    return Math.max(0, Math.round((end - Date.now()) / 1000));
}

export function useFocusSession(roomId) {
    const [sharedTimer, setSharedTimer] = useState(null);
    const sessionIdRef = useRef(null);
    const tickRef = useRef(null);
    const startTimeRef = useRef(null);
    const durationRef = useRef(null);

    const startTick = useCallback((startTime, durationMinutes) => {
        if (tickRef.current) clearInterval(tickRef.current);
        startTimeRef.current = startTime;
        durationRef.current = durationMinutes;
        tickRef.current = setInterval(() => {
            const remaining = calcRemaining(startTimeRef.current, durationRef.current);
            if (remaining <= 0) {
                clearInterval(tickRef.current);
                tickRef.current = null;
                setSharedTimer(null);
                return;
            }
            setSharedTimer(prev => prev ? { ...prev, remaining } : null);
        }, 1000);
    }, []);

    // ── Polling كل 5 ثواني يجيب الـ session من الـ backend ──────────────────
    useEffect(() => {
        if (!roomId) return;

        async function poll() {
            try {
                const data = await getCurrentFocusSession(roomId);

                // status 1 = Active
                const isRunning = data?.status === 1;

                if (!data || !isRunning) {
                    // مفيش session شغالة
                    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
                    sessionIdRef.current = null;
                    setSharedTimer(null);
                    return;
                }

                const rawStart = data.startTime;
                const startTime = rawStart?.endsWith("Z") ? rawStart : rawStart + "Z";
                const durationMinutes = data.durationMinutes;
                const remaining = calcRemaining(startTime, durationMinutes);

                if (remaining <= 0) {
                    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
                    setSharedTimer(null);
                    return;
                }

                // لو الـ session اتغيرت (sessionId جديد)، نعيد الـ tick
                if (sessionIdRef.current !== data.id) {
                    sessionIdRef.current = data.id;
                    startTick(startTime, durationMinutes);
                }

                setSharedTimer({
                    isRunning: true,
                    remaining,
                    startTime,
                    durationMinutes,
                    sessionId: data.id,
                });
            } catch {
                // 404 = مفيش session — مش error حقيقي
                if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
                sessionIdRef.current = null;
                setSharedTimer(null);
            }
        }

        poll(); // أول call فوري
        const pollRef = setInterval(poll, 5000);

        return () => {
            clearInterval(pollRef);
            if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
        };
    }, [roomId, startTick]);

    // ── handleStart ──────────────────────────────────────────────────────────
    const handleStart = useCallback(async (durationMinutes = 25) => {
        try {
            const data = await startFocusSession(roomId, durationMinutes);
            const sessionId = data?.id ?? data?.sessionId ?? null;
            sessionIdRef.current = sessionId;

            const rawStart = data?.startTime ?? new Date().toISOString();
            const startTime = rawStart.endsWith("Z") ? rawStart : rawStart + "Z";
            const remaining = calcRemaining(startTime, durationMinutes);

            setSharedTimer({ isRunning: true, remaining, startTime, durationMinutes, sessionId });
            startTick(startTime, durationMinutes);
        } catch (err) {
            console.error("Failed to start focus session:", err);
        }
    }, [roomId, startTick]);

    // ── handleStop ───────────────────────────────────────────────────────────
    const handleStop = useCallback(async () => {
        if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
        const sid = sessionIdRef.current;
        sessionIdRef.current = null;
        setSharedTimer(null);
        if (sid) {
            try { await stopFocusSession(roomId, sid); }
            catch (err) { console.error("Failed to stop focus session:", err); }
        }
    }, [roomId]);

    return { sharedTimer, handleStart, handleStop };
}