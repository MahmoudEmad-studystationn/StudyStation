using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.StudyWithFriends.Models;

namespace StudyStation.API.Features.StudyWithFriends.Commands;

public record JoinRoomCommand(int RoomId, int UserId, string? RoomCode) : IRequest<bool>;

public class JoinRoomCommandHandler : IRequestHandler<JoinRoomCommand, bool>
{
    private readonly DatabaseContext _context;

    public JoinRoomCommandHandler(DatabaseContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(JoinRoomCommand request, CancellationToken cancellationToken)
    {
        var room = await _context.StudyRooms.FirstOrDefaultAsync(r => r.Id == request.RoomId, cancellationToken);
        if (room == null) return false;

        if (!room.IsPublic && room.RoomCode != request.RoomCode)
        {
            return false; // Unauthorized or wrong code
        }

        var exists = await _context.RoomParticipants.AnyAsync(p => p.RoomId == request.RoomId && p.UserId == request.UserId, cancellationToken);
        if (exists) return true; // Already joined

        var participant = new RoomParticipant
        {
            RoomId = request.RoomId,
            UserId = request.UserId,
            Role = RoomRole.Member,
            JoinedAt = DateTime.UtcNow
        };

        _context.RoomParticipants.Add(participant);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
