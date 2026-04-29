using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.StudyWithFriends.DTOs;
using StudyStation.API.Features.StudyWithFriends.Models;
using StudyStation.API.Hubs;

namespace StudyStation.API.Features.StudyWithFriends.Commands;

public record JoinRoomCommand(int RoomId, int UserId, string? RoomCode) : IRequest<bool>;

public class JoinRoomCommandHandler : IRequestHandler<JoinRoomCommand, bool>
{
    private readonly DatabaseContext _context;
    private readonly IHubContext<StudyHub, IStudyClient> _hubContext;

    public JoinRoomCommandHandler(DatabaseContext context, IHubContext<StudyHub, IStudyClient> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public async Task<bool> Handle(JoinRoomCommand request, CancellationToken cancellationToken)
    {
        var room = await _context.StudyRooms.FirstOrDefaultAsync(r => r.Id == request.RoomId, cancellationToken);
        if (room == null) return false;
        
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
        if (user == null) return false;

        if (!room.IsPublic && room.RoomCode != request.RoomCode)
        {
            return false; // Unauthorized or wrong code
        }

        var exists = await _context.RoomParticipants.AnyAsync(p => p.RoomId == request.RoomId && p.UserId == request.UserId, cancellationToken);
        if (exists) return true; // Already joined

        var participant = new RoomParticipant
        {
            RoomId = request.RoomId,
            UserId = request.UserId,
            Role = RoomRole.Member,
            JoinedAt = DateTime.UtcNow
        };

        _context.RoomParticipants.Add(participant);
        await _context.SaveChangesAsync(cancellationToken);
        await _hubContext.Clients.Group(request.RoomId.ToString()).UserJoined(new RoomParticipantDto
    {
        UserId = request.UserId,
        FullName = user.FirstName + " " + user.LastName,
        Role = RoomRole.Member,
        JoinedAt = participant.JoinedAt
    });

        return true;
    }
}
