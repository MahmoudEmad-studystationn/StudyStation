using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using System.Collections.Concurrent;
using System.Security.Claims;

namespace StudyStation.API.Hubs;

// We will use this interface to weakly type the hub for now, 
// allowing strings or DTOs to be pushed easily.
public interface IStudyClient
{
    Task ReceiveMessage(object message);
    Task UserJoined(int userId, string name);
    Task UserLeft(int userId, string name);
    Task TaskCreated(object task);
    Task TaskUpdated(object task);
    Task TaskDeleted(int taskId);
    Task FocusSessionStarted(object session);
    Task FocusSessionStopped(int sessionId);
    Task UserOnline(int userId);
    Task UserOffline(int userId);
}

[Authorize]
public class StudyHub : Hub<IStudyClient>
{
    private readonly DatabaseContext _context;

    // Tracks which room each connection belongs to: ConnectionId → RoomId
    private static readonly ConcurrentDictionary<string, (int UserId, int RoomId)> _connections = new();

    public StudyHub(DatabaseContext context)
    {
        _context = context;
    }

    private int GetCurrentUserId()
    {
        var userIdString = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(userIdString, out var userId) ? userId : 0;
    }

    public async Task JoinRoomGroup(string roomId)
    {
        var userId = GetCurrentUserId();
        if (userId == 0 || !int.TryParse(roomId, out var roomIdInt)) return;

        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);

        // Track this connection
        _connections[Context.ConnectionId] = (userId, roomIdInt);

        // Update presence in database
        var participant = await _context.RoomParticipants
            .FirstOrDefaultAsync(p => p.RoomId == roomIdInt && p.UserId == userId);

        if (participant != null)
        {
            participant.IsOnline = true;
            participant.LastActiveAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        // Notify the room that this user is online
        await Clients.Group(roomId).UserOnline(userId);
    }

    public async Task LeaveRoomGroup(string roomId)
    {
        var userId = GetCurrentUserId();
        if (userId == 0 || !int.TryParse(roomId, out var roomIdInt)) return;

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);

        // Remove tracking
        _connections.TryRemove(Context.ConnectionId, out _);

        // Check if user has other connections to this room
        var stillConnected = _connections.Values.Any(c => c.UserId == userId && c.RoomId == roomIdInt);
        if (!stillConnected)
        {
            // Update presence in database
            var participant = await _context.RoomParticipants
                .FirstOrDefaultAsync(p => p.RoomId == roomIdInt && p.UserId == userId);

            if (participant != null)
            {
                participant.IsOnline = false;
                participant.LastActiveAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            // Notify the room that this user went offline
            await Clients.Group(roomId).UserOffline(userId);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (_connections.TryRemove(Context.ConnectionId, out var info))
        {
            var (userId, roomId) = info;

            // Check if user has other active connections to this room
            var stillConnected = _connections.Values.Any(c => c.UserId == userId && c.RoomId == roomId);
            if (!stillConnected)
            {
                // Update presence in database
                var participant = await _context.RoomParticipants
                    .FirstOrDefaultAsync(p => p.RoomId == roomId && p.UserId == userId);

                if (participant != null)
                {
                    participant.IsOnline = false;
                    participant.LastActiveAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }

                // Notify the room
                await Clients.Group(roomId.ToString()).UserOffline(userId);
            }
        }

        await base.OnDisconnectedAsync(exception);
    }
}
