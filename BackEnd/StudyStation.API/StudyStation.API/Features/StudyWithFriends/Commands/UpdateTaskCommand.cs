using MediatR;
using StudyStation.API.Data;
using StudyStation.API.Features.StudyWithFriends.DTOs;

namespace StudyStation.API.Features.StudyWithFriends.Commands;

public record UpdateTaskCommand(int TaskId, int RoomId, UpdateTaskDto Dto) : IRequest<StudyTaskDto?>;

public class UpdateTaskCommandHandler : IRequestHandler<UpdateTaskCommand, StudyTaskDto?>
{
    private readonly DatabaseContext _context;

    public UpdateTaskCommandHandler(DatabaseContext context)
    {
        _context = context;
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