namespace StudyStation.API.Features.AI.DTOs
{
    public class LearningMemoryDto
    {
        public int TotalSessionsAnalyzed { get; set; }
        public int TotalQuizzesGenerated { get; set; }
        public int TotalFlashcardsGenerated { get; set; }
        public DateTime? LastStudiedAt { get; set; }
        public List<string> StudiedSubjects { get; set; } = new();
        public List<string> WeakTopics { get; set; } = new();
        public List<string> StrongTopics { get; set; } = new();
        public string? PersonalizedRecommendations { get; set; }
        public List<TopicPerformanceDto> TopicPerformances { get; set; } = new();
        public DateTime UpdatedAt { get; set; }
    }

    public class TopicPerformanceDto
    {
        public string Topic { get; set; } = string.Empty;
        public int TotalAttempts { get; set; }
        public int CorrectAnswers { get; set; }
        public double AccuracyPercent => TotalAttempts == 0 ? 0 : Math.Round((double)CorrectAnswers / TotalAttempts * 100, 1);
        public string Proficiency { get; set; } = string.Empty;
        public DateTime LastAttemptAt { get; set; }
    }
}
