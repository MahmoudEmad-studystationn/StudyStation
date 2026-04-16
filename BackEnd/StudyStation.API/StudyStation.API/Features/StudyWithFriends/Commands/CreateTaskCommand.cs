using MediatR;
using StudyStation.API.Data;
using StudyStation.API.Features.StudyWithFriends.DTOs;
using StudyStation.API.Features.StudyWithFriends.Models;

namespace StudyStation.API.Features.StudyWithFriends.Commands;

public record CreateTaskCommand(int RoomId, string Title, int UserId) : IRequest<StudyTaskDto>;

public class CreateTaskCommandHandler : IRequestHandler<CreateTaskCommand, StudyTaskDto>
{
    private readonly DatabaseContext _context;

    public CreateTaskCommandHandler(DatabaseContext context)
    {
        _context = context;
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
