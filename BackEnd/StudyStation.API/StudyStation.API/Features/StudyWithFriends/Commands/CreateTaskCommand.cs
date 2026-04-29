using MediatR;
using Microsoft.AspNetCore.SignalR;
using StudyStation.API.Data;
using StudyStation.API.Features.StudyWithFriends.DTOs;
using StudyStation.API.Features.StudyWithFriends.Models;
using StudyStation.API.Hubs;

namespace StudyStation.API.Features.StudyWithFriends.Commands;

public record CreateTaskCommand(int RoomId, string Title, int UserId) : IRequest<StudyTaskDto>;

public class CreateTaskCommandHandler : IRequestHandler<CreateTaskCommand, StudyTaskDto>
{
    private readonly DatabaseContext _context;
    private readonly IHubContext<StudyHub, IStudyClient> _hubContext;

    public CreateTaskCommandHandler(DatabaseContext context, IHubContext<StudyHub, IStudyClient> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public async Task<StudyTaskDto> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
    {
        var task = new StudyTask
        {
            RoomId = request.RoomId,
            Title = request.Title,
            CreatedById = request.UserId,
            CreatedAt = DateTime.UtcNow,
            IsCompleted = false
        };

        _context.StudyTasks.Add(task);
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
            CreatedById = task.CreatedById,
            CreatedAt = task.CreatedAt
        };
    }
}
