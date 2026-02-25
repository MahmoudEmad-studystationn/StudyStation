namespace StudyStation.API.Features.Posts.GetAllPosts
{
    // DTO للمنشور
    public class PostDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public UserDto? Author { get; set; } // بيانات كاتب المنشور
        public List<CommentDto> Comments { get; set; } = new(); // قائمة التعليقات

        public string? ImageUrl { get; set; }

        public int? ParentPostId { get; set; }
        public PostDto? SharedPost { get; set; }
        public List<ReactionDto> Reactions { get; set; } = new();

    }

    public class ReactionDto
    {
        public string Type { get; set; } = string.Empty; // مثل Like, Love
        public int UserId { get; set; } // عشان الفرونت إند يعرف مين اللي عمل ريأكت
    }

    // DTO لبيانات المستخدم (الكاتب)
    public class UserDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
    }

    // DTO للتعليق
    public class CommentDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        // يمكن إضافة بيانات كاتب التعليق هنا لاحقاً بنفس طريقة كاتب المنشور
        public UserDto Author { get; set; } = null!;
        public int? ParentPostId { get; set; }
        public PostDto? SharedPost { get; set; } // تفاصيل البوست الأصلي المعمول له شير
    }
}
