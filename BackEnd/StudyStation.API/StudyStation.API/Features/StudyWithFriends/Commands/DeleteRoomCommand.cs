using MediatR;
using StudyStation.API.Data;

namespace StudyStation.API.Features.StudyWithFriends.Commands;

public record DeleteRoomCommand(int RoomId, int UserId) : IRequest<bool>;

public class DeleteRoomCommandHandler : IRequestHandler<DeleteRoomCommand, bool>
{
    private readonly DatabaseContext _context;

    public DeleteRoomCommandHandler(DatabaseContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteRoomCommand request, CancellationToken cancellationToken)
    {
        var room = await _context.StudyRooms.FindAsync(new object[] { request.RoomId }, cancellationToken);

        if (room == null || room.OwnerId != request.UserId)
        {
            // Either room not found or user is not the owner
            return false;
        }

        _context.StudyRooms.Remove(room);
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}