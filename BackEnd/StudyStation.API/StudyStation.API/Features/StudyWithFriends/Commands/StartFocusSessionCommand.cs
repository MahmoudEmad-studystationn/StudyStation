using MediatR;
using Microsoft.AspNetCore.SignalR;
using StudyStation.API.Data;
using StudyStation.API.Features.StudyWithFriends.DTOs;
using StudyStation.API.Features.StudyWithFriends.Models;
using StudyStation.API.Hubs;

namespace StudyStation.API.Features.StudyWithFriends.Commands;

public record StartFocusSessionCommand(int RoomId, int DurationMinutes, int UserId) : IRequest<FocusSessionDto>;

public class StartFocusSessionCommandHandler : IRequestHandler<StartFocusSessionCommand, FocusSessionDto>
{
    private readonly DatabaseContext _context;
    private readonly IHubContext<StudyHub, IStudyClient> _hubContext;

    public StartFocusSessionCommandHandler(DatabaseContext context, IHubContext<StudyHub, IStudyClient> hubContext)
    {
        _context = context;
        _hubContext = hubContext;

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

        await _hubContext.Clients.Group(request.RoomId.ToString())
    .FocusSessionStarted(new FocusSessionDto
    {
        Id = session.Id,
        RoomId = session.RoomId,
        DurationMinutes = session.DurationMinutes,
        StartTime = session.StartTime,
        StartedById = session.StartedById,
        Status = session.Status
    });

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
