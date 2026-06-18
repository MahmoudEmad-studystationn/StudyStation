namespace StudyStation.API.Features.AI.DTOs
{
    public class AiFlashcardSetDto
    {
        public int Id { get; set; }
        public string Topic { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<AiFlashcardDto> Flashcards { get; set; } = new();
    }

    public class AiFlashcardDto
    {
        public int Id { get; set; }
        public string Front { get; set; } = string.Empty;
        public string Back { get; set; } = string.Empty;
        public string? Topic { get; set; }
    }

    // ─── Request used by the flashcard generator ────────────────────────────────

    public class AiFlashcardRequestDto
    {
        public string Topic { get; set; } = string.Empty;

        /// <summary>Number of flashcards to generate.</summary>
        public int Count { get; set; } = 10;

        /// <summary>Id of an already-uploaded file to use as source material.</summary>
        public int? UploadedFileId { get; set; }

        /// <summary>Raw text content provided directly by the caller.</summary>
        public string? Content { get; set; }
    }
}

