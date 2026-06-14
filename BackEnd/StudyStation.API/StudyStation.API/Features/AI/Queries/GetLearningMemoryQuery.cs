using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.AI.DTOs;
using System.Text.Json;

namespace StudyStation.API.Features.AI.Queries
{
    // ─── Query ────────────────────────────────────────────────────────────────

    public record GetLearningMemoryQuery(int UserId) : IRequest<LearningMemoryDto>;

    // ─── Handler ──────────────────────────────────────────────────────────────

    public class GetLearningMemoryHandler : IRequestHandler<GetLearningMemoryQuery, LearningMemoryDto>
    {
        private readonly DatabaseContext _db;
        public GetLearningMemoryHandler(DatabaseContext db) => _db = db;

        public async Task<LearningMemoryDto> Handle(GetLearningMemoryQuery req, CancellationToken ct)
        {
            var memory = await _db.UserLearningMemory
                .Include(m => m.TopicPerformances)
                .FirstOrDefaultAsync(m => m.UserId == req.UserId, ct);

            if (memory is null)
            {
                return new LearningMemoryDto
                {
                    UpdatedAt = DateTime.UtcNow
                };
            }

            return new LearningMemoryDto
            {
                TotalSessionsAnalyzed = memory.TotalSessionsAnalyzed,
                TotalQuizzesGenerated = memory.TotalQuizzesGenerated,
                TotalFlashcardsGenerated = memory.TotalFlashcardsGenerated,
                LastStudiedAt = memory.LastStudiedAt,
                StudiedSubjects = Deserialize(memory.StudiedSubjectsJson),
                WeakTopics = Deserialize(memory.WeakTopicsJson),
                StrongTopics = Deserialize(memory.StrongTopicsJson),
                PersonalizedRecommendations = memory.PersonalizedRecommendationsJson,
                TopicPerformances = memory.TopicPerformances.Select(p => new TopicPerformanceDto
                {
                    Topic = p.Topic,
                    TotalAttempts = p.TotalAttempts,
                    CorrectAnswers = p.CorrectAnswers,
                    Proficiency = p.Proficiency,
                    LastAttemptAt = p.LastAttemptAt
                }).ToList(),
                UpdatedAt = memory.UpdatedAt
            };
        }

        private static List<string> Deserialize(string? json)
        {
            if (string.IsNullOrEmpty(json)) return new();
            try { return JsonSerializer.Deserialize<List<string>>(json) ?? new(); }
            catch { return new(); }
        }
    }
}
