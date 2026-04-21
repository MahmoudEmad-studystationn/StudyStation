using System.ComponentModel.DataAnnotations;
using StudyStation.API.Models;

namespace StudyStation.API.Features.Profile.Models
{
    public class StudyTask
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }
        public ApplicationUser User { get; set; } = null!;

        [Required, MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;
        
        public DateTime DueDate { get; set; }
        
        public bool IsCompleted { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
