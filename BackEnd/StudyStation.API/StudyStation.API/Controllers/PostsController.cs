using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyStation.API.Features.Posts.CreatePost;
using StudyStation.API.Features.Posts.DeletePost;
using StudyStation.API.Features.Posts.GetAllPosts;
using StudyStation.API.Features.Posts.UpdatePost;
using StudyStation.API.Features.Reactions.AddReaction;

namespace StudyStation.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // <-- مهم جداً: هذا الـ Controller يتطلب تسجيل الدخول
    public class PostsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public PostsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> CreatePost([FromBody] CreatePostCommand command)
        {
            try
            {
                var response = await _mediator.Send(command);
                // نستخدم CreatedAtAction لإرجاع 201 Created مع رابط للمنشور الجديد
                return CreatedAtAction(nameof(CreatePost), new { id = response.PostId }, response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllPosts()
        {
            var query = new GetAllPostsQuery();
            var result = await _mediator.Send(query);
            return Ok(result);
        }
        [HttpPut("{id}")]//: # "// <-- نستخدم HttpPut للتحديث، ونحصل على id المنشور من الرابط"
        public async Task<IActionResult> UpdatePost(int id, [FromBody] UpdatePostCommand command)
        {
            // تعيين id المنشور في الأمر من الرابط
            command.PostId = id;

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
            catch (Exception ex) // هذا للخطأ 403 Forbidden
            {
                return Forbid(ex.Message);
            }
        }
        [HttpDelete("{id}")]//: # "// <-- نستخدم HttpDelete للحذف"
        public async Task<IActionResult> DeletePost(int id)
        {
            var command = new DeletePostCommand { PostId = id };

            try
            {
                await _mediator.Send(command);
                // عند النجاح، نعيد 204 No Content، وهو الرد القياسي لعمليات الحذف الناجحة
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex) // للخطأ 403 Forbidden
            {
                return Forbid(ex.Message);
            }
        }
        [HttpPost("{postId}/reactions")]
        public async Task<IActionResult> AddReactionToPost(int postId, [FromBody] AddReactionCommand command)
        {
            command.PostId = postId;
            command.CommentId = null; // نتأكد من أن التفاعل للمنشور فقط

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


    }
}
