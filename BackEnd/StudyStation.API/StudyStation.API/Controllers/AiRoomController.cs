using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyStation.API.Data;
using StudyStation.API.Features.AI.Commands;
using StudyStation.API.Features.AI.DTOs;
using StudyStation.API.Features.AI.Queries;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace StudyStation.API.Controllers
{
    /// <summary>
    /// AI integration for Study With Friends rooms.
    /// Supports shared group AI chat, post-session group analytics, and per-room content generation.
    /// </summary>
    [ApiController]
    [Route("api/AI/rooms")]
    [Authorize]
    public class AiRoomController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly DatabaseContext _db;

        public AiRoomController(IMediator mediator, DatabaseContext db)
        {
            _mediator = mediator;
            _db = db;
        }

        private int CurrentUserId =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException());

        // ─── Shared AI Chat ──────────────────────────────────────────────────

        /// <summary>Send a message to the shared AI chat in a group study room. All room members can see this.</summary>
        [HttpPost("{roomId:int}/chat")]
        public async Task<IActionResult> ChatInRoom(
            int roomId,
            [FromBody] AiChatRequestDto request,
            CancellationToken ct = default)
        {
            try
            {
                var result = await _mediator.Send(new SendRoomAiMessageCommand(
                    UserId: CurrentUserId,
                    RoomId: roomId,
                    Message: request.Message,
                    ConversationId: request.ConversationId,
                    UploadedFileId: request.UploadedFileId), ct);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>Get all shared AI conversations for a room.</summary>
        [HttpGet("{roomId:int}/conversations")]
        public async Task<IActionResult> GetRoomConversations(
            int roomId,
            CancellationToken ct = default)
        {
            // Verify user is a member
            var isMember = await _db.RoomParticipants
                .AnyAsync(rp => rp.RoomId == roomId && rp.UserId == CurrentUserId, ct);
            if (!isMember)
                return Forbid();

            var result = await _mediator.Send(new GetRoomConversationsQuery(roomId), ct);
            return Ok(result);
        }

        /// <summary>Get all messages in a shared room AI conversation.</summary>
        [HttpGet("{roomId:int}/conversations/{conversationId:int}/messages")]
        public async Task<IActionResult> GetRoomConversationMessages(
            int roomId,
            int conversationId,
            CancellationToken ct = default)
        {
            // Verify user is a member
            var isMember = await _db.RoomParticipants
                .AnyAsync(rp => rp.RoomId == roomId && rp.UserId == CurrentUserId, ct);
            if (!isMember)
                return Forbid();

            try
            {
                var result = await _mediator.Send(new GetRoomConversationHistoryQuery(roomId, conversationId), ct);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>Delete a shared room AI conversation (room owner only).</summary>
        [HttpDelete("{roomId:int}/conversations/{conversationId:int}")]
        public async Task<IActionResult> DeleteRoomConversation(
            int roomId,
            int conversationId,
            CancellationToken ct = default)
        {
            // Verify user is the room owner
            var room = await _db.StudyRooms.FindAsync(new object[] { roomId }, ct);
            if (room is null)
                return NotFound(new { message = "Room not found." });
            if (room.OwnerId != CurrentUserId)
                return Forbid();

            var conversation = await _db.AiConversations
                .FirstOrDefaultAsync(c => c.Id == conversationId && c.RoomId == roomId, ct);
            if (conversation is null)
                return NotFound(new { message = "Conversation not found." });

            _db.AiConversations.Remove(conversation);
            await _db.SaveChangesAsync(ct);
            return NoContent();
        }

        // ─── Group Analytics ─────────────────────────────────────────────────

        /// <summary>
        /// Trigger comprehensive AI analysis of the group study session.
        /// Generates group summary, meeting notes, key takeaways, flashcards, and team quiz.
        /// Persists results for ALL participants.
        /// </summary>
        [HttpPost("{roomId:int}/analyze")]
        public async Task<IActionResult> AnalyzeGroupSession(
            int roomId,
            [FromBody] AnalyzeGroupSessionRequestDto request,
            CancellationToken ct = default)
        {
            try
            {
                var result = await _mediator.Send(new AnalyzeGroupSessionCommand(
                    RoomId: roomId,
                    SessionEndedAt: request.SessionEndedAt), ct);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>Get the most recent group session analytics for a room.</summary>
        [HttpGet("{roomId:int}/analytics")]
        public async Task<IActionResult> GetGroupAnalytics(
            int roomId,
            CancellationToken ct = default)
        {
            var result = await _mediator.Send(new GetGroupAnalyticsQuery(CurrentUserId, roomId), ct);
            if (result is null)
                return NotFound(new { message = "No analytics found for this room session. Use POST /analyze to generate them." });

            return Ok(result);
        }

        // ─── Content Generation ──────────────────────────────────────────────

        /// <summary>Generate flashcards for the room's subject.</summary>
        [HttpPost("{roomId:int}/flashcards")]
        public async Task<IActionResult> GenerateRoomFlashcards(
            int roomId,
            [FromBody] AiGenerateRequestDto request,
            CancellationToken ct = default)
        {
            var result = await _mediator.Send(new GenerateFlashcardsCommand(
                UserId: CurrentUserId,
                Topic: request.Topic,
                Count: request.Count,
                UploadedFileId: request.UploadedFileId,
                Content: request.Content,
                SourceContext: "Room",
                SourceEntityId: roomId), ct);
            return Ok(result);
        }

        /// <summary>Generate a quiz for the group room's subject.</summary>
        [HttpPost("{roomId:int}/quiz")]
        public async Task<IActionResult> GenerateRoomQuiz(
            int roomId,
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
                SourceContext: "Room",
                SourceEntityId: roomId), ct);
            return Ok(result);
        }

        /// <summary>Get all generated content (flashcards, quizzes, summaries) for a room.</summary>
        [HttpGet("{roomId:int}/generated-content")]
        public async Task<IActionResult> GetRoomGeneratedContent(
            int roomId,
            CancellationToken ct = default)
        {
            var result = await _mediator.Send(
                new GetGeneratedContentListQuery(CurrentUserId, null, "Room"), ct);

            // Filter to this specific room
            var filtered = result.Where(c => c.SourceEntityId == roomId).ToList();
            return Ok(filtered);
        }
    }
}
