using MediatR;
using StudyStation.API.Data;
using System.Security.Claims;

namespace StudyStation.API.Features.Posts.UpdatePost
{
    public class UpdatePostHandler : IRequestHandler<UpdatePostCommand, UpdatePostResponse>
    {
        private readonly DatabaseContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UpdatePostHandler(DatabaseContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<UpdatePostResponse> Handle(UpdatePostCommand request, CancellationToken cancellationToken)
        {
            // 1. الحصول على هوية المستخدم الحالي من التوكن
            var userIdString = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out var currentUserId))
            {
                throw new UnauthorizedAccessException("Invalid user ID in token.");
            }

            // 2. البحث عن المنشور في قاعدة البيانات
            var post = await _context.Posts.FindAsync(new object[] { request.PostId }, cancellationToken);
            if (post == null)
            {
                throw new KeyNotFoundException("Post not found.");
            }

            // 3. التحقق من الملكية: هل المستخدم الحالي هو مالك المنشور؟
            if (post.UserId != currentUserId)
            {
                // نستخدم Forbidden (403) بدلاً من Unauthorized (401)
                // 401: أنت لست مسجلاً. 403: أنت مسجل، ولكن ليس لديك صلاحية.
                throw new Exception("You are not authorized to update this post.");
            }

            // 4. تحديث بيانات المنشور
            post.Title = request.Title;
            post.Content = request.Content;
            post.UpdatedAt = DateTime.UtcNow;

            // 5. حفظ التغييرات
            await _context.SaveChangesAsync(cancellationToken);

            return new UpdatePostResponse();
        }
    }
}
