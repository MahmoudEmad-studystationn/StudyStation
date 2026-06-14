namespace StudyStation.API.Features.AI.DTOs
{
    public class AiQuizDto
    {
        public int Id { get; set; }
        public string Topic { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<AiQuizQuestionDto> Questions { get; set; } = new();
    }

    public class AiQuizQuestionDto
    {
        public int Id { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public string QuestionType { get; set; } = string.Empty;
        public List<string>? Options { get; set; }
        public string CorrectAnswer { get; set; } = string.Empty;
        public string Explanation { get; set; } = string.Empty;
        public string DifficultyLevel { get; set; } = string.Empty;
    }
}
