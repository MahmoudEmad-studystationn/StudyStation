using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.AI.Models;
using StudyStation.API.Services;
using System.Text.Json;

namespace StudyStation.API.Features.AI.Commands
{
    // ─── Command ──────────────────────────────────────────────────────────────

    public record UpdateLearningMemoryCommand(
        int UserId,
        string Subject,
        List<string>? WeakTopics,
        int QuizzesGenerated,
        int FlashcardsGenerated,
        bool IsSessionAnalyzed
    ) : IRequest;

    // ─── Handler ──────────────────────────────────────────────────────────────

    public class UpdateLearningMemoryHandler : IRequestHandler<UpdateLearningMemoryCommand>
    {
        private readonly DatabaseContext _db;
        private readonly IAiService _ai;

        public UpdateLearningMemoryHandler(DatabaseContext db, IAiService ai)
        {
            _db = db;
            _ai = ai;
        }

        public async Task Handle(UpdateLearningMemoryCommand cmd, CancellationToken ct)
        {
            // Upsert the UserLearningMemory record
            var memory = await _db.UserLearningMemory
                .FirstOrDefaultAsync(m => m.UserId == cmd.UserId, ct);

            if (memory is null)
            {
                memory = new UserLearningMemory { UserId = cmd.UserId };
                _db.UserLearningMemory.Add(memory);
            }

            // Update counts
            if (cmd.IsSessionAnalyzed) memory.TotalSessionsAnalyzed++;
            memory.TotalQuizzesGenerated += cmd.QuizzesGenerated;
            memory.TotalFlashcardsGenerated += cmd.FlashcardsGenerated;
            memory.LastStudiedAt = DateTime.UtcNow;

            // Update studied subjects list
            var subjects = DeserializeList(memory.StudiedSubjectsJson);
            if (!string.IsNullOrEmpty(cmd.Subject) && !subjects.Contains(cmd.Subject, StringComparer.OrdinalIgnoreCase))
                subjects.Add(cmd.Subject);
            memory.StudiedSubjectsJson = JsonSerializer.Serialize(subjects);

            // Merge weak topics
            if (cmd.WeakTopics?.Count > 0)
            {
                var weak = DeserializeList(memory.WeakTopicsJson);
                foreach (var topic in cmd.WeakTopics)
                    if (!weak.Contains(topic, StringComparer.OrdinalIgnoreCase))
                        weak.Add(topic);
                memory.WeakTopicsJson = JsonSerializer.Serialize(weak);
            }

            memory.UpdatedAt = DateTime.UtcNow;

            // Regenerate recommendations every 3 sessions
            if (memory.TotalSessionsAnalyzed % 3 == 0)
            {
                try
                {
                    var recommendations = await _ai.GenerateRecommendationsAsync(memory, ct);
                    memory.PersonalizedRecommendationsJson = recommendations;
                }
                catch { /* Non-critical — don't fail the whole operation */ }
            }

            await _db.SaveChangesAsync(ct);
        }

        private static List<string> DeserializeList(string? json)
        {
            if (string.IsNullOrEmpty(json)) return new();
            try { return JsonSerializer.Deserialize<List<string>>(json) ?? new(); }
            catch { return new(); }
        }
    }
}
