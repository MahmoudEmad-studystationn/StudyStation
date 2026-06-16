using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.AI.DTOs;
using StudyStation.API.Features.AI.Models;
using StudyStation.API.Services;

namespace StudyStation.API.Features.AI.Commands
{
    // ─── Command ──────────────────────────────────────────────────────────────

    public record ExplainCommand(
        int UserId,
        string Concept,
        string Level,
        int? UploadedFileId,
        string? Content
    ) : IRequest<AiTextResponseDto>;

    // ─── Handler ──────────────────────────────────────────────────────────────

    public class ExplainHandler : IRequestHandler<ExplainCommand, AiTextResponseDto>
    {
        private readonly DatabaseContext _db;
        private readonly IAiService _ai;

        public ExplainHandler(DatabaseContext db, IAiService ai)
        {
            _db = db;
            _ai = ai;
        }

        public async Task<AiTextResponseDto> Handle(ExplainCommand cmd, CancellationToken ct)
        {
            // 1. Resolve source material (same pattern as Quiz / Flashcards / Summary)
            string? material = cmd.Content;
            if (string.IsNullOrWhiteSpace(material) && cmd.UploadedFileId.HasValue)
            {
                var file = await _db.AiUploadedFiles
                    .FirstOrDefaultAsync(f => f.Id == cmd.UploadedFileId && f.UserId == cmd.UserId, ct);
                material = file?.ExtractedText;
            }

            // 2. Build the concept label:
            //    - if the user also gave a Concept name, keep it as the title
            //    - if only material was given (no Concept), use a generic label
            var conceptLabel = !string.IsNullOrWhiteSpace(cmd.Concept)
                ? cmd.Concept
                : "the provided study material";

            // 3. Generate explanation
            var explanation = await _ai.ExplainConceptAsync(conceptLabel, cmd.Level, material, ct);

            // 4. Persist so the user can revisit it later
            var saved = new AiGeneratedContent
            {
                UserId = cmd.UserId,
                ContentType = "Explanation",
                Title = $"Explain: {conceptLabel}",
                Topic = conceptLabel,
                SourceContext = "Hub",
                SourceEntityId = null,
                ContentJson = explanation,
                CreatedAt = DateTime.UtcNow
            };
            _db.AiGeneratedContent.Add(saved);
            await _db.SaveChangesAsync(ct);

            return new AiTextResponseDto { Result = explanation, SavedContentId = saved.Id };
        }
    }
}
