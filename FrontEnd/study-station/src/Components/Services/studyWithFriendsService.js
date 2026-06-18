import axiosInstance from "./axiosInstance";

const BASE = "StudyRooms";

function unwrapList(data, keys = ["rooms", "items", "data", "result"]) {
    if (Array.isArray(data)) return data;
    for (const key of keys) {
        if (Array.isArray(data?.[key])) return data[key];
    }
    return [];
}

function unwrapMessages(data) {
    if (Array.isArray(data)) return data;
    return data?.messages ?? data?.items ?? [];
}

function getDisplayName(entity) {
    if (!entity || typeof entity !== "object") return "";
    const user = entity.user ?? entity.profile ?? entity.member ?? entity;
    const first = user.firstName ?? entity.firstName ?? "";
    const last = user.lastName ?? entity.lastName ?? "";
    const full = `${first} ${last}`.trim();
    return (
        (entity.userName ?? entity.displayName ?? entity.name ?? entity.fullName
            ?? user.userName ?? user.displayName ?? user.name ?? user.fullName
            ?? full) || ""
    );
}

export function extractMembers(room) {
    const raw =
        room?.members
        ?? room?.participants
        ?? room?.studyRoomMembers
        ?? room?.users
        ?? room?.activeUsers
        ?? room?.onlineUsers
        ?? [];

    if (!Array.isArray(raw)) return [];

    return raw.map((m, index) => {
        if (typeof m === "string") {
            return { id: index, userName: m, name: m };
        }
        const user = m.user ?? m.profile ?? m;
        const name = getDisplayName(m) || getDisplayName(user);
        return {
            id: m.id ?? m.userId ?? user?.id ?? `member-${index}`,
            userId: m.userId ?? user?.id ?? m.id,
            userName: name,
            name,
            isOnline: m.isOnline ?? m.online ?? true,
        };
    });
}

export function extractTasks(room) {
    const raw = room?.tasks ?? room?.taskList ?? room?.todos ?? room?.roomTasks ?? [];
    if (!Array.isArray(raw)) return [];

    return raw.map(t => ({
        id: t.id ?? t.taskId,
        title: t.title ?? t.text ?? t.content ?? t.name ?? "",
        isDone: !!(t.isDone ?? t.isCompleted ?? t.completed ?? t.isChecked ?? t.done),
    })).filter(t => t.id != null);
}

export function getMemberCount(room, members = []) {
    const count =
        room?.participantsCount
        ?? room?.memberCount
        ?? room?.membersCount
        ?? room?.onlineCount
        ?? members.length;

    return typeof count === "number" ? count : members.length;
}

export function normalizeRoom(apiRoom, currentUserId = null) {
    const members = extractMembers(apiRoom);
    const currentCount = getMemberCount(apiRoom, members);
    const maxCount = apiRoom.maxParticipants ?? apiRoom.maxMembers ?? null;
    const fillPct = maxCount > 0 ? Math.round((currentCount / maxCount) * 100) : 0;
    const myId = currentUserId != null ? String(currentUserId) : null;

    const isMember = !!(
        apiRoom.currentUserIsMember
        ?? apiRoom.isMember
        ?? apiRoom.hasJoined
        ?? (myId && members.some(m => String(m.userId ?? m.id) === myId))
        ?? (myId && String(apiRoom.ownerId) === myId)
    );

    return {
        id: apiRoom.id,
        name: apiRoom.name,
        subject: apiRoom.subject || "General",
        desc: apiRoom.description || "No description available",
        createdAt: apiRoom.createdAt || null,
        isPublic: apiRoom.isPublic !== undefined ? apiRoom.isPublic : true,
        roomCode: apiRoom.roomCode || apiRoom.code || null,
        ownerId: apiRoom.ownerId ?? apiRoom.createdById ?? null,
        current: currentCount,
        max: maxCount,
        fill: fillPct,
        full: maxCount ? currentCount >= maxCount : false,
        members,
        tasks: extractTasks(apiRoom),
        isMember: !!isMember,
        isOwner: !!(myId && String(apiRoom.ownerId ?? apiRoom.createdById) === myId),
    };
}

