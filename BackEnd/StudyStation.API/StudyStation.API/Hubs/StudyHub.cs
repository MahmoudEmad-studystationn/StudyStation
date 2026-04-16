using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using StudyStation.API.Features.StudyWithFriends.Models;

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
}

[Authorize]
public class StudyHub : Hub<IStudyClient>
{
    public async Task JoinRoomGroup(string roomId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        // UserJoined could be broadcasted here, but usually it's handled via the MediatR command
        // which then triggers the hub context. Either way works.
    }

    public async Task LeaveRoomGroup(string roomId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
    }
}
