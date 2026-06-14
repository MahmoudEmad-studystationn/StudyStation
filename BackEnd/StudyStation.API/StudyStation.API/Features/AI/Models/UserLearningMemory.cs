using StudyStation.API.Models;

namespace StudyStation.API.Features.AI.Models
{
    /// <summary>
    /// One record per user — aggregated learning memory used to generate
    /// personalised study recommendations and revision reminders.
    /// </summary>
    public class UserLearningMemory
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public int TotalSessionsAnalyzed { get; set; }
        public int TotalQuizzesGenerated { get; set; }
        public int TotalFlashcardsGenerated { get; set; }

        public DateTime? LastStudiedAt { get; set; }

        /// <summary>JSON array of subject strings, e.g. ["Networking","Databases"].</summary>
        public string? StudiedSubjectsJson { get; set; }

        /// <summary>JSON array of topic strings the user struggles with.</summary>
        public string? WeakTopicsJson { get; set; }

        /// <summary>JSON array of topic strings the user performs well in.</summary>
        public string? StrongTopicsJson { get; set; }

        /// <summary>Latest AI-generated personalised recommendations (plain text).</summary>
        public string? PersonalizedRecommendationsJson { get; set; }

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public ApplicationUser User { get; set; } = null!;
        public ICollection<UserTopicPerformance> TopicPerformances { get; set; } = new List<UserTopicPerformance>();
    }
}
