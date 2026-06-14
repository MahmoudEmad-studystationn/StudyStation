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
}
