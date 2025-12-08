using MediatR;
using StudyStation.API.Data;
using System.Security.Claims;

namespace StudyStation.API.Features.Posts.DeletePost
{
    // بما أن الأمر لا يعيد بيانات، نستخدم IRequestHandler<DeletePostCommand>
    public class DeletePostHandler : IRequestHandler<DeletePostCommand>
    {
        private readonly DatabaseContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DeletePostHandler(DatabaseContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task Handle(DeletePostCommand request, CancellationToken cancellationToken)
        {
            // 1. الحصول على هوية المستخدم الحالي
            var userIdString = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out var currentUserId))
            {
                throw new UnauthorizedAccessException("Invalid user ID in token.");
            }

            // 2. البحث عن المنشور
            var post = await _context.Posts.FindAsync(new object[] { request.PostId }, cancellationToken);
            if (post == null)
            {
                // إذا كان المنشور غير موجود، لا داعي لفعل أي شيء.
                // يمكن إطلاق استثناء KeyNotFoundException إذا أردنا إبلاغ المستخدم.
                // لكن في حالة الحذف، من الآمن تجاهل الطلب.
                return;
            }

            // 3. التحقق من الملكية
            if (post.UserId != currentUserId)
            {
                throw new Exception("You are not authorized to delete this post."); // سيتم تحويله إلى 403 Forbidden
            }

            // 4. حذف المنشور
            _context.Posts.Remove(post);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
