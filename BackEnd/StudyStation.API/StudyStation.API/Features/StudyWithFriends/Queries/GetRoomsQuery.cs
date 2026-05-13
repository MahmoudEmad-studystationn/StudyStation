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
                .ThenInclude(p => p.User)
            .Include(r => r.Tasks)
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

                // الجديد
                MaxParticipants = r.MaxParticipants,

                ParticipantsCount = r.Participants.Count,

                Participants = r.Participants.Select(p => new RoomParticipantDto
                {
                    UserId = p.UserId,
                    FullName = p.User.FirstName + " " + p.User.LastName,
                    Role = p.Role,
                    JoinedAt = p.JoinedAt
                }).ToList(),

                Tasks = r.Tasks.Select(t => new StudyTaskDto
                {
                    Id = t.Id,
                    RoomId = t.RoomId,
                    Title = t.Title,
                    IsCompleted = t.IsCompleted,
                    CreatedAt = t.CreatedAt,
                    CreatedById = t.CreatedById
                }).ToList()
            })
            .ToListAsync(cancellationToken);

        return rooms;
    }
}