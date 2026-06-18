using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyStation.API.Data;
using StudyStation.API.Features.AI.Commands;
using StudyStation.API.Features.AI.DTOs;
using StudyStation.API.Features.AI.Queries;
using System.Security.Claims;

namespace StudyStation.API.Controllers
{
    /// <summary>
    /// Main AI Hub controller — handles the standalone AI Assistant page,
    /// general chat, content generation, file upload, and learning memory.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AiController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly DatabaseContext _db;

        public AiController(IMediator mediator, DatabaseContext db)
        {
            _mediator = mediator;
            _db = db;
        }

        private int CurrentUserId =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException());

        // ─── Conversations ─────────────────────────────────────────────────────

        /// <summary>Get all conversations for the authenticated user.</summary>
        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations(
            [FromQuery] string? context = null,
            CancellationToken ct = default)
        {
            var result = await _mediator.Send(new GetUserConversationsQuery(CurrentUserId, context), ct);
            return Ok(result);
        }

        /// <summary>Get all messages in a specific conversation.</summary>
        [HttpGet("conversations/{conversationId:int}/messages")]
        public async Task<IActionResult> GetConversationMessages(
            int conversationId,
            CancellationToken ct = default)
        {
            try
            {
                var result = await _mediator.Send(new GetConversationHistoryQuery(CurrentUserId, conversationId), ct);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>Delete a conversation and all its messages.</summary>
        [HttpDelete("conversations/{conversationId:int}")]
        public async Task<IActionResult> DeleteConversation(int conversationId)
        {
            var conversation = await _db.AiConversations.FindAsync(conversationId);
            if (conversation is null || conversation.UserId != CurrentUserId)
                return NotFound(new { message = "Conversation not found." });

            _db.AiConversations.Remove(conversation);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // ─── Chat ──────────────────────────────────────────────────────────────

        /// <summary>Send a message to the AI assistant. Creates a new conversation if ConversationId is null.</summary>
        [HttpPost("chat")]
        public async Task<IActionResult> Chat(
            [FromBody] AiChatRequestDto request,
            CancellationToken ct = default)
        {
            var result = await _mediator.Send(new SendAiMessageCommand(
                UserId: CurrentUserId,
                Message: request.Message,
                ConversationId: request.ConversationId,
                Context: request.Context,
                ContextEntityId: request.ContextEntityId,
                UploadedFileId: request.UploadedFileId), ct);
            return Ok(result);
        }

        // ─── File Upload ───────────────────────────────────────────────────────

        /// <summary>Upload a study material file (PDF or TXT) for AI context injection.</summary>
        [HttpPost("upload")]
        [RequestSizeLimit(20 * 1024 * 1024)]
        public async Task<IActionResult> UploadStudyMaterial(
            IFormFile file,
            CancellationToken ct = default)
        {
            if (file is null || file.Length == 0)
                return BadRequest(new { message = "No file provided." });

            var allowedExtensions = new[] { ".pdf", ".txt", ".md", ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
                return BadRequest(new { message = "Only PDF, TXT, MD, and image files (JPG, PNG, GIF, BMP, WEBP) are supported." });

            var result = await _mediator.Send(new UploadStudyMaterialCommand(CurrentUserId, file), ct);
            return Ok(result);
        }

        // ─── Generation Endpoints ─────────────────────────────────────────────

        /// <summary>Generate a quiz from a topic, content, or uploaded file.</summary>
        [HttpPost("quiz")]
        public async Task<IActionResult> GenerateQuiz(
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
                SourceContext: "Hub",
                SourceEntityId: null), ct);
            return Ok(result);
        }

        /// <summary>Generate flashcards from a topic, content, or uploaded file.</summary>
        [HttpPost("flashcards")]
        public async Task<IActionResult> GenerateFlashcards(
            [FromBody] AiFlashcardRequestDto request,
            CancellationToken ct = default)
        {
            var result = await _mediator.Send(new GenerateFlashcardsCommand(
                UserId: CurrentUserId,
                Topic: request.Topic,
                Count: request.Count,
                UploadedFileId: request.UploadedFileId,
                Content: request.Content,
                SourceContext: "Hub",
                SourceEntityId: null), ct);
            return Ok(result);
        }

        /// <summary>Explain a concept in simple terms (optionally grounded in uploaded material).</summary>
        [HttpPost("explain")]
        public async Task<IActionResult> Explain(
            [FromBody] AiExplainRequestDto request,
            CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(request.Concept))
                return BadRequest(new { message = "Concept is required." });

            var result = await _mediator.Send(new ExplainConceptCommand(
                UserId: CurrentUserId,
                Concept: request.Concept,
                UploadedFileId: request.UploadedFileId,
                Content: request.Content,
                SourceContext: "Hub",
                SourceEntityId: null), ct);
            return Ok(result);
        }

        /// <summary>Summarize a sentence/paragraph or an uploaded PDF/text/image file.</summary>
        [HttpPost("summarize")]
        public async Task<IActionResult> Summarize(
            [FromBody] AiSummarizeRequestDto request,
            CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(request.Content) && !request.UploadedFileId.HasValue)
                return BadRequest(new { message = "Provide 'content' or an 'uploadedFileId' to summarize." });

            var result = await _mediator.Send(new SummarizeContentCommand(
                UserId: CurrentUserId,
                Content: request.Content,
                UploadedFileId: request.UploadedFileId,
                SourceContext: "Hub",
                SourceEntityId: null), ct);
            return Ok(result);
        }

        // ─── Retrieval Endpoints ───────────────────────────────────────────────

        /// <summary>Get all AI-generated content for the authenticated user.</summary>
        [HttpGet("generated-content")]
        public async Task<IActionResult> GetGeneratedContent(
            [FromQuery] string? contentType = null,
            [FromQuery] string? sourceContext = null,
            CancellationToken ct = default)
        {
            var result = await _mediator.Send(
                new GetGeneratedContentListQuery(CurrentUserId, contentType, sourceContext), ct);
            return Ok(result);
        }

        /// <summary>Get the detail of a specific generated content item.</summary>
        [HttpGet("generated-content/{contentId:int}")]
        public async Task<IActionResult> GetGeneratedContentDetail(
            int contentId,
            CancellationToken ct = default)
        {
            try
            {
                var result = await _mediator.Send(new GetGeneratedContentDetailQuery(CurrentUserId, contentId), ct);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // ─── Learning Memory ───────────────────────────────────────────────────

        /// <summary>Get the user's AI learning memory — weak/strong topics, recommendations, progress.</summary>
        [HttpGet("learning-memory")]
        public async Task<IActionResult> GetLearningMemory(CancellationToken ct = default)
        {
            var result = await _mediator.Send(new GetLearningMemoryQuery(CurrentUserId), ct);
            return Ok(result);
        }
    }
}
