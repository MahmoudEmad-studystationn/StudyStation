using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.StudyWithFriends.DTOs;

namespace StudyStation.API.Features.StudyWithFriends.Commands;

public record ToggleTaskCommand(int TaskId, int RoomId) : IRequest<StudyTaskDto?>;

public class ToggleTaskCommandHandler : IRequestHandler<ToggleTaskCommand, StudyTaskDto?>
{
    private readonly DatabaseContext _context;

    public ToggleTaskCommandHandler(DatabaseContext context)
    {
        _context = context;
    }

    public async Task<StudyTaskDto?> Handle(ToggleTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _context.StudyTasks
            .FirstOrDefaultAsync(t => t.Id == request.TaskId && t.RoomId == request.RoomId, cancellationToken);
            
        if (task == null) return null;

        task.IsCompleted = !task.IsCompleted;
        await _context.SaveChangesAsync(cancellationToken);

        return new StudyTaskDto
        {
            Id = task.Id,
            RoomId = task.RoomId,
            Title = task.Title,
            IsCompleted = task.IsCompleted,
            CreatedById = task.CreatedById,
            CreatedAt = task.CreatedAt
        };
    }
}
