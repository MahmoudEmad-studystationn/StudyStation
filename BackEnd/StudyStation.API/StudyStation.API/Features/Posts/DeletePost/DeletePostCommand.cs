using MediatR;

namespace StudyStation.API.Features.Posts.DeletePost
{
    // لا نحتاج إلى استجابة معقدة، لذلك يمكن استخدام IRequest فقط
    public class DeletePostCommand : IRequest
    {
        public int PostId { get; set; }
    }
}
