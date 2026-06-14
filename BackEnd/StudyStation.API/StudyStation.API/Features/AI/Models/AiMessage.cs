namespace StudyStation.API.Features.AI.Models
{
    public class AiMessage
    {
        public int Id { get; set; }

        public int ConversationId { get; set; }

        /// <summary>"user" or "model"</summary>
        public string Role { get; set; } = "user";

        public string Content { get; set; } = string.Empty;

        /// <summary>Who sent this message in shared conversations. Null for AI responses or personal chats.</summary>
        public int? SenderUserId { get; set; }

        /// <summary>Display name of the sender for shared conversations.</summary>
        public string? SenderName { get; set; }

        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public AiConversation Conversation { get; set; } = null!;
    }
}
