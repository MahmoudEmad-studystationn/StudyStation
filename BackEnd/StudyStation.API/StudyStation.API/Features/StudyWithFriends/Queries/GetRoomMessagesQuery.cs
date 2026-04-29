using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.StudyWithFriends.DTOs;

namespace StudyStation.API.Features.StudyWithFriends.Queries;

public record GetRoomMessagesQuery(int RoomId, int UserId) : IRequest<List<RoomMessageDto>?>;

public class GetRoomMessagesQueryHandler : IRequestHandler<GetRoomMessagesQuery, List<RoomMessageDto>?>
{
    private readonly DatabaseContext _context;

    public GetRoomMessagesQueryHandler(DatabaseContext context)
    {
        _context = context;
    }

    public async Task<List<RoomMessageDto>?> Handle(GetRoomMessagesQuery request, CancellationToken cancellationToken)
    {
        // Check if room exists and user is a participant
        var isParticipant = await _context.RoomParticipants
            .AnyAsync(p => p.RoomId == request.RoomId && p.UserId == request.UserId, cancellationToken);

        if (!isParticipant)
        {
            return null; // Not authorized or room doesn't exist
        }

        var messages = await _context.RoomMessages
            .Include(m => m.Sender)
            .Where(m => m.RoomId == request.RoomId)
            .OrderBy(m => m.SentAt)
            .Select(m => new RoomMessageDto
            {
                Id = m.Id,
                RoomId = m.RoomId,
                SenderId = m.SenderId,
                SenderName = $"{m.Sender.FirstName} {m.Sender.LastName}",
                Content = m.Content,
                SentAt = m.SentAt
            })
            .ToListAsync(cancellationToken);

        return messages;
    }
}