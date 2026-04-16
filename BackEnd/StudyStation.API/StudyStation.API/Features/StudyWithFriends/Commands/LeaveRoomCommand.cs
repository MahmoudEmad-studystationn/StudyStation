using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;

namespace StudyStation.API.Features.StudyWithFriends.Commands;

public record LeaveRoomCommand(int RoomId, int UserId) : IRequest<bool>;

public class LeaveRoomCommandHandler : IRequestHandler<LeaveRoomCommand, bool>
{
    private readonly DatabaseContext _context;

    public LeaveRoomCommandHandler(DatabaseContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(LeaveRoomCommand request, CancellationToken cancellationToken)
    {
        var participant = await _context.RoomParticipants
            .FirstOrDefaultAsync(p => p.RoomId == request.RoomId && p.UserId == request.UserId, cancellationToken);
            
        if (participant == null) return false;

        _context.RoomParticipants.Remove(participant);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
