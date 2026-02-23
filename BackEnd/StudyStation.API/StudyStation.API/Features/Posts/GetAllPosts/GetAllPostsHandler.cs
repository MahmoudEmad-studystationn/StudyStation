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
                .Include(p => p.ParentPost)
                .ThenInclude(c => c.User)
                .Include(p => p.Reactions) // تأكد من عمل Include للريأكشنز
                                           // ترتيب المنشورات من الأحدث إلى الأقدم
                .OrderByDescending(p => p.CreatedAt)
                // تحويل النتائج إلى DTOs لمنع إرسال بيانات غير ضرورية
                .Select(p => new PostDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Content = p.Content,
                    ImageUrl = p.ImageUrl,
                    CreatedAt = p.CreatedAt,
                    Author = new UserDto // تحويل بيانات المستخدم إلى UserDto
                    {
                        Id = p.User.Id,
                        FirstName = p.User.FirstName,
                        LastName = p.User.LastName
                    },
                    ParentPostId = p.ParentPostId,
                    SharedPost = p.ParentPost == null ? null : new PostDto
                    {
                        Id = p.ParentPost.Id,
                        Title = p.ParentPost.Title,
                        Content = p.ParentPost.Content,
                        ImageUrl = p.ParentPost.ImageUrl,
                        Author = new UserDto
                        {
                            Id = p.ParentPost.User.Id,
                            FirstName = p.ParentPost.User.FirstName,
                            LastName = p.ParentPost.User.LastName
                        }
                    },
                    Comments = p.Comments.Select(c => new CommentDto // تحويل كل تعليق إلى CommentDto
                    {
                        Id = c.Id,
                        Content = c.Content,
                        CreatedAt = c.CreatedAt,
                        Author = new UserDto
                        {
                            Id = c.User.Id,
                            FirstName = c.User.FirstName,
                            LastName = c.User.LastName
                        }
                    }).ToList(),
                    Reactions = p.Reactions.Select(r => new ReactionDto
                    {
                        Type = r.Type,
                        UserId = r.UserId
                    }).ToList()

                })
                .ToListAsync(cancellationToken);

            return posts;
        }
    }
}
