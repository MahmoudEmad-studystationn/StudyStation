namespace StudyStation.API.Features.Posts.GetAllPosts
{
    // DTO للمنشور
    public class PostDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public UserDto Author { get; set; } // بيانات كاتب المنشور
        public List<CommentDto> Comments { get; set; } = new(); // قائمة التعليقات
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
    }
}
