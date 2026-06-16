using Microsoft.AspNetCore.Mvc;
using StudyStation.API.Services;

namespace StudyStation.API.Controllers
{
    /// <summary>
    /// Quick test endpoint for verifying the AI service integration.
    /// Remove this controller before production deployment.
    /// </summary>
    [ApiController]
    [Route("api/AI/test")]
    public class AiTestController : ControllerBase
    {
        private readonly IAiService _aiService;

        public AiTestController(IAiService aiService) => _aiService = aiService;

        /// <summary>Test the AI service with a simple prompt. No authentication required.</summary>
        [HttpPost("chat")]
        public async Task<IActionResult> TestChat(
            [FromBody] TestChatRequest request,
            CancellationToken ct = default)
        {
            var response = await _aiService.ChatAsync(
                request.Message,
                new(),
                systemContext: "You are a helpful assistant. Keep answers short.",
                ct: ct);

            return Ok(new { response });
        }

        /// <summary>Test the AI service with an explain concept call.</summary>
        [HttpPost("explain")]
        public async Task<IActionResult> TestExplain(
            [FromBody] TestExplainRequest request,
            CancellationToken ct = default)
        {
            var response = await _aiService.ExplainConceptAsync(
                request.Concept,
                request.Level ?? "simple",
                sourceMaterial: null,
                ct: ct);

            return Ok(new { response });
        }

        public class TestChatRequest
        {
            public string Message { get; set; } = string.Empty;
        }

        public class TestExplainRequest
        {
            public string Concept { get; set; } = string.Empty;
            public string? Level { get; set; }
        }
    }
}
