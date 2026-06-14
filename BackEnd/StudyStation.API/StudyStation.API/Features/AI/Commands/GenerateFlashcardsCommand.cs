using MediatR;
using Microsoft.EntityFrameworkCore;
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

        public GenerateFlashcardsHandler(DatabaseContext db, IAiService ai)
        {
            _db = db;
            _ai = ai;
        }

        public async Task<AiFlashcardSetDto> Handle(GenerateFlashcardsCommand cmd, CancellationToken ct)
        {
            // 1. Resolve source material
            string? material = cmd.Content;
            if (string.IsNullOrEmpty(material) && cmd.UploadedFileId.HasValue)
            {
                var file = await _db.AiUploadedFiles
                    .FirstOrDefaultAsync(f => f.Id == cmd.UploadedFileId && f.UserId == cmd.UserId, ct);
                material = file?.ExtractedText;
            }

            // 2. Generate flashcards via AI
            var flashcards = await _ai.GenerateFlashcardsAsync(cmd.Topic, cmd.Count, material, ct);

            // 3. Persist parent AiGeneratedContent
            var parent = new AiGeneratedContent
            {
                UserId = cmd.UserId,
                ContentType = "Flashcards",
                Title = $"Flashcards: {cmd.Topic} ({cmd.Count} cards)",
                Topic = cmd.Topic,
                SourceContext = cmd.SourceContext,
                SourceEntityId = cmd.SourceEntityId,
                ContentJson = JsonSerializer.Serialize(flashcards),
                CreatedAt = DateTime.UtcNow
            };
            _db.AiGeneratedContent.Add(parent);
            await _db.SaveChangesAsync(ct);

            // 4. Persist individual flashcards
            foreach (var f in flashcards)
            {
                _db.AiFlashcards.Add(new AiFlashcard
                {
                    GeneratedContentId = parent.Id,
                    Front = f.Front,
                    Back = f.Back,
                    Topic = f.Topic ?? cmd.Topic
                });
            }
            await _db.SaveChangesAsync(ct);

            var savedFlashcards = await _db.AiFlashcards
                .Where(f => f.GeneratedContentId == parent.Id)
                .ToListAsync(ct);

            return new AiFlashcardSetDto
            {
                Id = parent.Id,
                Topic = cmd.Topic,
                Title = parent.Title,
                CreatedAt = parent.CreatedAt,
                Flashcards = savedFlashcards.Select(f => new AiFlashcardDto
                {
                    Id = f.Id,
                    Front = f.Front,
                    Back = f.Back,
                    Topic = f.Topic
                }).ToList()
            };
        }
    }
}
