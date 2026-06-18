using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StudyStation.API.Data;
using StudyStation.API.Features.AI.DTOs;
using StudyStation.API.Features.AI.Models;
using StudyStation.API.Services;
using System.Text.Json;

namespace StudyStation.API.Features.AI.Commands
{
    // ─── Command ──────────────────────────────────────────────────────────────

    public record GenerateFlashcardsCommand(
        int UserId,
        string Topic,
        int Count,
        int? UploadedFileId,
        string? Content,
        string? SourceContext,
        int? SourceEntityId
    ) : IRequest<AiFlashcardSetDto>;

    // ─── Handler ──────────────────────────────────────────────────────────────

    public class GenerateFlashcardsHandler : IRequestHandler<GenerateFlashcardsCommand, AiFlashcardSetDto>
    {
        private readonly DatabaseContext _db;
        private readonly IAiService _ai;
        private readonly ILogger<GenerateFlashcardsHandler> _logger;

        public GenerateFlashcardsHandler(DatabaseContext db, IAiService ai, ILogger<GenerateFlashcardsHandler> logger)
        {
            _db = db;
            _ai = ai;
            _logger = logger;
        }

        public async Task<AiFlashcardSetDto> Handle(GenerateFlashcardsCommand cmd, CancellationToken ct)
        {
            // 1. Resolve source material (direct content or an uploaded file's extracted text)
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
                _logger.LogWarning(ex, "Could not fetch uploaded file from DB — proceeding without file content.");
            }

            // Treat blank/whitespace extracted text as "no material" so we never inject an
            // empty study-material block (otherwise the cards ignore the uploaded file).
            if (string.IsNullOrWhiteSpace(material))
                material = null;

            // 2. Generate flashcards via AI
            var cards = await _ai.GenerateFlashcardsAsync(cmd.Topic, cmd.Count, material, ct);

            // 3. Persist — non-critical: if DB is unavailable, still return the result
            int? savedId = null;
            var title = $"Flashcards: {cmd.Topic} — {cmd.Count} cards";
            List<AiFlashcardDto> cardDtos;

            try
            {
                var parent = new AiGeneratedContent
                {
                    UserId = cmd.UserId,
                    ContentType = "Flashcards",
                    Title = title,
                    Topic = cmd.Topic,
                    SourceContext = cmd.SourceContext,
                    SourceEntityId = cmd.SourceEntityId,
                    ContentJson = JsonSerializer.Serialize(cards),
                    CreatedAt = DateTime.UtcNow
                };
                _db.AiGeneratedContent.Add(parent);
                await _db.SaveChangesAsync(ct);
                savedId = parent.Id;

                // 4. Persist individual flashcards
                foreach (var c in cards)
                {
                    _db.AiFlashcards.Add(new AiFlashcard
                    {
                        GeneratedContentId = parent.Id,
                        Front = c.Front,
                        Back = c.Back,
                        Topic = c.Topic ?? cmd.Topic
                    });
                }
                await _db.SaveChangesAsync(ct);

                var saved = await _db.AiFlashcards
                    .Where(f => f.GeneratedContentId == parent.Id)
                    .ToListAsync(ct);

                cardDtos = saved.Select(f => new AiFlashcardDto
                {
                    Id = f.Id,
                    Front = f.Front,
                    Back = f.Back,
                    Topic = f.Topic
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not persist flashcards to DB — returning result without saving.");
                cardDtos = cards.Select(c => new AiFlashcardDto
                {
                    Id = 0,
                    Front = c.Front,
                    Back = c.Back,
                    Topic = c.Topic
                }).ToList();
            }

            return new AiFlashcardSetDto
            {
                Id = savedId ?? 0,
                Topic = cmd.Topic,
                Title = title,
                CreatedAt = DateTime.UtcNow,
                Flashcards = cardDtos
            };
        }
    }
}
