namespace StudyStation.API.Features.AI.Models
{
    public class AiFlashcard
    {
        public int Id { get; set; }

        public int GeneratedContentId { get; set; }

        /// <summary>Term or concept shown on the front of the card.</summary>
        public string Front { get; set; } = string.Empty;

        /// <summary>Definition or explanation shown on the back.</summary>
        public string Back { get; set; } = string.Empty;

        public string? Topic { get; set; }

        // Navigation
        public AiGeneratedContent GeneratedContent { get; set; } = null!;
    }
}
