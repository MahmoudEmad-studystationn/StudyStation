using MediatR;

namespace StudyStation.API.Features.Comments.DeleteComment
{
    public class DeleteCommentCommand : IRequest
    {
        public int CommentId { get; set; }
        public int PostId { get; set; }
    }
}
