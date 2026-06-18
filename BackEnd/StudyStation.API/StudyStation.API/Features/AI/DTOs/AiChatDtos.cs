namespace StudyStation.API.Features.AI.DTOs
{
    // ─── Request ──────────────────────────────────────────────────────────────

    public class AiChatRequestDto
    {
        /// <summary>Null → start a new conversation.</summary>
        public int? ConversationId { get; set; }

        public string Message { get; set; } = string.Empty;

        /// <summary>"Hub" | "SoloRoom" | "GroupRoom"</summary>
        public string Context { get; set; } = "Hub";

        /// <summary>StudySession.Id or StudyRoom.Id</summary>
        public int? ContextEntityId { get; set; }

        /// <summary>Id of an already-uploaded file to inject as context.</summary>
        public int? UploadedFileId { get; set; }
    }

    // ─── Response ─────────────────────────────────────────────────────────────

    public class AiChatResponseDto
    {
        public int ConversationId { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Role { get; set; } = "model";
        public DateTime SentAt { get; set; }
    }

    public class ConversationSummaryDto
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string Context { get; set; } = string.Empty;
        public int? ContextEntityId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int MessageCount { get; set; }
    }

    public class AiMessageDto
    {
        public int Id { get; set; }
        public string Role { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
    }

}
