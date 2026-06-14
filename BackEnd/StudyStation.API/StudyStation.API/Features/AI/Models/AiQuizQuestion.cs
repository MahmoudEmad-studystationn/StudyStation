namespace StudyStation.API.Features.AI.Models
{
    public class AiQuizQuestion
    {
        public int Id { get; set; }

        public int GeneratedContentId { get; set; }

        public string QuestionText { get; set; } = string.Empty;

        /// <summary>"MCQ" | "TrueFalse" | "FillBlank" | "ShortAnswer"</summary>
        public string QuestionType { get; set; } = "MCQ";

        /// <summary>JSON array of option strings — populated for MCQ only.</summary>
        public string? OptionsJson { get; set; }

        public string CorrectAnswer { get; set; } = string.Empty;

        public string Explanation { get; set; } = string.Empty;

        /// <summary>"Easy" | "Medium" | "Hard"</summary>
        public string DifficultyLevel { get; set; } = "Medium";

        // Navigation
        public AiGeneratedContent GeneratedContent { get; set; } = null!;
    }
}
