using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StudyStation.API.Data;
using StudyStation.API.Features.AI.DTOs;
using StudyStation.API.Features.AI.Models;
using StudyStation.API.Services;

namespace StudyStation.API.Features.AI.Commands
{
    // ─── Command ──────────────────────────────────────────────────────────────

    public record SummarizeContentCommand(
        int UserId,
        string? Content,
        int? UploadedFileId,
        string? SourceContext,
        int? SourceEntityId
    ) : IRequest<AiTextResponseDto>;

    // ─── Handler ──────────────────────────────────────────────────────────────

    public class SummarizeContentHandler : IRequestHandler<SummarizeContentCommand, AiTextResponseDto>
    {
        private readonly DatabaseContext _db;
        private readonly IAiService _ai;
        private readonly ILogger<SummarizeContentHandler> _logger;

        public SummarizeContentHandler(DatabaseContext db, IAiService ai, ILogger<SummarizeContentHandler> logger)
        {
            _db = db;
            _ai = ai;
            _logger = logger;
        }

        public async Task<AiTextResponseDto> Handle(SummarizeContentCommand cmd, CancellationToken ct)
        {
            // 1. Resolve the content to summarize (direct text or an uploaded file's text)
            string? content = cmd.Content;
            string? sourceTitle = null;
            try
            {
                if (string.IsNullOrWhiteSpace(content) && cmd.UploadedFileId.HasValue)
                {
                    var file = await _db.AiUploadedFiles
                        .FirstOrDefaultAsync(f => f.Id == cmd.UploadedFileId && f.UserId == cmd.UserId, ct);
                    content = file?.ExtractedText;
                    sourceTitle = file?.OriginalFileName;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not fetch uploaded file from DB for summarization.");
            }

            // 2. Nothing to summarize (e.g. scanned PDF / OCR failure) → graceful message
            if (string.IsNullOrWhiteSpace(content))
            {
                return new AiTextResponseDto
                {
                    Result = "No readable text was found to summarize. Please paste the text directly or upload a clearer file."
                };
            }

            // 3. Generate summary via AI
            var summary = await _ai.SummarizeAsync(content, ct);

            // 4. Persist — non-critical: if DB is unavailable, still return the result
            int? savedId = null;
            try
            {
                var record = new AiGeneratedContent
                {
                    UserId = cmd.UserId,
                    ContentType = "Summary",
                    Title = sourceTitle is not null ? $"Summary: {sourceTitle}" : "Summary",
                    Topic = sourceTitle,
                    SourceContext = cmd.SourceContext,
                    SourceEntityId = cmd.SourceEntityId,
                    ContentJson = summary,
                    CreatedAt = DateTime.UtcNow
                };
                _db.AiGeneratedContent.Add(record);
                await _db.SaveChangesAsync(ct);
                savedId = record.Id;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not persist summary to DB — returning result without saving.");
            }

            return new AiTextResponseDto
            {
                Result = summary,
                SavedContentId = savedId
            };
        }
    }
}
