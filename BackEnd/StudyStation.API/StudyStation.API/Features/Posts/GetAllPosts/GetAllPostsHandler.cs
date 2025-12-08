using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;

namespace StudyStation.API.Features.Posts.GetAllPosts
{
    public class GetAllPostsHandler : IRequestHandler<GetAllPostsQuery, List<PostDto>>
    {
        private readonly DatabaseContext _context;

        public GetAllPostsHandler(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<List<PostDto>> Handle(GetAllPostsQuery request, CancellationToken cancellationToken)
        {
            var posts = await _context.Posts
                // تضمين بيانات المستخدم (الكاتب) المرتبطة بكل منشور
                .Include(p => p.User)
                // تضمين قائمة التعليقات المرتبطة بكل منشور
                .Include(p => p.Comments)
                // ترتيب المنشورات من الأحدث إلى الأقدم
                .OrderByDescending(p => p.CreatedAt)
                // تحويل النتائج إلى DTOs لمنع إرسال بيانات غير ضرورية
                .Select(p => new PostDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Content = p.Content,
                    CreatedAt = p.CreatedAt,
                    Author = new UserDto // تحويل بيانات المستخدم إلى UserDto
                    {
                        Id = p.User.Id,
                        FirstName = p.User.FirstName,
                        LastName = p.User.LastName
                    },
                    Comments = p.Comments.Select(c => new CommentDto // تحويل كل تعليق إلى CommentDto
                    {
                        Id = c.Id,
                        Content = c.Content,
                        CreatedAt = c.CreatedAt
                    }).ToList()
                })
                .ToListAsync(cancellationToken);

            return posts;
        }
    }
}
