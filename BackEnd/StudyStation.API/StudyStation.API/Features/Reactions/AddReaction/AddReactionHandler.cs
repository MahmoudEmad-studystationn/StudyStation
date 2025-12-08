using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Models;
using System.Security.Claims;

namespace StudyStation.API.Features.Reactions.AddReaction
{
    public class AddReactionHandler : IRequestHandler<AddReactionCommand, AddReactionResponse>
    {
        private readonly DatabaseContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AddReactionHandler(DatabaseContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<AddReactionResponse> Handle(AddReactionCommand request, CancellationToken cancellationToken)
        {
            // 1. الحصول على هوية المستخدم الحالي
            var userIdString = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out var currentUserId))
            {
                throw new UnauthorizedAccessException("User ID not found or invalid.");
            }

            // 2. التحقق من أن أحد الحقلين (PostId أو CommentId) فقط موجود
            if (request.PostId.HasValue && request.CommentId.HasValue)
            {
                throw new InvalidOperationException("A reaction can only be on a post or a comment, not both.");
            }
            if (!request.PostId.HasValue && !request.CommentId.HasValue)
            {
                throw new InvalidOperationException("A reaction must be associated with either a post or a comment.");
            }

            // 3. التحقق من وجود الكيان (المنشور أو التعليق)
            if (request.PostId.HasValue)
            {
                var postExists = await _context.Posts.AnyAsync(p => p.Id == request.PostId.Value, cancellationToken);
                if (!postExists) throw new KeyNotFoundException("Post not found.");
            }
            else if (request.CommentId.HasValue)
            {
                var commentExists = await _context.Comments.AnyAsync(c => c.Id == request.CommentId.Value, cancellationToken);
                if (!commentExists) throw new KeyNotFoundException("Comment not found.");
            }

            // 4. إنشاء كائن التفاعل الجديد
            var reaction = new Reaction
            {
                Type = request.Type,
                PostId = request.PostId,
                CommentId = request.CommentId,
                UserId = currentUserId
            };

            // 5. إضافة التفاعل وحفظ التغييرات
            _context.Reactions.Add(reaction);
            await _context.SaveChangesAsync(cancellationToken);

            // 6. إرجاع الرد
            return new AddReactionResponse { ReactionId = reaction.Id };
        }
    }
}
