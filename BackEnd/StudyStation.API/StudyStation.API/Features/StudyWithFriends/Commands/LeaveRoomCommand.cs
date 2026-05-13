using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Hubs;

namespace StudyStation.API.Features.StudyWithFriends.Commands;

public record LeaveRoomCommand(int RoomId, int UserId) : IRequest<bool>;

public class LeaveRoomCommandHandler : IRequestHandler<LeaveRoomCommand, bool>
{
    private readonly DatabaseContext _context;
    private readonly IHubContext<StudyHub, IStudyClient> _hubContext;

    public LeaveRoomCommandHandler(DatabaseContext context, IHubContext<StudyHub, IStudyClient> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public async Task<bool> Handle(LeaveRoomCommand request, CancellationToken cancellationToken)
    {
        var participant = await _context.RoomParticipants
            .FirstOrDefaultAsync(p => p.RoomId == request.RoomId && p.UserId == request.UserId, cancellationToken);
            
        if (participant == null) return false;

        _context.RoomParticipants.Remove(participant);
        await _context.SaveChangesAsync(cancellationToken);
        await _hubContext.Clients.Group(request.RoomId.ToString())
    .UserLeft(request.UserId, "User Left");

        return true;
    }
}
