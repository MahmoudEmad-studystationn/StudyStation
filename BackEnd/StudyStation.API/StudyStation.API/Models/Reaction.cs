using System.ComponentModel.DataAnnotations;

namespace StudyStation.API.Models // تأكد من الـ namespace
{
    public class Reaction
    {
        [Key]
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;

        // Foreign Keys
        public int? PostId { get; set; } // <<-- تأكد من وجود علامة الاستفهام
        public int? CommentId { get; set; } // <<-- تأكد من وجود علامة الاستفهام
        public int UserId { get; set; }

        // Navigation properties
        public Post? Post { get; set; }
        public Comment? Comment { get; set; }
        public ApplicationUser User { get; set; } = null!;
    }
}
