using StudyStation.API.Models;

namespace StudyStation.API.Features.AI.Models
{
    /// <summary>
    /// Stores any AI-generated content: summaries, key-concept lists,
    /// study recommendations, meeting notes, etc.
    /// Quizzes and flashcards reference this via FK.
    /// </summary>
    public class AiGeneratedContent
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        /// <summary>
        /// "Summary" | "KeyConcepts" | "Definitions" | "Quiz" | "Flashcards"
        /// | "StudyRecommendations" | "MeetingNotes" | "MainPoints"
        /// | "GroupSummary" | "KeyTakeaways" | "SessionAnalysis"
        /// </summary>
        public string ContentType { get; set; } = string.Empty;

        public string Title { get; set; } = string.Empty;

        /// <summary>JSON-serialised result payload.</summary>
        public string ContentJson { get; set; } = string.Empty;

        /// <summary>"Session" | "Room" | "Hub"</summary>
        public string? SourceContext { get; set; }

        /// <summary>FK to StudySession.Id or StudyRoom.Id.</summary>
        public int? SourceEntityId { get; set; }

        /// <summary>Subject / topic tag for filtering and memory tracking.</summary>
        public string? Topic { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public ApplicationUser User { get; set; } = null!;
        public ICollection<AiQuizQuestion> QuizQuestions { get; set; } = new List<AiQuizQuestion>();
        public ICollection<AiFlashcard> Flashcards { get; set; } = new List<AiFlashcard>();
    }
}
