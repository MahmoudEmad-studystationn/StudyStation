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

    public record AnalyzeSessionCommand(
        int UserId,
        int StudySessionId,
        string? StudyContent,
        int? UploadedFileId
    ) : IRequest<SessionAnalyticsDto>;

    // ─── Handler ──────────────────────────────────────────────────────────────

    public class AnalyzeSessionHandler : IRequestHandler<AnalyzeSessionCommand, SessionAnalyticsDto>
    {
        private readonly DatabaseContext _db;
        private readonly IAiService _ai;
        private readonly IMediator _mediator;

        public AnalyzeSessionHandler(DatabaseContext db, IAiService ai, IMediator mediator)
        {
            _db = db;
            _ai = ai;
            _mediator = mediator;
        }

        public async Task<SessionAnalyticsDto> Handle(AnalyzeSessionCommand cmd, CancellationToken ct)
        {
            // 1. Resolve study session
            var session = await _db.StudySessions
                .FirstOrDefaultAsync(s => s.Id == cmd.StudySessionId && s.UserId == cmd.UserId, ct)
                ?? throw new KeyNotFoundException("Study session not found.");

            // 2. Resolve study content
            var content = cmd.StudyContent ?? string.Empty;
            if (string.IsNullOrEmpty(content) && cmd.UploadedFileId.HasValue)
            {
                var file = await _db.AiUploadedFiles
                    .FirstOrDefaultAsync(f => f.Id == cmd.UploadedFileId && f.UserId == cmd.UserId, ct);
                content = file?.ExtractedText ?? string.Empty;
            }

            if (string.IsNullOrWhiteSpace(content))
                content = $"This was a study session on {session.SubjectName}. Provide a general analysis and study recommendations.";

            // 3. Call AI for deep analysis
            var analytics = await _ai.AnalyzeSessionAsync(content, session.SubjectName, ct);
            analytics.SessionId = session.Id;

            // 4. Persist session analytics as AiGeneratedContent
            var parent = new AiGeneratedContent
            {
                UserId = cmd.UserId,
                ContentType = "SessionAnalysis",
                Title = $"Session Analysis — {session.SubjectName} ({session.StartTime:MMM d, yyyy})",
                Topic = session.SubjectName,
                SourceContext = "Session",
                SourceEntityId = session.Id,
                ContentJson = JsonSerializer.Serialize(analytics),
                CreatedAt = DateTime.UtcNow
            };
            _db.AiGeneratedContent.Add(parent);
            await _db.SaveChangesAsync(ct);

            // 5. Persist flashcards if generated
            if (analytics.Flashcards?.Flashcards?.Count > 0)
            {
                var flashcardContent = new AiGeneratedContent
                {
                    UserId = cmd.UserId,
                    ContentType = "Flashcards",
                    Title = $"Session Flashcards — {session.SubjectName}",
                    Topic = session.SubjectName,
                    SourceContext = "Session",
                    SourceEntityId = session.Id,
                    ContentJson = JsonSerializer.Serialize(analytics.Flashcards.Flashcards),
                    CreatedAt = DateTime.UtcNow
                };
                _db.AiGeneratedContent.Add(flashcardContent);
                await _db.SaveChangesAsync(ct);

                foreach (var f in analytics.Flashcards.Flashcards)
                    _db.AiFlashcards.Add(new AiFlashcard
                    {
                        GeneratedContentId = flashcardContent.Id,
                        Front = f.Front,
                        Back = f.Back,
                        Topic = f.Topic ?? session.SubjectName
                    });
            }

            // 6. Persist quiz if generated
            if (analytics.Quiz?.Questions?.Count > 0)
            {
                var quizContent = new AiGeneratedContent
                {
                    UserId = cmd.UserId,
                    ContentType = "Quiz",
                    Title = $"Session Quiz — {session.SubjectName}",
                    Topic = session.SubjectName,
                    SourceContext = "Session",
                    SourceEntityId = session.Id,
                    ContentJson = JsonSerializer.Serialize(analytics.Quiz.Questions),
                    CreatedAt = DateTime.UtcNow
                };
                _db.AiGeneratedContent.Add(quizContent);
                await _db.SaveChangesAsync(ct);

                foreach (var q in analytics.Quiz.Questions)
                    _db.AiQuizQuestions.Add(new AiQuizQuestion
                    {
                        GeneratedContentId = quizContent.Id,
                        QuestionText = q.QuestionText,
                        QuestionType = q.QuestionType,
                        OptionsJson = q.Options is not null ? JsonSerializer.Serialize(q.Options) : null,
                        CorrectAnswer = q.CorrectAnswer,
                        Explanation = q.Explanation,
                        DifficultyLevel = q.DifficultyLevel
                    });
            }

            await _db.SaveChangesAsync(ct);

            // 7. Update learning memory
            await _mediator.Send(new UpdateLearningMemoryCommand(
                UserId: cmd.UserId,
                Subject: session.SubjectName,
                WeakTopics: analytics.TopicsRequiringMoreReview,
                QuizzesGenerated: analytics.Quiz?.Questions?.Count > 0 ? 1 : 0,
                FlashcardsGenerated: analytics.Flashcards?.Flashcards?.Count ?? 0,
                IsSessionAnalyzed: true), ct);

            return analytics;
        }
    }
}
