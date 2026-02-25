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

            // 2. التحقق من المنطق (بوست أو كومنت)
            if (request.PostId.HasValue && request.CommentId.HasValue)
            {
                throw new InvalidOperationException("A reaction can only be on a post or a comment, not both.");
            }
            if (!request.PostId.HasValue && !request.CommentId.HasValue)
            {
                throw new InvalidOperationException("A reaction must be associated with either a post or a comment.");
            }

            // --- الجزء الجديد: منع التكرار (Logic Update) ---

            // البحث عن تفاعل سابق لهذا المستخدم على نفس الكيان (بوست أو كومنت)
            var existingReaction = await _context.Reactions
                .FirstOrDefaultAsync(r =>
                    (request.PostId.HasValue && r.PostId == request.PostId) ||
                    (request.CommentId.HasValue && r.CommentId == request.CommentId) &&
                    r.UserId == currentUserId, cancellationToken);

            if (existingReaction != null)
            {
                // لو المستخدم بعت نفس النوع (مثلاً ضغط Like وهو أصلاً عامل Like)، هنشيل الريأكت "Toggle"
                if (existingReaction.Type == request.Type)
                {
                    _context.Reactions.Remove(existingReaction);
                    await _context.SaveChangesAsync(cancellationToken);
                    return new AddReactionResponse { ReactionId = 0 }; // 0 تعني تم الحذف
                }

                // لو بعت نوع مختلف (مثلاً كان Like وخلاه Love)، هنحدث النوع فقط
                existingReaction.Type = request.Type;
                await _context.SaveChangesAsync(cancellationToken);
                return new AddReactionResponse { ReactionId = existingReaction.Id };
            }

            // --- نهاية الجزء الجديد ---

            // 3. التحقق من وجود الكيان (فقط في حالة إضافة تفاعل جديد تماماً)
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
