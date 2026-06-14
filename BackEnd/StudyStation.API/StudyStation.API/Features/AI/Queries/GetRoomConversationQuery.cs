using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.AI.DTOs;

namespace StudyStation.API.Features.AI.Queries
{
    // ─── Queries ──────────────────────────────────────────────────────────────

    /// <summary>Get all shared AI conversations for a specific room.</summary>
    public record GetRoomConversationsQuery(
        int RoomId
    ) : IRequest<List<ConversationSummaryDto>>;

    /// <summary>Get all messages in a shared room conversation (with sender info).</summary>
    public record GetRoomConversationHistoryQuery(
        int RoomId,
        int ConversationId
    ) : IRequest<List<RoomAiMessageDto>>;

    // ─── Handlers ─────────────────────────────────────────────────────────────

    public class GetRoomConversationsHandler : IRequestHandler<GetRoomConversationsQuery, List<ConversationSummaryDto>>
    {
        private readonly DatabaseContext _db;
        public GetRoomConversationsHandler(DatabaseContext db) => _db = db;

        public async Task<List<ConversationSummaryDto>> Handle(GetRoomConversationsQuery req, CancellationToken ct)
        {
            var conversations = await _db.AiConversations
                .Include(c => c.Messages)
                .Where(c => c.RoomId == req.RoomId && c.Context == "GroupRoom")
                .OrderByDescending(c => c.UpdatedAt)
                .ToListAsync(ct);

            return conversations.Select(c => new ConversationSummaryDto
            {
                Id = c.Id,
                Title = c.Title,
                Context = c.Context,
                ContextEntityId = c.ContextEntityId,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                MessageCount = c.Messages.Count
            }).ToList();
        }
    }

    public class GetRoomConversationHistoryHandler : IRequestHandler<GetRoomConversationHistoryQuery, List<RoomAiMessageDto>>
    {
        private readonly DatabaseContext _db;
        public GetRoomConversationHistoryHandler(DatabaseContext db) => _db = db;

        public async Task<List<RoomAiMessageDto>> Handle(GetRoomConversationHistoryQuery req, CancellationToken ct)
        {
            var conversation = await _db.AiConversations
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c => c.Id == req.ConversationId && c.RoomId == req.RoomId, ct)
                ?? throw new KeyNotFoundException("Conversation not found for this room.");

            return conversation.Messages
                .OrderBy(m => m.SentAt)
                .Select(m => new RoomAiMessageDto
                {
                    Id = m.Id,
                    Role = m.Role,
                    Content = m.Content,
                    SenderUserId = m.SenderUserId,
                    SenderName = m.SenderName,
                    SentAt = m.SentAt
                })
                .ToList();
        }
    }
}