export function normalizeMessage(msg) {
    const senderName = getDisplayName(msg.sender ?? msg.user ?? msg)
        || msg.senderName
        || msg.userName
        || "Unknown";

    return {
        id: msg.id ?? msg.messageId,
        content: msg.content ?? msg.text ?? msg.message ?? "",
        senderName,
        sentAt: msg.sentAt ?? msg.createdAt ?? msg.timestamp ?? null,
    };
}

export function extractActiveFocusSession(room) {
    const session =
        room?.activeFocusSession
        ?? room?.currentFocusSession
        ?? room?.focusSession
        ?? room?.activeSession
        ?? null;

    if (!session) return null;

    const isRunning = session.status === 1 || session.isActive === true || session.isRunning === true;
    if (!isRunning) return null;

    return {
        id: session.id ?? session.sessionId,
        startTime: session.startTime ?? session.startedAt,
        durationMinutes: session.durationMinutes ?? session.duration ?? 25,
        status: session.status,
    };
}

// ── Rooms ─────────────────────────────────────────────────────────────────────

export const getAllRooms = () =>
    axiosInstance.get(BASE).then(r => unwrapList(r.data));

export const createRoom = (data) =>
    axiosInstance.post(BASE, data).then(r => r.data);

export const getRoomById = (id) =>
    axiosInstance.get(`${BASE}/${id}`).then(r => r.data);

export const deleteRoom = (roomId) =>
    axiosInstance.delete(`${BASE}/${roomId}`).then(r => r.data);

export const joinRoom = (id, roomCode) => {
    const config = {
        params: roomCode ? { roomCode } : {},
    };
    return axiosInstance.post(`${BASE}/${id}/join`, null, config).then(r => r.data);
};

export const leaveRoom = (id) =>
    axiosInstance.post(`${BASE}/${id}/leave`, null).then(r => r.data);

// ── Tasks ─────────────────────────────────────────────────────────────────────

export const addTask = async (id, taskText) => {
    try {
        const res = await axiosInstance.post(
            `${BASE}/${id}/tasks`,
            JSON.stringify(taskText),
            { headers: { "Content-Type": "application/json" } },
        );
        return res.data;
    } catch (err) {
        const res = await axiosInstance.post(`${BASE}/${id}/tasks`, { title: taskText });
        return res.data;
    }
};

export const getRoomMembers = (id) =>
    axiosInstance.get(`${BASE}/${id}/members`).then(r => {
        const data = r.data;
        if (Array.isArray(data)) return data;
        return data?.members ?? data?.participants ?? data?.items ?? data ?? [];
    });

export const toggleTask = (id, taskId) =>
    axiosInstance.patch(`${BASE}/${id}/tasks/${taskId}/toggle`).then(r => r.data);

export const updateTask = (id, taskId, title) =>
    axiosInstance.put(`${BASE}/${id}/tasks/${taskId}`, { title }).then(r => r.data);

export const deleteTask = (id, taskId) =>
    axiosInstance.delete(`${BASE}/${id}/tasks/${taskId}`).then(r => r.data);

// ── Focus Sessions ────────────────────────────────────────────────────────────

export const startFocusSession = (id, durationMinutes) =>
    axiosInstance.post(
        `${BASE}/${id}/focus/start`,
        durationMinutes,
        { headers: { "Content-Type": "application/json" } },
    ).then(r => r.data);

export const stopFocusSession = (id, sessionId) =>
    axiosInstance.post(`${BASE}/${id}/focus/${sessionId}/stop`, null).then(r => r.data);

export const getCurrentFocusSession = (id) =>
    axiosInstance.get(`${BASE}/${id}/focus/current`).then(r => r.data);

// ── Messages ──────────────────────────────────────────────────────────────────

export const sendMessage = (id, messageText) =>
    axiosInstance.post(
        `${BASE}/${id}/messages`,
        JSON.stringify(messageText),
        { headers: { "Content-Type": "application/json" } },
    ).then(r => r.data);

export const getMessages = (id) =>
    axiosInstance.get(`${BASE}/${id}/messages`).then(r => unwrapMessages(r.data));

export const getTasks = (id) =>
    axiosInstance.get(`${BASE}/${id}/tasks`).then(r => {
        const data = r.data;
        return Array.isArray(data) ? data : (data?.tasks ?? data?.items ?? []);
    });