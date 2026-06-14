using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.AI.DTOs;
using StudyStation.API.Features.AI.Models;
using StudyStation.API.Services;

namespace StudyStation.API.Features.AI.Commands
{
    // ─── Command ──────────────────────────────────────────────────────────────

    public record GenerateSummaryCommand(
        int UserId,
        string Topic,
        string? Content,
        int? UploadedFileId,
        string? SourceContext,
        int? SourceEntityId
    ) : IRequest<AiTextResponseDto>;

    // ─── Handler ──────────────────────────────────────────────────────────────

    public class GenerateSummaryHandler : IRequestHandler<GenerateSummaryCommand, AiTextResponseDto>
    {
        private readonly DatabaseContext _db;
        private readonly IAiService _ai;

        public GenerateSummaryHandler(DatabaseContext db, IAiService ai)
        {
            _db = db;
            _ai = ai;
        }

        public async Task<AiTextResponseDto> Handle(GenerateSummaryCommand cmd, CancellationToken ct)
        {
            // 1. Resolve content source
            var content = cmd.Content ?? string.Empty;
            if (string.IsNullOrEmpty(content) && cmd.UploadedFileId.HasValue)
            {
                var file = await _db.AiUploadedFiles
                    .FirstOrDefaultAsync(f => f.Id == cmd.UploadedFileId && f.UserId == cmd.UserId, ct);
                content = file?.ExtractedText ?? string.Empty;
            }

            if (string.IsNullOrWhiteSpace(content))
                content = $"Provide a comprehensive summary of the topic: {cmd.Topic}";

            // 2. Generate summary
            var summary = await _ai.SummarizeAsync(content, cmd.Topic, ct);

            // 3. Persist
            var saved = new AiGeneratedContent
            {
                UserId = cmd.UserId,
                ContentType = "Summary",
                Title = $"Summary: {cmd.Topic}",
                Topic = cmd.Topic,
                SourceContext = cmd.SourceContext,
                SourceEntityId = cmd.SourceEntityId,
                ContentJson = summary,
                CreatedAt = DateTime.UtcNow
            };
            _db.AiGeneratedContent.Add(saved);
            await _db.SaveChangesAsync(ct);

            return new AiTextResponseDto { Result = summary, SavedContentId = saved.Id };
        }
    }
}
