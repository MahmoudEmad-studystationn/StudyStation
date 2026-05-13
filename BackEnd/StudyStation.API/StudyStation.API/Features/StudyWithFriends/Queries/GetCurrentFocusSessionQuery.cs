using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.StudyWithFriends.DTOs;
using StudyStation.API.Features.StudyWithFriends.Models;

namespace StudyStation.API.Features.StudyWithFriends.Queries;

public record GetCurrentFocusSessionQuery(int RoomId)
    : IRequest<FocusSessionDto?>;

public class GetCurrentFocusSessionQueryHandler
    : IRequestHandler<GetCurrentFocusSessionQuery, FocusSessionDto?>
{
    private readonly DatabaseContext _context;

    public GetCurrentFocusSessionQueryHandler(DatabaseContext context)
    {
        _context = context;
    }

    public async Task<FocusSessionDto?> Handle(
        GetCurrentFocusSessionQuery request,
        CancellationToken cancellationToken)
    {
        var session = await _context.FocusSessions
            .FirstOrDefaultAsync(
                s => s.RoomId == request.RoomId &&
                     s.Status == FocusSessionStatus.Active,
                cancellationToken);

        if (session == null)
            return null;

        return new FocusSessionDto
        {
            Id = session.Id,
            RoomId = session.RoomId,
            DurationMinutes = session.DurationMinutes,
            StartTime = session.StartTime,

            EndTime = session.StartTime.AddMinutes(session.DurationMinutes),

            StartedById = session.StartedById,
            Status = session.Status
        };
    }
}