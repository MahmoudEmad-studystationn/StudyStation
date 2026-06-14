using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.AI.DTOs;
using StudyStation.API.Features.AI.Models;
using StudyStation.API.Services;
using System.Text;
using System.Text.Json;

namespace StudyStation.API.Features.AI.Commands
{
    // ─── Command ──────────────────────────────────────────────────────────────

    public record AnalyzeGroupSessionCommand(
        int RoomId,
        DateTime? SessionEndedAt
    ) : IRequest<GroupSessionAnalyticsDto>;

    // ─── Handler ──────────────────────────────────────────────────────────────

    public class AnalyzeGroupSessionHandler : IRequestHandler<AnalyzeGroupSessionCommand, GroupSessionAnalyticsDto>
    {
        private readonly DatabaseContext _db;
        private readonly IAiService _ai;
        private readonly IMediator _mediator;

        public AnalyzeGroupSessionHandler(DatabaseContext db, IAiService ai, IMediator mediator)
        {
            _db = db;
            _ai = ai;
            _mediator = mediator;
        }

        public async Task<GroupSessionAnalyticsDto> Handle(AnalyzeGroupSessionCommand cmd, CancellationToken ct)
        {
            // 1. Load room
            var room = await _db.StudyRooms
                .Include(r => r.Participants).ThenInclude(p => p.User)
                .Include(r => r.Messages).ThenInclude(m => m.Sender)
                .FirstOrDefaultAsync(r => r.Id == cmd.RoomId, ct)
                ?? throw new KeyNotFoundException("Study room not found.");

            // 2. Build chat log from room messages
            var cutoff = cmd.SessionEndedAt ?? DateTime.UtcNow;
            var chatLog = BuildChatLog(room.Messages
                .Where(m => m.SentAt <= cutoff)
                .OrderBy(m => m.SentAt)
                .ToList());

            if (string.IsNullOrWhiteSpace(chatLog))
                chatLog = $"This was a group study session about {room.Subject}. No chat messages were recorded.";

            // 3. Call AI
            var analytics = await _ai.AnalyzeGroupSessionAsync(chatLog, room.Subject, ct);
            analytics.RoomId = room.Id;

            var analyticsJson = JsonSerializer.Serialize(analytics);

            // 4. Persist one AiGeneratedContent per participant
            var participantUserIds = room.Participants.Select(p => p.UserId).ToList();

            foreach (var userId in participantUserIds)
            {
                var content = new AiGeneratedContent
                {
                    UserId = userId,
                    ContentType = "GroupSummary",
                    Title = $"Group Session Summary — {room.Name} ({room.Subject})",
                    Topic = room.Subject,
                    SourceContext = "Room",
                    SourceEntityId = room.Id,
                    ContentJson = analyticsJson,
                    CreatedAt = DateTime.UtcNow
                };
                _db.AiGeneratedContent.Add(content);
                await _db.SaveChangesAsync(ct);

                // Persist flashcards per participant
                if (analytics.Flashcards?.Flashcards?.Count > 0)
                {
                    var flashcardContent = new AiGeneratedContent
                    {
                        UserId = userId,
                        ContentType = "Flashcards",
                        Title = $"Group Flashcards — {room.Subject}",
                        Topic = room.Subject,
                        SourceContext = "Room",
                        SourceEntityId = room.Id,
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
                            Topic = f.Topic ?? room.Subject
                        });
                }

                // Persist quiz per participant
                if (analytics.TeamQuiz?.Questions?.Count > 0)
                {
                    var quizContent = new AiGeneratedContent
                    {
                        UserId = userId,
                        ContentType = "Quiz",
                        Title = $"Team Quiz — {room.Subject}",
                        Topic = room.Subject,
                        SourceContext = "Room",
                        SourceEntityId = room.Id,
                        ContentJson = JsonSerializer.Serialize(analytics.TeamQuiz.Questions),
                        CreatedAt = DateTime.UtcNow
                    };
                    _db.AiGeneratedContent.Add(quizContent);
                    await _db.SaveChangesAsync(ct);

                    foreach (var q in analytics.TeamQuiz.Questions)
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

                // Update learning memory for each participant
                await _mediator.Send(new UpdateLearningMemoryCommand(
                    UserId: userId,
                    Subject: room.Subject,
                    WeakTopics: analytics.SuggestedFollowUpTopics,
                    QuizzesGenerated: analytics.TeamQuiz?.Questions?.Count > 0 ? 1 : 0,
                    FlashcardsGenerated: analytics.Flashcards?.Flashcards?.Count ?? 0,
                    IsSessionAnalyzed: true), ct);
            }

            return analytics;
        }

        private static string BuildChatLog(List<StudyStation.API.Features.StudyWithFriends.Models.RoomMessage> messages)
        {
            var sb = new StringBuilder();
            foreach (var msg in messages)
            {
                var name = msg.Sender?.UserName ?? "Unknown";
                sb.AppendLine($"[{msg.SentAt:HH:mm}] {name}: {msg.Content}");
            }
            return sb.ToString();
        }
    }
}
