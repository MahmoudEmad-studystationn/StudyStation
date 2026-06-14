using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.AI.DTOs;

namespace StudyStation.API.Features.AI.Queries
{
    // ─── Query ────────────────────────────────────────────────────────────────

    public record GetConversationHistoryQuery(
        int UserId,
        int ConversationId
    ) : IRequest<List<AiMessageDto>>;

    public record GetUserConversationsQuery(
        int UserId,
        string? Context = null
    ) : IRequest<List<ConversationSummaryDto>>;

    // ─── Handlers ─────────────────────────────────────────────────────────────

    public class GetConversationHistoryHandler : IRequestHandler<GetConversationHistoryQuery, List<AiMessageDto>>
    {
        private readonly DatabaseContext _db;
        public GetConversationHistoryHandler(DatabaseContext db) => _db = db;

        public async Task<List<AiMessageDto>> Handle(GetConversationHistoryQuery req, CancellationToken ct)
        {
            var conversation = await _db.AiConversations
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c => c.Id == req.ConversationId && c.UserId == req.UserId, ct)
                ?? throw new KeyNotFoundException("Conversation not found.");

            return conversation.Messages
                .OrderBy(m => m.SentAt)
                .Select(m => new AiMessageDto
                {
                    Id = m.Id,
                    Role = m.Role,
                    Content = m.Content,
                    SentAt = m.SentAt
                })
                .ToList();
        }
    }

    public class GetUserConversationsHandler : IRequestHandler<GetUserConversationsQuery, List<ConversationSummaryDto>>
    {
        private readonly DatabaseContext _db;
        public GetUserConversationsHandler(DatabaseContext db) => _db = db;

        public async Task<List<ConversationSummaryDto>> Handle(GetUserConversationsQuery req, CancellationToken ct)
        {
            var query = _db.AiConversations
                .Include(c => c.Messages)
                .Where(c => c.UserId == req.UserId);

            if (!string.IsNullOrEmpty(req.Context))
                query = query.Where(c => c.Context == req.Context);

            var conversations = await query
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
}
