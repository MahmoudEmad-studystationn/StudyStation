using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyStation.API.Features.AI.Commands;
using StudyStation.API.Features.AI.DTOs;
using StudyStation.API.Features.AI.Queries;
using System.Security.Claims;

namespace StudyStation.API.Controllers
{
    /// <summary>
    /// AI integration for Solo Study Room sessions.
    /// Handles in-session AI chat and post-session analytics.
    /// </summary>
    [ApiController]
    [Route("api/AI/sessions")]
    [Authorize]
    public class AiSessionController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AiSessionController(IMediator mediator) => _mediator = mediator;

        private int CurrentUserId =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException());

        /// <summary>Chat with the AI in the context of an active study session.</summary>
        [HttpPost("{sessionId:int}/chat")]
        public async Task<IActionResult> ChatInSession(
            int sessionId,
            [FromBody] AiChatRequestDto request,
            CancellationToken ct = default)
        {
            var result = await _mediator.Send(new SendAiMessageCommand(
                UserId: CurrentUserId,
                Message: request.Message,
                ConversationId: request.ConversationId,
                Context: "SoloRoom",
                ContextEntityId: sessionId,
                UploadedFileId: request.UploadedFileId), ct);
            return Ok(result);
        }

        /// <summary>
        /// Trigger comprehensive AI analysis of a completed study session.
        /// Generates summary, key concepts, flashcards, quiz, and study recommendations.
        /// Stores all results and updates the user's learning memory.
        /// </summary>
        [HttpPost("{sessionId:int}/analyze")]
        public async Task<IActionResult> AnalyzeSession(
            int sessionId,
            [FromBody] AnalyzeSessionRequestDto request,
            CancellationToken ct = default)
        {
            try
            {
                var result = await _mediator.Send(new AnalyzeSessionCommand(
                    UserId: CurrentUserId,
                    StudySessionId: sessionId,
                    StudyContent: request.StudyContent,
                    UploadedFileId: request.UploadedFileId), ct);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>Get previously generated analytics for a study session.</summary>
        [HttpGet("{sessionId:int}/analytics")]
        public async Task<IActionResult> GetSessionAnalytics(
            int sessionId,
            CancellationToken ct = default)
        {
            var result = await _mediator.Send(new GetSessionAnalyticsQuery(CurrentUserId, sessionId), ct);
            if (result is null)
                return NotFound(new { message = "No analytics found for this session. Use POST /analyze to generate them." });

            return Ok(result);
        }

        /// <summary>Generate a quiz specifically for the study session's subject.</summary>
        [HttpPost("{sessionId:int}/quiz")]
        public async Task<IActionResult> GenerateSessionQuiz(
            int sessionId,
            [FromBody] AiGenerateRequestDto request,
            CancellationToken ct = default)
        {
            var result = await _mediator.Send(new GenerateQuizCommand(
                UserId: CurrentUserId,
                Topic: request.Topic,
                Count: request.Count,
                Difficulty: request.Difficulty,
                QuestionType: request.QuestionType,
                UploadedFileId: request.UploadedFileId,
                Content: request.Content,
                SourceContext: "Session",
                SourceEntityId: sessionId), ct);
            return Ok(result);
        }

        /// <summary>Generate flashcards for the study session's topic.</summary>
        [HttpPost("{sessionId:int}/flashcards")]
        public async Task<IActionResult> GenerateSessionFlashcards(
            int sessionId,
            [FromBody] AiGenerateRequestDto request,
            CancellationToken ct = default)
        {
            var result = await _mediator.Send(new GenerateFlashcardsCommand(
                UserId: CurrentUserId,
                Topic: request.Topic,
                Count: request.Count,
                UploadedFileId: request.UploadedFileId,
                Content: request.Content,
                SourceContext: "Session",
                SourceEntityId: sessionId), ct);
            return Ok(result);
        }
    }
}
