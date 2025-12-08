using MediatR;

namespace StudyStation.API.Features.Posts.GetAllPosts
{
    // نستخدم IRequest ونمرر له نوع الاستجابة المتوقعة
    public class GetAllPostsQuery : IRequest<List<PostDto>>
    {
        // حالياً لا نحتاج أي خصائص هنا
        // لاحقاً يمكن إضافة خصائص للفلترة أو البحث
    }
}
