using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.StudyWithFriends.DTOs;

namespace StudyStation.API.Features.StudyWithFriends.Queries;

public record GetActiveRoomMembersQuery(int RoomId, int UserId) : IRequest<List<RoomParticipantDto>?>;

public class GetActiveRoomMembersQueryHandler : IRequestHandler<GetActiveRoomMembersQuery, List<RoomParticipantDto>?>
{
    private readonly DatabaseContext _context;

    public GetActiveRoomMembersQueryHandler(DatabaseContext context)
    {
        _context = context;
    }

    public async Task<List<RoomParticipantDto>?> Handle(GetActiveRoomMembersQuery request, CancellationToken cancellationToken)
    {
        // Check if the requesting user is a participant
        var isParticipant = await _context.RoomParticipants
            .AnyAsync(p => p.RoomId == request.RoomId && p.UserId == request.UserId, cancellationToken);

        if (!isParticipant)
        {
            return null; // Not authorized or room doesn't exist
        }

        var members = await _context.RoomParticipants
            .Include(p => p.User)
            .Where(p => p.RoomId == request.RoomId)
            .OrderByDescending(p => p.IsOnline)
            .ThenBy(p => p.JoinedAt)
            .Select(p => new RoomParticipantDto
            {
                UserId = p.UserId,
                FullName = $"{p.User.FirstName} {p.User.LastName}",
                Role = p.Role,
                JoinedAt = p.JoinedAt,
                IsOnline = p.IsOnline,
                LastActiveAt = p.LastActiveAt
            })
            .ToListAsync(cancellationToken);

        return members;
    }
}
