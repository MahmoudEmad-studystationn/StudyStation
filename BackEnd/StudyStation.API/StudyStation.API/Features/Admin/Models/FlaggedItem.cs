using System.ComponentModel.DataAnnotations;
using StudyStation.API.Models;

namespace StudyStation.API.Features.Admin.Models
{
    public class FlaggedItem
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(50)]
        public string ContentType { get; set; } = string.Empty; // e.g., "Post", "Resource", "Room"
        
        public int ContentId { get; set; }

        public int ReporterId { get; set; }
        public ApplicationUser Reporter { get; set; } = null!;

        [Required, MaxLength(500)]
        public string Reason { get; set; } = string.Empty;

        public DateTime ReportedAt { get; set; } = DateTime.UtcNow;

        public bool IsResolved { get; set; } = false;
    }
}
