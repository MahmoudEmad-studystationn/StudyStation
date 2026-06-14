using StudyStation.API.Features.StudyWithFriends.Models;
using StudyStation.API.Models;

namespace StudyStation.API.Features.AI.Models
{
    public class AiConversation
    {
        public int Id { get; set; }

        /// <summary>Owner for personal conversations. Null for shared room conversations.</summary>
        public int? UserId { get; set; }

        /// <summary>The room this shared conversation belongs to. Null for personal conversations.</summary>
        public int? RoomId { get; set; }

        /// <summary>Auto-generated from the first user message.</summary>
        public string? Title { get; set; }

        /// <summary>"Hub" | "SoloRoom" | "GroupRoom"</summary>
        public string Context { get; set; } = "Hub";

        /// <summary>StudySession.Id or StudyRoom.Id, depending on Context.</summary>
        public int? ContextEntityId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public ApplicationUser? User { get; set; }
        public StudyRoom? Room { get; set; }
        public ICollection<AiMessage> Messages { get; set; } = new List<AiMessage>();
    }
}
