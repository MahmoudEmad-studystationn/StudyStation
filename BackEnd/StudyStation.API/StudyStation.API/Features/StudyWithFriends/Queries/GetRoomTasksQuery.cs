using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.StudyWithFriends.DTOs;

namespace StudyStation.API.Features.StudyWithFriends.Queries;

public record GetRoomTasksQuery(int RoomId, int UserId) : IRequest<List<StudyTaskDto>?>;

public class GetRoomTasksQueryHandler : IRequestHandler<GetRoomTasksQuery, List<StudyTaskDto>?>
{
    private readonly DatabaseContext _context;

    public GetRoomTasksQueryHandler(DatabaseContext context)
    {
        _context = context;
    }

    public async Task<List<StudyTaskDto>?> Handle(GetRoomTasksQuery request, CancellationToken cancellationToken)
    {
        // Check if room exists and user is a participant
        var isParticipant = await _context.RoomParticipants
            .AnyAsync(p => p.RoomId == request.RoomId && p.UserId == request.UserId, cancellationToken);

        if (!isParticipant)
        {
            return null; // Not authorized or room doesn't exist
        }

        var tasks = await _context.StudyTasks
            .Where(t => t.RoomId == request.RoomId)
            .OrderBy(t => t.CreatedAt)
            .Select(t => new StudyTaskDto
            {
                Id = t.Id,
                RoomId = t.RoomId,
                Title = t.Title,
                IsCompleted = t.IsCompleted,
                CreatedById = t.CreatedById,
                CreatedAt = t.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return tasks;
    }
}
