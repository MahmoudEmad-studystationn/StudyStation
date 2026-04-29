using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.StudyWithFriends.Models;
using StudyStation.API.Hubs;

namespace StudyStation.API.Features.StudyWithFriends.Commands;

public record StopFocusSessionCommand(int SessionId, int RoomId) : IRequest<bool>;

public class StopFocusSessionCommandHandler : IRequestHandler<StopFocusSessionCommand, bool>
{
    private readonly DatabaseContext _context;
    private readonly IHubContext<StudyHub, IStudyClient> _hubContext;

    public StopFocusSessionCommandHandler(DatabaseContext context, IHubContext<StudyHub, IStudyClient> hubContext)
    {
        _context = context;
        _hubContext = hubContext;

    }

    public async Task<bool> Handle(StopFocusSessionCommand request, CancellationToken cancellationToken)
    {
        var session = await _context.FocusSessions
            .FirstOrDefaultAsync(s => s.Id == request.SessionId && s.RoomId == request.RoomId, cancellationToken);
            
        if (session == null) return false;

        session.Status = FocusSessionStatus.Stopped;
        await _context.SaveChangesAsync(cancellationToken);
        await _hubContext.Clients.Group(request.RoomId.ToString())
    .FocusSessionStopped(request.SessionId);

        return true;
    }
}
