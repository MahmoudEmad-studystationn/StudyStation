using MediatR;
using Microsoft.AspNetCore.Mvc;
using StudyStation.API.Features.Users.ForgotPassword;
using StudyStation.API.Features.Users.Login;
using StudyStation.API.Features.Users.Register;

namespace StudyStation.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UsersController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginCommand command)
        {
            try
            {
                var response = await _mediator.Send(command);
                return Ok(response);
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

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterCommand command)
        {
            try
            {
                var response = await _mediator.Send(command);
                return Ok(response);
            }
            catch (Exception ex)
            {
                // في تطبيق حقيقي، ستقوم بتسجيل الخطأ (logging)
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordCommand command)
        {
            // لا نستخدم try-catch هنا لأن الـ handler يعيد دائماً رسالة نجاح
            var response = await _mediator.Send(command);
            return Ok(response);
        }

    }
}
