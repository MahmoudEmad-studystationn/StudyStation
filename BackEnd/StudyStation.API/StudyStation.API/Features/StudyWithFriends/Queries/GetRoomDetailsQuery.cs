using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.StudyWithFriends.DTOs;

namespace StudyStation.API.Features.StudyWithFriends.Queries;

public record GetRoomDetailsQuery(int RoomId) : IRequest<StudyRoomDto?>;

public class GetRoomDetailsQueryHandler : IRequestHandler<GetRoomDetailsQuery, StudyRoomDto?>
{
    private readonly DatabaseContext _context;

    public GetRoomDetailsQueryHandler(DatabaseContext context)
    {
        _context = context;
    }

    public async Task<StudyRoomDto?> Handle(GetRoomDetailsQuery request, CancellationToken cancellationToken)
    {
        var room = await _context.StudyRooms
            .Include(r => r.Participants)
            .Where(r => r.Id == request.RoomId)
            .Select(r => new StudyRoomDto
            {
                Id = r.Id,
                Name = r.Name,
                Subject = r.Subject,
                Description = r.Description,
                IsPublic = r.IsPublic,
                RoomCode = r.RoomCode,
                CreatedAt = r.CreatedAt,
                OwnerId = r.OwnerId,
                ParticipantsCount = r.Participants.Count
            })
            .FirstOrDefaultAsync(cancellationToken);

        return room;
    }
}
