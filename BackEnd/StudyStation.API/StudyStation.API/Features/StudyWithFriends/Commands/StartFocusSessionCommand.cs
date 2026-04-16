using MediatR;
using StudyStation.API.Data;
using StudyStation.API.Features.StudyWithFriends.DTOs;
using StudyStation.API.Features.StudyWithFriends.Models;

namespace StudyStation.API.Features.StudyWithFriends.Commands;

public record StartFocusSessionCommand(int RoomId, int DurationMinutes, int UserId) : IRequest<FocusSessionDto>;

public class StartFocusSessionCommandHandler : IRequestHandler<StartFocusSessionCommand, FocusSessionDto>
{
    private readonly DatabaseContext _context;

    public StartFocusSessionCommandHandler(DatabaseContext context)
    {
        _context = context;
    }

    public async Task<FocusSessionDto> Handle(StartFocusSessionCommand request, CancellationToken cancellationToken)
    {
        var session = new FocusSession
        {
            RoomId = request.RoomId,
            DurationMinutes = request.DurationMinutes,
            StartedById = request.UserId,
            StartTime = DateTime.UtcNow,
            Status = FocusSessionStatus.Active
        };

        _context.FocusSessions.Add(session);
        await _context.SaveChangesAsync(cancellationToken);

        return new FocusSessionDto
        {
            Id = session.Id,
            RoomId = session.RoomId,
            DurationMinutes = session.DurationMinutes,
            StartedById = session.StartedById,
            StartTime = session.StartTime,
            Status = session.Status
        };
    }
}
