using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.StudyWithFriends.DTOs;
using StudyStation.API.Hubs;

namespace StudyStation.API.Features.StudyWithFriends.Commands;

public record DeleteTaskCommand(int TaskId, int RoomId) : IRequest<bool>;

public class DeleteTaskCommandHandler : IRequestHandler<DeleteTaskCommand, bool>
{
    private readonly DatabaseContext _context;
    private readonly IHubContext<StudyHub, IStudyClient> _hubContext;

    public DeleteTaskCommandHandler(DatabaseContext context, IHubContext<StudyHub, IStudyClient> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public async Task<bool> Handle(DeleteTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _context.StudyTasks
            .FirstOrDefaultAsync(t => t.Id == request.TaskId && t.RoomId == request.RoomId, cancellationToken);
            
        if (task == null) return false;

        _context.StudyTasks.Remove(task);
        await _context.SaveChangesAsync(cancellationToken);

        await _hubContext.Clients.Group(request.RoomId.ToString())
    .TaskCreated(new StudyTaskDto
    {
        Id = task.Id,
        RoomId = task.RoomId,
        Title = task.Title,
        IsCompleted = task.IsCompleted,
        CreatedById = task.CreatedById,
        CreatedAt = task.CreatedAt
    });

        return true;
    }
}
