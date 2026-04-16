using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;

namespace StudyStation.API.Features.StudyWithFriends.Commands;

public record DeleteTaskCommand(int TaskId, int RoomId) : IRequest<bool>;

public class DeleteTaskCommandHandler : IRequestHandler<DeleteTaskCommand, bool>
{
    private readonly DatabaseContext _context;

    public DeleteTaskCommandHandler(DatabaseContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _context.StudyTasks
            .FirstOrDefaultAsync(t => t.Id == request.TaskId && t.RoomId == request.RoomId, cancellationToken);
            
        if (task == null) return false;

        _context.StudyTasks.Remove(task);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
