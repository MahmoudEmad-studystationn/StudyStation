namespace StudyStation.API.Features.Admin.DTOs
{
    public class ModerationItemDto
    {
        public int Id { get; set; }                                // FlaggedItem.Id
        public string ContentPreview { get; set; } = string.Empty; // Truncated content
        public string UserName { get; set; } = string.Empty;       // @username format
        public string Type { get; set; } = string.Empty;           // "Post" | "Room"
        public DateTime ReportedAt { get; set; }
        public int ContentId { get; set; }
    }
}
