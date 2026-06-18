using StudyStation.API.Features.AI.DTOs;
using StudyStation.API.Features.AI.Models;

namespace StudyStation.API.Services
{
    /// <summary>
    /// Central AI service interface. All AI calls go through this contract
    /// so the implementation can be swapped without touching handlers.
    /// </summary>
    public interface IAiService
    {
        /// <summary>Multi-turn conversational chat with optional system context.</summary>
        Task<string> ChatAsync(
            string userMessage,
            List<AiMessageDto> history,
            string? systemContext = null,
            CancellationToken ct = default);

        /// <summary>Generate quiz questions.</summary>
        Task<List<AiQuizQuestionDto>> GenerateQuizAsync(
            string topic,
            int count,
            string difficulty,
            string questionType,
            string? sourceMaterial = null,
            CancellationToken ct = default);

        /// <summary>Generate flashcards (front/back pairs) for a topic or source material.</summary>
        Task<List<AiFlashcardDto>> GenerateFlashcardsAsync(
            string topic,
            int count,
            string? sourceMaterial = null,
            CancellationToken ct = default);

        /// <summary>Explain a concept in clear, simple terms (optionally grounded in source material).</summary>
        Task<string> ExplainConceptAsync(
            string concept,
            string? sourceMaterial = null,
            CancellationToken ct = default);

        /// <summary>Summarize a sentence, paragraph, or document content.</summary>
        Task<string> SummarizeAsync(
            string content,
            CancellationToken ct = default);

        /// <summary>Perform a deep session analysis and return structured analytics.</summary>
        Task<SessionAnalyticsDto> AnalyzeSessionAsync(
            string studyContent,
            string subject,
            CancellationToken ct = default);

        /// <summary>Generate personalised study recommendations from a user's memory record.</summary>
        Task<string> GenerateRecommendationsAsync(UserLearningMemory memory, CancellationToken ct = default);

        /// <summary>Extract plain text from a PDF stream using PdfPig.</summary>
        Task<string> ExtractTextFromPdfAsync(Stream pdfStream, CancellationToken ct = default);

        /// <summary>Extract text from an image stream using Tesseract OCR.</summary>
        Task<string> ExtractTextFromImageAsync(Stream imageStream, CancellationToken ct = default);
    }
}
