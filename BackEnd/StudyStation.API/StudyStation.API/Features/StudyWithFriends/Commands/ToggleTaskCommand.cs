using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.StudyWithFriends.DTOs;
using StudyStation.API.Hubs;

namespace StudyStation.API.Features.StudyWithFriends.Commands;

public record ToggleTaskCommand(int TaskId, int RoomId) : IRequest<StudyTaskDto?>;

public class ToggleTaskCommandHandler : IRequestHandler<ToggleTaskCommand, StudyTaskDto?>
{
    private readonly DatabaseContext _context;
    private readonly IHubContext<StudyHub, IStudyClient> _hubContext;

    public ToggleTaskCommandHandler(DatabaseContext context, IHubContext<StudyHub, IStudyClient> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public async Task<StudyTaskDto?> Handle(ToggleTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _context.StudyTasks
            .FirstOrDefaultAsync(t => t.Id == request.TaskId && t.RoomId == request.RoomId, cancellationToken);
            
        if (task == null) return null;

        task.IsCompleted = !task.IsCompleted;
        await _context.SaveChangesAsync(cancellationToken);

        await _hubContext.Clients.Group(request.RoomId.ToString())
    .TaskUpdated(new StudyTaskDto
    {
        Id = task.Id,
        RoomId = task.RoomId,
        Title = task.Title,
        IsCompleted = task.IsCompleted,
        CreatedById = task.CreatedById,
        CreatedAt = task.CreatedAt
    });

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
