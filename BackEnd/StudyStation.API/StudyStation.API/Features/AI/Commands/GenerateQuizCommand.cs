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
        private readonly ILogger<GenerateQuizHandler> _logger;

        public GenerateQuizHandler(DatabaseContext db, IAiService ai, ILogger<GenerateQuizHandler> logger)
        {
            _db = db;
            _ai = ai;
            _logger = logger;
        }

        public async Task<AiQuizDto> Handle(GenerateQuizCommand cmd, CancellationToken ct)
        {
            // 1. Resolve source material
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
            // empty study-material block into the prompt (otherwise the quiz silently ignores
            // the uploaded file and generates questions from the topic only).
            if (string.IsNullOrWhiteSpace(material))
                material = null;

            // 2. Generate quiz via AI
            var questions = await _ai.GenerateQuizAsync(
                cmd.Topic, cmd.Count, cmd.Difficulty, cmd.QuestionType, material, ct);

            // 3. Persist — non-critical: if DB is unavailable, still return the result
            int? savedId = null;
            var title = $"Quiz: {cmd.Topic} ({cmd.Difficulty}) — {cmd.Count} {cmd.QuestionType} questions";
            List<AiQuizQuestionDto> questionDtos;

            try
            {
                var parent = new AiGeneratedContent
                {
                    UserId = cmd.UserId,
                    ContentType = "Quiz",
                    Title = title,
                    Topic = cmd.Topic,
                    SourceContext = cmd.SourceContext,
                    SourceEntityId = cmd.SourceEntityId,
                    ContentJson = JsonSerializer.Serialize(questions),
                    CreatedAt = DateTime.UtcNow
                };
                _db.AiGeneratedContent.Add(parent);
                await _db.SaveChangesAsync(ct);
                savedId = parent.Id;

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

                questionDtos = savedQuestions.Select(q => new AiQuizQuestionDto
                {
                    Id = q.Id,
                    QuestionText = q.QuestionText,
                    QuestionType = q.QuestionType,
                    Options = q.OptionsJson is not null
                        ? JsonSerializer.Deserialize<List<string>>(q.OptionsJson)
                        : null,
                    CorrectAnswer = q.CorrectAnswer,
                    Explanation = q.Explanation,
                    DifficultyLevel = q.DifficultyLevel
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not persist quiz to DB — returning result without saving.");
                questionDtos = questions.Select(q => new AiQuizQuestionDto
                {
                    Id = 0,
                    QuestionText = q.QuestionText,
                    QuestionType = q.QuestionType,
                    Options = q.Options,
                    CorrectAnswer = q.CorrectAnswer,
                    Explanation = q.Explanation,
                    DifficultyLevel = q.DifficultyLevel
                }).ToList();
            }

            return new AiQuizDto
            {
                Id = savedId ?? 0,
                Topic = cmd.Topic,
                Title = title,
                CreatedAt = DateTime.UtcNow,
                Questions = questionDtos
            };
        }
    }
}
