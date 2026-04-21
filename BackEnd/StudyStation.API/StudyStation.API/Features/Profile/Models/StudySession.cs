using System.ComponentModel.DataAnnotations;
using StudyStation.API.Models;

namespace StudyStation.API.Features.Profile.Models
{
    public class StudySession
    {
        [Key]
        public int Id { get; set; }

        public int UserId { get; set; }
        public ApplicationUser User { get; set; } = null!;

        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        
        public decimal DurationInHours { get; set; }
        
        [MaxLength(100)]
        public string SubjectName { get; set; } = string.Empty;
    }
}
