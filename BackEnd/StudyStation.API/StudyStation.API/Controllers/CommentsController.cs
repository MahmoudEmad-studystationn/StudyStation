using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyStation.API.Features.Comments.AddComment;
using StudyStation.API.Features.Reactions.AddReaction;

namespace StudyStation.API.Controllers
{
    [ApiController]
    [Route("api/posts/{postId}/comments")] // <-- لاحظ الرابط المركب
    [Authorize] // إضافة تعليق تتطلب تسجيل الدخول
    public class CommentsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CommentsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> AddComment(int postId, [FromBody] AddCommentCommand command)
        {
            command.PostId = postId;

            try
            {
                var response = await _mediator.Send(command);
                return Ok(response);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }
        [HttpPost("{commentId}/reactions")]
        public async Task<IActionResult> AddReactionToComment(int postId, int commentId, [FromBody] AddReactionCommand command)
        {
            // postId من الرابط الرئيسي للـ controller
            // commentId من رابط هذه الدالة
            command.PostId = null; // نتأكد من أن التفاعل للتعليق فقط
            command.CommentId = commentId;

            try
            {
                var response = await _mediator.Send(command);
                return Ok(response);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpDelete("{commentId}")]
        public async Task<IActionResult> DeleteComment(int postId, int commentId)
        {
            var command = new StudyStation.API.Features.Comments.DeleteComment.DeleteCommentCommand
            {
                PostId = postId,
                CommentId = commentId
            };

            try
            {
                await _mediator.Send(command);
                return NoContent(); // 204 No Content تعني العملية نجحت ولا يوجد محتوى للإرجاع
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
        }

    }
}
