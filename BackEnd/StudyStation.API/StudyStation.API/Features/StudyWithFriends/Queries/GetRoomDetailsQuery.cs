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
            .ThenInclude(p => p.User)
            .Include(r => r.Tasks)
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
                ParticipantsCount = r.Participants.Count,
                Participants = r.Participants.Select(p => new RoomParticipantDto
                {
                    UserId = p.UserId,
                    FullName = p.User.FirstName + " " + p.User.LastName,
                    Role = p.Role,
                    JoinedAt = p.JoinedAt
                }).ToList(),
                MaxParticipants = r.MaxParticipants,

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
            .FirstOrDefaultAsync(cancellationToken);

        return room;
    }
}
