using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.Notifications.Commands;
using StudyStation.API.Features.Notifications.Models;
using StudyStation.API.Models;
using System.Security.Claims;

namespace StudyStation.API.Features.Posts.CreatePost
{
    public class CreatePostHandler : IRequestHandler<CreatePostCommand, CreatePostResponse>
    {
        private readonly DatabaseContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMediator _mediator;
        private readonly ILogger<CreatePostHandler> _logger;

        public CreatePostHandler(
            DatabaseContext context,
            IHttpContextAccessor httpContextAccessor,
            IMediator mediator,
            ILogger<CreatePostHandler> logger)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
            _mediator = mediator;
            _logger = logger;
        }

        public async Task<CreatePostResponse> Handle(CreatePostCommand request, CancellationToken cancellationToken)
        {
            // 1. الحصول على هوية المستخدم من الـ Token
            var userIdString = _httpContextAccessor.HttpContext?.User.Claims
                                .FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdString))
            {
                throw new UnauthorizedAccessException("User ID not found in token.");
            }

            if (!int.TryParse(userIdString, out var userId))
            {
                throw new Exception("Invalid User ID format in token.");
            }

            // 2. التحقق من وجود البوست الأصلي عند إعادة النشر
            Post? parentPost = null;
            if (request.ParentPostId.HasValue)
            {
                parentPost = await _context.Posts
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.Id == request.ParentPostId.Value, cancellationToken);

                if (parentPost == null)
                {
                    throw new KeyNotFoundException("The original post you are sharing does not exist.");
                }
            }

            // 3. إنشاء كائن المنشور الجديد
            var post = new Post
            {
                Title = request.Title,
                Content = request.Content,
                ImageUrl = request.ImageUrl,
                ParentPostId = request.ParentPostId,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // 4. إضافة المنشور إلى قاعدة البيانات وحفظ التغييرات
            _context.Posts.Add(post);
            await _context.SaveChangesAsync(cancellationToken);

            // 5. إرسال إشعار لصاحب البوست الأصلي عند إعادة النشر (Share)
            if (parentPost != null)
            {
                await TrySendShareNotificationAsync(userId, post.Id, parentPost, cancellationToken);
            }

            // 6. إرجاع الرد
            return new CreatePostResponse
            {
                PostId = post.Id
            };
        }

        private async Task TrySendShareNotificationAsync(
            int senderId,
            int newPostId,
            Post originalPost,
            CancellationToken cancellationToken)
        {
            try
            {
                await _mediator.Send(new CreateNotificationCommand
                {
                    RecipientId = originalPost.UserId,
                    SenderId = senderId,
                    Type = NotificationType.System,
                    TargetTitle = originalPost.Title,
                    ReferenceId = newPostId
                }, cancellationToken);
            }
            catch (Exception ex)
            {
                // Notification failure should never break the main flow
                _logger.LogWarning(ex, "Failed to send share notification by user {SenderId} for original post {OriginalPostId}.", senderId, originalPost.Id);
            }
        }
    }
}
