using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.StudyWithFriends.Models;

namespace StudyStation.API.Features.StudyWithFriends.Commands;

public record StopFocusSessionCommand(int SessionId, int RoomId) : IRequest<bool>;

public class StopFocusSessionCommandHandler : IRequestHandler<StopFocusSessionCommand, bool>
{
    private readonly DatabaseContext _context;

    public StopFocusSessionCommandHandler(DatabaseContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(StopFocusSessionCommand request, CancellationToken cancellationToken)
    {
        var session = await _context.FocusSessions
            .FirstOrDefaultAsync(s => s.Id == request.SessionId && s.RoomId == request.RoomId, cancellationToken);
            
        if (session == null) return false;

        session.Status = FocusSessionStatus.Stopped;
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
