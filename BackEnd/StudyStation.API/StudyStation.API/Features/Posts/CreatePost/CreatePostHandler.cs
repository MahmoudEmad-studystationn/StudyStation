using MediatR;
using StudyStation.API.Data;
using StudyStation.API.Models;
using System.Security.Claims;

namespace StudyStation.API.Features.Posts.CreatePost
{
    public class CreatePostHandler : IRequestHandler<CreatePostCommand, CreatePostResponse>
    {
        private readonly DatabaseContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CreatePostHandler(DatabaseContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<CreatePostResponse> Handle(CreatePostCommand request, CancellationToken cancellationToken)
        {
            // 1. الحصول على هوية المستخدم من الـ Token
            // الكود الجديد
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


            // 2. إنشاء كائن المنشور الجديد
            var post = new Post
            {
                Title = request.Title,
                Content = request.Content,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // 3. إضافة المنشور إلى قاعدة البيانات وحفظ التغييرات
            _context.Posts.Add(post);
            await _context.SaveChangesAsync(cancellationToken);

            // 4. إرجاع الرد
            return new CreatePostResponse
            {
                PostId = post.Id
            };
        }
    }
}
