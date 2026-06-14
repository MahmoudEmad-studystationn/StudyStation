using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.AI.DTOs;
using System.Text.Json;

namespace StudyStation.API.Features.AI.Queries
{
    // ─── Queries ──────────────────────────────────────────────────────────────

    public record GetSessionAnalyticsQuery(
        int UserId,
        int StudySessionId
    ) : IRequest<SessionAnalyticsDto?>;

    public record GetGroupAnalyticsQuery(
        int UserId,
        int RoomId
    ) : IRequest<GroupSessionAnalyticsDto?>;

    // ─── Handlers ─────────────────────────────────────────────────────────────

    public class GetSessionAnalyticsHandler : IRequestHandler<GetSessionAnalyticsQuery, SessionAnalyticsDto?>
    {
        private readonly DatabaseContext _db;
        public GetSessionAnalyticsHandler(DatabaseContext db) => _db = db;

        public async Task<SessionAnalyticsDto?> Handle(GetSessionAnalyticsQuery req, CancellationToken ct)
        {
            var content = await _db.AiGeneratedContent
                .Where(c =>
                    c.UserId == req.UserId &&
                    c.ContentType == "SessionAnalysis" &&
                    c.SourceContext == "Session" &&
                    c.SourceEntityId == req.StudySessionId)
                .OrderByDescending(c => c.CreatedAt)
                .FirstOrDefaultAsync(ct);

            if (content is null) return null;

            try
            {
                var analytics = JsonSerializer.Deserialize<SessionAnalyticsDto>(content.ContentJson,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                return analytics;
            }
            catch
            {
                return null;
            }
        }
    }

    public class GetGroupAnalyticsHandler : IRequestHandler<GetGroupAnalyticsQuery, GroupSessionAnalyticsDto?>
    {
        private readonly DatabaseContext _db;
        public GetGroupAnalyticsHandler(DatabaseContext db) => _db = db;

        public async Task<GroupSessionAnalyticsDto?> Handle(GetGroupAnalyticsQuery req, CancellationToken ct)
        {
            var content = await _db.AiGeneratedContent
                .Where(c =>
                    c.UserId == req.UserId &&
                    c.ContentType == "GroupSummary" &&
                    c.SourceContext == "Room" &&
                    c.SourceEntityId == req.RoomId)
                .OrderByDescending(c => c.CreatedAt)
                .FirstOrDefaultAsync(ct);

            if (content is null) return null;

            try
            {
                return JsonSerializer.Deserialize<GroupSessionAnalyticsDto>(content.ContentJson,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            catch
            {
                return null;
            }
        }
    }
}
