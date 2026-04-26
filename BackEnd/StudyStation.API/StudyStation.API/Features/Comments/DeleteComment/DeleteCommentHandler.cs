using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Models;
using System.Security.Claims;

namespace StudyStation.API.Features.Comments.DeleteComment
{
    public class DeleteCommentHandler : IRequestHandler<DeleteCommentCommand>
    {
        private readonly DatabaseContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DeleteCommentHandler(DatabaseContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task Handle(DeleteCommentCommand request, CancellationToken cancellationToken)
        {
            var userIdString = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out var currentUserId))
            {
                throw new UnauthorizedAccessException("Invalid user ID in token.");
            }

            // تحميل التعليق المستهدف
            var targetComment = await _context.Comments
                .FirstOrDefaultAsync(c => c.Id == request.CommentId && c.PostId == request.PostId, cancellationToken);
            
            if (targetComment == null)
            {
                throw new KeyNotFoundException("Comment not found.");
            }

            // التحقق من أن المستخدم الحالي هو صاحب التعليق، أو أنه صاحب المنشور
            var post = await _context.Posts.FindAsync(new object[] { request.PostId }, cancellationToken);
            if (targetComment.UserId != currentUserId && (post != null && post.UserId != currentUserId))
            {
                throw new Exception("You are not authorized to delete this comment."); 
            }

            // جلب كافة التعليقات لهذا المنشور لبناء شجرة الحذف 
            var allComments = await _context.Comments
                .Where(c => c.PostId == request.PostId)
                .ToListAsync(cancellationToken);

            var commentsToDelete = new List<Comment>();
            CollectCommentsToDelete(targetComment, allComments, commentsToDelete);

            var commentIdsToDelete = commentsToDelete.Select(c => c.Id).ToList();

            // حذف التفاعلات المرتبطة بهذه التعليقات
            var reactionsToDelete = await _context.Reactions
                .Where(r => r.CommentId.HasValue && commentIdsToDelete.Contains(r.CommentId.Value))
                .ToListAsync(cancellationToken);

            _context.Reactions.RemoveRange(reactionsToDelete);
            
            // حذف التعليقات (EF Core will figure out order based on tracked entities or we sort them)
            // من الأفضل الترتيب بحذف أحفاد التعليقات أولاً (الترتيب العكسي)
            commentsToDelete.Reverse(); // نعكس لضمان ألا نحذف الأب قبل الأبناء إن تم إضافتهم تباعاً
            _context.Comments.RemoveRange(commentsToDelete);

            await _context.SaveChangesAsync(cancellationToken);
        }

        private void CollectCommentsToDelete(Comment current, List<Comment> allComments, List<Comment> toDelete)
        {
            // نجمع ردود هذا التعليق
            var replies = allComments.Where(c => c.ParentCommentId == current.Id).ToList();
            foreach (var reply in replies)
            {
                CollectCommentsToDelete(reply, allComments, toDelete);
            }
            toDelete.Add(current);
        }
    }
}
