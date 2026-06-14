namespace StudyStation.API.Features.AI.DTOs
{
    // ─── Solo Study Session Analytics ─────────────────────────────────────────

    public class SessionAnalyticsDto
    {
        public int SessionId { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public List<string> MainPoints { get; set; } = new();
        public List<KeyConceptDto> KeyConcepts { get; set; } = new();
        public List<DefinitionDto> ImportantDefinitions { get; set; } = new();
        public List<string> StudyRecommendations { get; set; } = new();
        public List<string> TopicsRequiringMoreReview { get; set; } = new();
        public AiFlashcardSetDto? Flashcards { get; set; }
        public AiQuizDto? Quiz { get; set; }
        public DateTime GeneratedAt { get; set; }
    }

    public class KeyConceptDto
    {
        public string Concept { get; set; } = string.Empty;
        public string Explanation { get; set; } = string.Empty;
    }

    public class DefinitionDto
    {
        public string Term { get; set; } = string.Empty;
        public string Definition { get; set; } = string.Empty;
    }

    // ─── Group Session Analytics ──────────────────────────────────────────────

    public class GroupSessionAnalyticsDto
    {
        public int RoomId { get; set; }
        public string GroupSummary { get; set; } = string.Empty;
        public string MeetingNotes { get; set; } = string.Empty;
        public List<string> KeyTakeaways { get; set; } = new();
        public List<string> MainDiscussionPoints { get; set; } = new();
        public List<string> SuggestedFollowUpTopics { get; set; } = new();
        public AiFlashcardSetDto? Flashcards { get; set; }
        public AiQuizDto? TeamQuiz { get; set; }
        public DateTime GeneratedAt { get; set; }
    }

    // ─── Request DTOs ──────────────────────────────────────────────────────────

    public class AnalyzeSessionRequestDto
    {
        /// <summary>Raw study content typed or pasted by the student.</summary>
        public string? StudyContent { get; set; }

        /// <summary>Id of an uploaded PDF/text file to use as material.</summary>
        public int? UploadedFileId { get; set; }
    }

    public class AnalyzeGroupSessionRequestDto
    {
        /// <summary>End time of the session — defaults to UtcNow if null.</summary>
        public DateTime? SessionEndedAt { get; set; }
    }
}
