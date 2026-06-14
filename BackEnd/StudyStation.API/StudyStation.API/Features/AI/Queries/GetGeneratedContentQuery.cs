using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.AI.DTOs;
using StudyStation.API.Features.AI.Models;
using System.Text.Json;

namespace StudyStation.API.Features.AI.Queries
{
    // ─── Queries ──────────────────────────────────────────────────────────────

    public record GetGeneratedContentListQuery(
        int UserId,
        string? ContentType = null,
        string? SourceContext = null
    ) : IRequest<List<AiGeneratedContentSummaryDto>>;

    public record GetGeneratedContentDetailQuery(
        int UserId,
        int ContentId
    ) : IRequest<object>;

    // ─── Handlers ─────────────────────────────────────────────────────────────

    public class GetGeneratedContentListHandler : IRequestHandler<GetGeneratedContentListQuery, List<AiGeneratedContentSummaryDto>>
    {
        private readonly DatabaseContext _db;
        public GetGeneratedContentListHandler(DatabaseContext db) => _db = db;

        public async Task<List<AiGeneratedContentSummaryDto>> Handle(GetGeneratedContentListQuery req, CancellationToken ct)
        {
            var query = _db.AiGeneratedContent.Where(c => c.UserId == req.UserId);

            if (!string.IsNullOrEmpty(req.ContentType))
                query = query.Where(c => c.ContentType == req.ContentType);

            if (!string.IsNullOrEmpty(req.SourceContext))
                query = query.Where(c => c.SourceContext == req.SourceContext);

            return await query
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new AiGeneratedContentSummaryDto
                {
                    Id = c.Id,
                    ContentType = c.ContentType,
                    Title = c.Title,
                    Topic = c.Topic,
                    SourceContext = c.SourceContext,
                    SourceEntityId = c.SourceEntityId,
                    CreatedAt = c.CreatedAt
                })
                .ToListAsync(ct);
        }
    }

    public class GetGeneratedContentDetailHandler : IRequestHandler<GetGeneratedContentDetailQuery, object>
    {
        private readonly DatabaseContext _db;
        public GetGeneratedContentDetailHandler(DatabaseContext db) => _db = db;

        public async Task<object> Handle(GetGeneratedContentDetailQuery req, CancellationToken ct)
        {
            var content = await _db.AiGeneratedContent
                .Include(c => c.QuizQuestions)
                .Include(c => c.Flashcards)
                .FirstOrDefaultAsync(c => c.Id == req.ContentId && c.UserId == req.UserId, ct)
                ?? throw new KeyNotFoundException("Generated content not found.");

            // Return enriched DTO depending on content type
            if (content.ContentType == "Quiz")
            {
                return new AiQuizDto
                {
                    Id = content.Id,
                    Topic = content.Topic ?? string.Empty,
                    Title = content.Title,
                    CreatedAt = content.CreatedAt,
                    Questions = content.QuizQuestions.Select(q => new AiQuizQuestionDto
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
                    }).ToList()
                };
            }

            if (content.ContentType == "Flashcards")
            {
                return new AiFlashcardSetDto
                {
                    Id = content.Id,
                    Topic = content.Topic ?? string.Empty,
                    Title = content.Title,
                    CreatedAt = content.CreatedAt,
                    Flashcards = content.Flashcards.Select(f => new AiFlashcardDto
                    {
                        Id = f.Id,
                        Front = f.Front,
                        Back = f.Back,
                        Topic = f.Topic
                    }).ToList()
                };
            }

            // Generic fallback — return summary + raw content
            return new
            {
                content.Id,
                content.ContentType,
                content.Title,
                content.Topic,
                content.SourceContext,
                content.SourceEntityId,
                content.ContentJson,
                content.CreatedAt
            };
        }
    }
}
