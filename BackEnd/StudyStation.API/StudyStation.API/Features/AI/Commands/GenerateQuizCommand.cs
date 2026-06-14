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

    public record GenerateQuizCommand(
        int UserId,
        string Topic,
        int Count,
        string Difficulty,
        string QuestionType,
        int? UploadedFileId,
        string? Content,
        string? SourceContext,
        int? SourceEntityId
    ) : IRequest<AiQuizDto>;

    // ─── Handler ──────────────────────────────────────────────────────────────

    public class GenerateQuizHandler : IRequestHandler<GenerateQuizCommand, AiQuizDto>
    {
        private readonly DatabaseContext _db;
        private readonly IAiService _ai;

        public GenerateQuizHandler(DatabaseContext db, IAiService ai)
        {
            _db = db;
            _ai = ai;
        }

        public async Task<AiQuizDto> Handle(GenerateQuizCommand cmd, CancellationToken ct)
        {
            // 1. Resolve source material
            string? material = cmd.Content;
            if (string.IsNullOrEmpty(material) && cmd.UploadedFileId.HasValue)
            {
                var file = await _db.AiUploadedFiles
                    .FirstOrDefaultAsync(f => f.Id == cmd.UploadedFileId && f.UserId == cmd.UserId, ct);
                material = file?.ExtractedText;
            }

            // 2. Generate quiz via AI
            var questions = await _ai.GenerateQuizAsync(
                cmd.Topic, cmd.Count, cmd.Difficulty, cmd.QuestionType, material, ct);

            // 3. Persist parent AiGeneratedContent
            var parent = new AiGeneratedContent
            {
                UserId = cmd.UserId,
                ContentType = "Quiz",
                Title = $"Quiz: {cmd.Topic} ({cmd.Difficulty}) — {cmd.Count} {cmd.QuestionType} questions",
                Topic = cmd.Topic,
                SourceContext = cmd.SourceContext,
                SourceEntityId = cmd.SourceEntityId,
                ContentJson = JsonSerializer.Serialize(questions),
                CreatedAt = DateTime.UtcNow
            };
            _db.AiGeneratedContent.Add(parent);
            await _db.SaveChangesAsync(ct);

            // 4. Persist individual questions
            foreach (var q in questions)
            {
                _db.AiQuizQuestions.Add(new AiQuizQuestion
                {
                    GeneratedContentId = parent.Id,
                    QuestionText = q.QuestionText,
                    QuestionType = q.QuestionType,
                    OptionsJson = q.Options is not null ? JsonSerializer.Serialize(q.Options) : null,
                    CorrectAnswer = q.CorrectAnswer,
                    Explanation = q.Explanation,
                    DifficultyLevel = q.DifficultyLevel
                });
            }
            await _db.SaveChangesAsync(ct);

            var savedQuestions = await _db.AiQuizQuestions
                .Where(q => q.GeneratedContentId == parent.Id)
                .ToListAsync(ct);

            return new AiQuizDto
            {
                Id = parent.Id,
                Topic = cmd.Topic,
                Title = parent.Title,
                CreatedAt = parent.CreatedAt,
                Questions = savedQuestions.Select(q => new AiQuizQuestionDto
                {
                    Id = q.Id,
                    QuestionText = q.QuestionText,
                    QuestionType = q.QuestionType,
                    Options = q.OptionsJson is not null
                        ? System.Text.Json.JsonSerializer.Deserialize<List<string>>(q.OptionsJson)
                        : null,
                    CorrectAnswer = q.CorrectAnswer,
                    Explanation = q.Explanation,
                    DifficultyLevel = q.DifficultyLevel
                }).ToList()
            };
        }
    }
}
