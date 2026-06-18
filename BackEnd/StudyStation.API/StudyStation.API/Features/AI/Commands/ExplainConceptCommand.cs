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

    public record ExplainConceptCommand(
        int UserId,
        string Concept,
        int? UploadedFileId,
        string? Content,
        string? SourceContext,
        int? SourceEntityId
    ) : IRequest<AiTextResponseDto>;

    // ─── Handler ──────────────────────────────────────────────────────────────

    public class ExplainConceptHandler : IRequestHandler<ExplainConceptCommand, AiTextResponseDto>
    {
        private readonly DatabaseContext _db;
        private readonly IAiService _ai;
        private readonly ILogger<ExplainConceptHandler> _logger;

        public ExplainConceptHandler(DatabaseContext db, IAiService ai, ILogger<ExplainConceptHandler> logger)
        {
            _db = db;
            _ai = ai;
            _logger = logger;
        }

        public async Task<AiTextResponseDto> Handle(ExplainConceptCommand cmd, CancellationToken ct)
        {
            // 1. Optional supporting material (direct content or an uploaded file's text)
            string? material = cmd.Content;
            try
            {
                if (string.IsNullOrWhiteSpace(material) && cmd.UploadedFileId.HasValue)
                {
                    var file = await _db.AiUploadedFiles
                        .FirstOrDefaultAsync(f => f.Id == cmd.UploadedFileId && f.UserId == cmd.UserId, ct);
                    material = file?.ExtractedText;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not fetch uploaded file from DB — explaining without file content.");
            }

            if (string.IsNullOrWhiteSpace(material))
                material = null;

            // 2. Generate explanation via AI
            var explanation = await _ai.ExplainConceptAsync(cmd.Concept, material, ct);

            // 3. Persist — non-critical: if DB is unavailable, still return the result
            int? savedId = null;
            try
            {
                var content = new AiGeneratedContent
                {
                    UserId = cmd.UserId,
                    ContentType = "Explanation",
                    Title = $"Explanation: {cmd.Concept}",
                    Topic = cmd.Concept,
                    SourceContext = cmd.SourceContext,
                    SourceEntityId = cmd.SourceEntityId,
                    ContentJson = explanation,
                    CreatedAt = DateTime.UtcNow
                };
                _db.AiGeneratedContent.Add(content);
                await _db.SaveChangesAsync(ct);
                savedId = content.Id;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not persist explanation to DB — returning result without saving.");
            }

            return new AiTextResponseDto
            {
                Result = explanation,
                SavedContentId = savedId
            };
        }
    }
}
