using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.StudyWithFriends.DTOs;
using StudyStation.API.Features.StudyWithFriends.Models;

namespace StudyStation.API.Features.StudyWithFriends.Queries;

public record GetCurrentFocusSessionQuery(int RoomId) : IRequest<FocusSessionDto?>;

public class GetCurrentFocusSessionQueryHandler : IRequestHandler<GetCurrentFocusSessionQuery, FocusSessionDto?>
{
    private readonly DatabaseContext _context;

    public GetCurrentFocusSessionQueryHandler(DatabaseContext context)
    {
        _context = context;
    }

    public async Task<FocusSessionDto?> Handle(GetCurrentFocusSessionQuery request, CancellationToken cancellationToken)
    {
        var session = await _context.FocusSessions
            .Where(fs => fs.RoomId == request.RoomId && fs.Status == FocusSessionStatus.Active)
            .OrderByDescending(fs => fs.StartTime)
            .Select(fs => new FocusSessionDto
            {
                Id = fs.Id,
                RoomId = fs.RoomId,
                StartTime = fs.StartTime,
                DurationMinutes = fs.DurationMinutes,
                Status = fs.Status,
                StartedById = fs.StartedById
            })
            .FirstOrDefaultAsync(cancellationToken);

        return session;
    }
}
