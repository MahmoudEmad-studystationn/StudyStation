using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.StudyWithFriends.DTOs;
using StudyStation.API.Features.StudyWithFriends.Models;
using StudyStation.API.Hubs;

namespace StudyStation.API.Features.StudyWithFriends.Commands;

public record StartFocusSessionCommand(
    int RoomId,
    int DurationMinutes,
    int UserId) : IRequest<FocusSessionDto>;

public class StartFocusSessionCommandHandler
    : IRequestHandler<StartFocusSessionCommand, FocusSessionDto>
{
    private readonly DatabaseContext _context;
    private readonly IHubContext<StudyHub, IStudyClient> _hubContext;

    public StartFocusSessionCommandHandler(
        DatabaseContext context,
        IHubContext<StudyHub, IStudyClient> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public async Task<FocusSessionDto> Handle(
        StartFocusSessionCommand request,
        CancellationToken cancellationToken)
    {
        // „‰⁄ ÊÃÊœ session ‘€«·… »«·›⁄·
        var activeSession = await _context.FocusSessions
            .FirstOrDefaultAsync(
                s => s.RoomId == request.RoomId &&
                     s.Status == FocusSessionStatus.Active,
                cancellationToken);

        if (activeSession != null)
        {
            throw new Exception("There is already an active focus session.");
        }

        var session = new FocusSession
        {
            RoomId = request.RoomId,
            DurationMinutes = request.DurationMinutes,
            StartTime = DateTime.UtcNow,
            StartedById = request.UserId,
            Status = FocusSessionStatus.Active
        };

        _context.FocusSessions.Add(session);

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new FocusSessionDto
        {
            Id = session.Id,
            RoomId = session.RoomId,
            DurationMinutes = session.DurationMinutes,
            StartTime = session.StartTime,

            // «·ÃœÌœ
            EndTime = session.StartTime.AddMinutes(session.DurationMinutes),

            StartedById = session.StartedById,
            Status = session.Status
        };

        await _hubContext.Clients
            .Group(request.RoomId.ToString())
            .FocusSessionStarted(dto);

        return dto;
    }
}