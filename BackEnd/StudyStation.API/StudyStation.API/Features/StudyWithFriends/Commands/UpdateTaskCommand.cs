using MediatR;
using Microsoft.AspNetCore.SignalR;
using StudyStation.API.Data;
using StudyStation.API.Features.StudyWithFriends.DTOs;
using StudyStation.API.Hubs;

namespace StudyStation.API.Features.StudyWithFriends.Commands;

public record UpdateTaskCommand(int TaskId, int RoomId, UpdateTaskDto Dto) : IRequest<StudyTaskDto?>;

public class UpdateTaskCommandHandler : IRequestHandler<UpdateTaskCommand, StudyTaskDto?>
{
    private readonly DatabaseContext _context;
    private readonly IHubContext<StudyHub, IStudyClient> _hubContext;

    public UpdateTaskCommandHandler(DatabaseContext context, IHubContext<StudyHub, IStudyClient> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public async Task<StudyTaskDto?> Handle(UpdateTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _context.StudyTasks.FindAsync(new object[] { request.TaskId }, cancellationToken);

        if (task == null || task.RoomId != request.RoomId)
        {
            return null;
        }

        task.Title = request.Dto.Title;
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

        return new StudyTaskDto
        {
            Id = task.Id,
            RoomId = task.RoomId,
            Title = task.Title,
            IsCompleted = task.IsCompleted,
            CreatedAt = task.CreatedAt,
            CreatedById = task.CreatedById
        };
    }
}