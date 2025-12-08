using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudyStation.API.Models
{
    public class Comment
    {
        [Key]
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign Keys
        public int PostId { get; set; }
        public int UserId { get; set; }

        // Navigation properties
        public Post Post { get; set; } = null!;
        public ApplicationUser User { get; set; } = null!;

        public int? ParentCommentId { get; set; }

        // 2. علاقة Navigation للتعليق الأب
        [ForeignKey("ParentCommentId")]
        public virtual Comment? ParentComment { get; set; }

        // 3. قائمة بالردود على هذا التعليق
        public virtual ICollection<Comment> Replies { get; set; } = new List<Comment>();

        public ICollection<Reaction> Reactions { get; set; } = new List<Reaction>();
    }
}
