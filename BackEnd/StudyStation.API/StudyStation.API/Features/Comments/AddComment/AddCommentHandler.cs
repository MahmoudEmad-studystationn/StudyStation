using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Models;
using System.Security.Claims;

namespace StudyStation.API.Features.Comments.AddComment
{
    public class AddCommentHandler : IRequestHandler<AddCommentCommand, AddCommentResponse>
    {
        private readonly DatabaseContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AddCommentHandler(DatabaseContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<AddCommentResponse> Handle(AddCommentCommand request, CancellationToken cancellationToken)
        {
            // 1. الحصول على هوية المستخدم الحالي
            var userIdString = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out var currentUserId))
            {
                throw new UnauthorizedAccessException("User ID not found or invalid.");
            }

            // 2. التحقق من وجود المنشور
            var postExists = await _context.Posts.AnyAsync(p => p.Id == request.PostId, cancellationToken);
            if (!postExists)
            {
                throw new KeyNotFoundException("Post not found.");
            }

            // 3. (جديد) التحقق من وجود التعليق الأب (إذا كان هذا رداً)
            if (request.ParentCommentId.HasValue)
            {
                var parentCommentExists = await _context.Comments.AnyAsync(c => c.Id == request.ParentCommentId.Value, cancellationToken);
                if (!parentCommentExists)
                {
                    throw new KeyNotFoundException("The comment you are replying to does not exist.");
                }
            }

            // 4. إنشاء كائن التعليق الجديد
            var comment = new Comment
            {
                Content = request.Content,
                PostId = request.PostId,
                UserId = currentUserId,
                ParentCommentId = request.ParentCommentId, // <-- إضافة الخاصية الجديدة
                CreatedAt = DateTime.UtcNow
            };

            // 5. إضافة التعليق وحفظ التغييرات
            _context.Comments.Add(comment);
            await _context.SaveChangesAsync(cancellationToken);

            // 6. إرجاع الرد
            return new AddCommentResponse { CommentId = comment.Id };
        }

    }
}
