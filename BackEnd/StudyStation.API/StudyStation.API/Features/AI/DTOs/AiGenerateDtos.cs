namespace StudyStation.API.Features.AI.DTOs
{
    // ─── Shared request used by quiz, flashcard, and summary generators ────────

    public class AiGenerateRequestDto
    {
        public string Topic { get; set; } = string.Empty;

        /// <summary>Number of items to generate (questions / flashcards).</summary>
        public int Count { get; set; } = 10;

        /// <summary>"Easy" | "Medium" | "Hard" | "Mixed"</summary>
        public string Difficulty { get; set; } = "Medium";

        /// <summary>"MCQ" | "TrueFalse" | "FillBlank" | "ShortAnswer" | "Mixed"</summary>
        public string QuestionType { get; set; } = "MCQ";

        /// <summary>Id of an already-uploaded file to use as source material.</summary>
        public int? UploadedFileId { get; set; }

        /// <summary>Raw text content provided directly by the caller.</summary>
        public string? Content { get; set; }
    }

    public class AiSummarizeRequestDto
    {
        public string Topic { get; set; } = string.Empty;
        public string? Content { get; set; }
        public int? UploadedFileId { get; set; }
    }

    public class AiExplainRequestDto
    {
        public string Concept { get; set; } = string.Empty;

        /// <summary>"simple" | "detailed" | "eli5"</summary>
        public string Level { get; set; } = "simple";
    }

    // ─── Generic AI text response ──────────────────────────────────────────────

    public class AiTextResponseDto
    {
        public string Result { get; set; } = string.Empty;
        public int? SavedContentId { get; set; }
    }

    // ─── Generated-content list item ──────────────────────────────────────────

    public class AiGeneratedContentSummaryDto
    {
        public int Id { get; set; }
        public string ContentType { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Topic { get; set; }
        public string? SourceContext { get; set; }
        public int? SourceEntityId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
