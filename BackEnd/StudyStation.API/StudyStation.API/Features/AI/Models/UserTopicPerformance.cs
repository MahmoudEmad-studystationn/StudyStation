using StudyStation.API.Models;

namespace StudyStation.API.Features.AI.Models
{
    /// <summary>
    /// Per-topic quiz performance row — one row per (User, Topic) pair.
    /// Used to classify weak vs strong topics in UserLearningMemory.
    /// </summary>
    public class UserTopicPerformance
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public string Topic { get; set; } = string.Empty;

        public int TotalAttempts { get; set; }

        public int CorrectAnswers { get; set; }

        public DateTime LastAttemptAt { get; set; } = DateTime.UtcNow;

        /// <summary>"Weak" | "Average" | "Strong"</summary>
        public string Proficiency { get; set; } = "Average";

        public int? LearningMemoryId { get; set; }

        // Navigation
        public ApplicationUser User { get; set; } = null!;
        public UserLearningMemory? LearningMemory { get; set; }
    }
}
