using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.StudyWithFriends.DTOs;
using StudyStation.API.Features.StudyWithFriends.Models;

using Microsoft.AspNetCore.SignalR;
using StudyStation.API.Hubs;

namespace StudyStation.API.Features.StudyWithFriends.Commands;

public record SendMessageCommand(int RoomId, int UserId, string Content) : IRequest<RoomMessageDto?>;

public class SendMessageCommandHandler : IRequestHandler<SendMessageCommand, RoomMessageDto?>
{
    private readonly DatabaseContext _context;
    private readonly IHubContext<StudyHub, IStudyClient> _hubContext;

    public SendMessageCommandHandler(DatabaseContext context, IHubContext<StudyHub, IStudyClient> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public async Task<RoomMessageDto?> Handle(SendMessageCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FindAsync(new object[] { request.UserId }, cancellationToken);
        if (user == null) return null;

        var message = new RoomMessage
        {
            RoomId = request.RoomId,
            SenderId = request.UserId,
            Content = request.Content,
            SentAt = DateTime.UtcNow
        };

        _context.RoomMessages.Add(message);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new RoomMessageDto
        {
            Id = message.Id,
            RoomId = message.RoomId,
            SenderId = message.SenderId,
            SenderName = $"{user.FirstName} {user.LastName}",
            Content = message.Content,
            SentAt = message.SentAt
        };

        await _hubContext.Clients.Group(request.RoomId.ToString()).ReceiveMessage(dto);

        return dto;
    }
}