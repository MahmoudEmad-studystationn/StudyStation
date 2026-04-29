using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.StudyWithFriends.DTOs;

namespace StudyStation.API.Features.StudyWithFriends.Queries;

public record GetRoomsQuery() : IRequest<List<StudyRoomDto>>;

public class GetRoomsQueryHandler : IRequestHandler<GetRoomsQuery, List<StudyRoomDto>>
{
    private readonly DatabaseContext _context;

    public GetRoomsQueryHandler(DatabaseContext context)
    {
        _context = context;
    }

    public async Task<List<StudyRoomDto>> Handle(GetRoomsQuery request, CancellationToken cancellationToken)
    {
        var rooms = await _context.StudyRooms
            .Include(r => r.Participants)
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
            .ToListAsync(cancellationToken);

        return rooms;
    }
}
