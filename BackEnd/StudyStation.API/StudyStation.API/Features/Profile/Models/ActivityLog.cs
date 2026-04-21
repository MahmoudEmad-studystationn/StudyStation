using System.ComponentModel.DataAnnotations;
using StudyStation.API.Models;

namespace StudyStation.API.Features.Profile.Models
{
    public class ActivityLog
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }
        public ApplicationUser User { get; set; } = null!;

        [Required, MaxLength(50)]
        public string ActionType { get; set; } = string.Empty;

        [Required, MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
