using StudyStation.API.Features.Notifications.Models;

namespace StudyStation.API.Features.Notifications.DTOs
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string? SenderAvatar { get; set; }
        public NotificationType Type { get; set; }
        public string TargetTitle { get; set; } = string.Empty;
        public int? ReferenceId { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
