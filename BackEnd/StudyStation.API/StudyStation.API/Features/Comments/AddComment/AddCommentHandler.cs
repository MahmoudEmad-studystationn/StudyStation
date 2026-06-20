using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.Notifications.Commands;
using StudyStation.API.Features.Notifications.Models;
using StudyStation.API.Models;
using System.Security.Claims;

namespace StudyStation.API.Features.Comments.AddComment
{
    public class AddCommentHandler : IRequestHandler<AddCommentCommand, AddCommentResponse>
    {
        private readonly DatabaseContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMediator _mediator;
        private readonly ILogger<AddCommentHandler> _logger;

        public AddCommentHandler(
            DatabaseContext context,
            IHttpContextAccessor httpContextAccessor,
            IMediator mediator,
            ILogger<AddCommentHandler> logger)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _mediator = mediator;
            _logger = logger;
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
            var post = await _context.Posts
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == request.PostId, cancellationToken);

            if (post == null)
            {
                throw new KeyNotFoundException("Post not found.");
            }

            // 3. التحقق من وجود التعليق الأب (إذا كان هذا رداً)
            Comment? parentComment = null;
            if (request.ParentCommentId.HasValue)
            {
                parentComment = await _context.Comments
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.Id == request.ParentCommentId.Value, cancellationToken);

                if (parentComment == null)
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
                ParentCommentId = request.ParentCommentId,
                CreatedAt = DateTime.UtcNow
            };

            // 5. إضافة التعليق وحفظ التغييرات
            _context.Comments.Add(comment);
            await _context.SaveChangesAsync(cancellationToken);

            // 6. إرسال الإشعارات المناسبة
            await TrySendCommentNotificationsAsync(
                currentUserId, comment.Id, post, parentComment, cancellationToken);

            // 7. إرجاع الرد
            return new AddCommentResponse { CommentId = comment.Id };
        }

        private async Task TrySendCommentNotificationsAsync(
            int senderId,
            int commentId,
            Post post,
            Comment? parentComment,
            CancellationToken cancellationToken)
        {
            try
            {
                if (parentComment != null)
                {
                    // هذا رد على تعليق — أرسل إشعار "Reply" لصاحب التعليق الأب
                    var replyTitle = parentComment.Content.Length > 50
                        ? parentComment.Content[..50] + "..."
                        : parentComment.Content;

                    await _mediator.Send(new CreateNotificationCommand
                    {
                        RecipientId = parentComment.UserId,
                        SenderId = senderId,
                        Type = NotificationType.Reply,
                        TargetTitle = replyTitle,
                        ReferenceId = commentId
                    }, cancellationToken);
                }
                else
                {
                    // هذا تعليق على بوست — أرسل إشعار "Comment" لصاحب البوست
                    await _mediator.Send(new CreateNotificationCommand
                    {
                        RecipientId = post.UserId,
                        SenderId = senderId,
                        Type = NotificationType.Comment,
                        TargetTitle = post.Title,
                        ReferenceId = commentId
                    }, cancellationToken);
                }
            }
            catch (Exception ex)
            {
                // Notification failure should never break the main flow
                _logger.LogWarning(ex, "Failed to send comment notification by user {SenderId} on post {PostId}.", senderId, post.Id);
            }
        }
    }
}
