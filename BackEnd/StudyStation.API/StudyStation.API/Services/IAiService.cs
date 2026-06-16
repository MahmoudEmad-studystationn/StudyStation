using StudyStation.API.Features.AI.DTOs;
using StudyStation.API.Features.AI.Models;

namespace StudyStation.API.Services
{
    /// <summary>
    /// Central AI service interface. All Gemini calls go through this contract
    /// so the implementation can be swapped (e.g., to OpenAI) without touching handlers.
    /// </summary>
    public interface IAiService
    {
        /// <summary>Multi-turn conversational chat with optional system context.</summary>
        Task<string> ChatAsync(
            string userMessage,
            List<AiMessageDto> history,
            string? systemContext = null,
            CancellationToken ct = default);

        /// <summary>Summarise a body of text or topic.</summary>
        Task<string> SummarizeAsync(string content, string topic, CancellationToken ct = default);

        /// <summary>Generate quiz questions.</summary>
        Task<List<AiQuizQuestionDto>> GenerateQuizAsync(
            string topic,
            int count,
            string difficulty,
            string questionType,
            string? sourceMaterial = null,
            CancellationToken ct = default);

        /// <summary>Generate flashcards for a topic.</summary>
        Task<List<AiFlashcardDto>> GenerateFlashcardsAsync(
            string topic,
            int count,
            string? sourceMaterial = null,
            CancellationToken ct = default);

        /// <summary>Perform a deep session analysis and return structured analytics.</summary>
        Task<SessionAnalyticsDto> AnalyzeSessionAsync(
            string studyContent,
            string subject,
            CancellationToken ct = default);

        /// <summary>Analyse group room chat and return structured group analytics.</summary>
        Task<GroupSessionAnalyticsDto> AnalyzeGroupSessionAsync(
            string chatLog,
            string subject,
            CancellationToken ct = default);

        /// <summary>Explain a concept (or uploaded material) at a requested detail level.</summary>
        Task<string> ExplainConceptAsync(string concept, string level = "simple", string? sourceMaterial = null, CancellationToken ct = default);

        /// <summary>Extract a bullet-list of key concepts from raw content.</summary>
        Task<string> ExtractKeyConceptsAsync(string content, CancellationToken ct = default);

        /// <summary>Generate personalised study recommendations from a user's memory record.</summary>
        Task<string> GenerateRecommendationsAsync(UserLearningMemory memory, CancellationToken ct = default);

        /// <summary>Answer a specific question grounded in the supplied study material.</summary>
        Task<string> AnswerFromMaterialAsync(string question, string material, CancellationToken ct = default);

        /// <summary>Extract plain text from a PDF stream using PdfPig.</summary>
        Task<string> ExtractTextFromPdfAsync(Stream pdfStream, CancellationToken ct = default);
    }
}
