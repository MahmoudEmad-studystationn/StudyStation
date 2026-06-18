using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.Notifications.Commands;
using StudyStation.API.Features.Notifications.Models;
using StudyStation.API.Models;
using System.Security.Claims;

namespace StudyStation.API.Features.Reactions.AddReaction
{
    public class AddReactionHandler : IRequestHandler<AddReactionCommand, AddReactionResponse>
    {
        private readonly DatabaseContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMediator _mediator;
        private readonly ILogger<AddReactionHandler> _logger;

        public AddReactionHandler(
            DatabaseContext context,
            IHttpContextAccessor httpContextAccessor,
            IMediator mediator,
            ILogger<AddReactionHandler> logger)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _mediator = mediator;
            _logger = logger;
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

            // 6. إرسال إشعار للمالك (بوست أو كومنت) — فقط عند إضافة تفاعل جديد
            await TrySendLikeNotificationAsync(request, currentUserId, reaction.Id, cancellationToken);

            // 7. إرجاع الرد
            return new AddReactionResponse { ReactionId = reaction.Id };
        }

        private async Task TrySendLikeNotificationAsync(
            AddReactionCommand request,
            int senderId,
            int reactionId,
            CancellationToken cancellationToken)
        {
            try
            {
                int recipientId;
                string targetTitle;

                if (request.PostId.HasValue)
                {
                    var post = await _context.Posts
                        .AsNoTracking()
                        .FirstOrDefaultAsync(p => p.Id == request.PostId.Value, cancellationToken);

                    if (post == null) return;
                    recipientId = post.UserId;
                    targetTitle = post.Title;
                }
                else if (request.CommentId.HasValue)
                {
                    var comment = await _context.Comments
                        .AsNoTracking()
                        .FirstOrDefaultAsync(c => c.Id == request.CommentId.Value, cancellationToken);

                    if (comment == null) return;
                    recipientId = comment.UserId;
                    targetTitle = comment.Content.Length > 50
                        ? comment.Content[..50] + "..."
                        : comment.Content;
                }
                else
                {
                    return;
                }

                await _mediator.Send(new CreateNotificationCommand
                {
                    RecipientId = recipientId,
                    SenderId = senderId,
                    Type = NotificationType.Like,
                    TargetTitle = targetTitle,
                    ReferenceId = reactionId
                }, cancellationToken);
            }
            catch (Exception ex)
            {
                // Notification failure should never break the main flow
                _logger.LogWarning(ex, "Failed to send like notification for reaction by user {SenderId}.", senderId);
            }
        }
    }
}
