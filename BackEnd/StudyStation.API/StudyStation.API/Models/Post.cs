using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudyStation.API.Models
{
    public class Post
    {
        [Key]
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
       
        public string? ImageUrl { get; set; } // حقل اختياري لتخزين رابط الصورة

        public int? ParentPostId { get; set; }
        public Post? ParentPost { get; set; } // العلاقة مع البوست الأصلي
        // Foreign Key
        [ForeignKey("User")] // <-- هذا السطر يحل المشكلة
        public int UserId { get; set; }

        // Navigation properties
        public ApplicationUser User { get; set; } = null!;
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public ICollection<Reaction> Reactions { get; set; } = new List<Reaction>();
    }
}
