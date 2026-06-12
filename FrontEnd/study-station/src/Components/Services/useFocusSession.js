import { useEffect, useRef, useState } from "react";
import { startFocusSession, stopFocusSession } from "./studyWithFriendsService";

/**
 * useFocusSession
 * ---------------
 * Manages the shared Pomodoro timer for a study room.
 *
 * Returns:
 *   sharedTimer: { remaining, isRunning, startTime, durationMinutes, sessionId } | null
 *   handleStart(durationMinutes) → calls API then refreshes state
 *   handleStop()                 → calls API then clears state
 */
export function useFocusSession(roomId) {
    const [sharedTimer, setSharedTimer] = useState(null);
    const sessionIdRef = useRef(null);
    const pollRef = useRef(null);

    // ─── Calculate remaining from startTime (server-authoritative) ────────────
    function calcRemaining(startTime, durationMinutes) {
        if (!startTime || !durationMinutes) return durationMinutes * 60;
        const start = new Date(startTime).getTime();
        const end = start + durationMinutes * 60 * 1000;
        const now = Date.now();
        const remaining = Math.max(0, Math.round((end - now) / 1000));
        return remaining;
    }

    // ─── Fetch current session state from server ──────────────────────────────
    async function fetchSessionState() {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(
                `https://study-station.runasp.net/api/StudyRooms/${roomId}/focus/current`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 404 or 204 means no active session
            if (res.status === 404 || res.status === 204) {
                setSharedTimer(null);
                sessionIdRef.current = null;
                return;
            }

            if (!res.ok) return;

            const data = await res.json();

            // data shape expected:
            // { sessionId, startTime, durationMinutes, isRunning, remaining? }
            if (!data || !data.isRunning) {
                setSharedTimer(null);
                sessionIdRef.current = null;
                return;
            }

            sessionIdRef.current = data.sessionId ?? data.id ?? null;

            const remaining = data.remaining
                ?? calcRemaining(data.startTime, data.durationMinutes);

            setSharedTimer({
                remaining,
                isRunning: true,
                startTime: data.startTime,
                durationMinutes: data.durationMinutes,
                sessionId: sessionIdRef.current,
            });
        } catch {
            // silently ignore network errors during poll
        }
    }

    // ─── Start polling when roomId is set ────────────────────────────────────
    useEffect(() => {
        if (!roomId) return;

        // immediate fetch on mount / roomId change
        fetchSessionState();

        // poll every 5 seconds to stay in sync with other users
        pollRef.current = setInterval(fetchSessionState, 5000);

        return () => {
            clearInterval(pollRef.current);
            pollRef.current = null;
        };
    }, [roomId]);

    // ─── handleStart ─────────────────────────────────────────────────────────
    async function handleStart(durationMinutes) {
        try {
            const data = await startFocusSession(roomId, durationMinutes);
            // data shape: { sessionId, startTime, durationMinutes }
            sessionIdRef.current = data?.sessionId ?? data?.id ?? null;

            const remaining = calcRemaining(data?.startTime, durationMinutes);

            setSharedTimer({
                remaining,
                isRunning: true,
                startTime: data?.startTime ?? new Date().toISOString(),
                durationMinutes,
                sessionId: sessionIdRef.current,
            });
        } catch (err) {
            console.error("Failed to start focus session:", err);
        }
    }

    // ─── handleStop ──────────────────────────────────────────────────────────
    async function handleStop() {
        try {
            if (sessionIdRef.current) {
                await stopFocusSession(roomId, sessionIdRef.current);
            }
        } catch (err) {
            console.error("Failed to stop focus session:", err);
        } finally {
            sessionIdRef.current = null;
            setSharedTimer(null);
        }
    }

    return { sharedTimer, handleStart, handleStop };
}