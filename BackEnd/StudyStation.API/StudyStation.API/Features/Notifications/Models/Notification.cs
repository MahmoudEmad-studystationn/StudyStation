using StudyStation.API.Models;

namespace StudyStation.API.Features.Notifications.Models
{
    public class Notification
    {
        public int Id { get; set; }

        public int RecipientId { get; set; }
        public ApplicationUser Recipient { get; set; } = null!;

        public int SenderId { get; set; }
        public ApplicationUser Sender { get; set; } = null!;

        public NotificationType Type { get; set; }

        public int? ReferenceId { get; set; }
        public string TargetTitle { get; set; } = string.Empty;

        public bool IsRead { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
