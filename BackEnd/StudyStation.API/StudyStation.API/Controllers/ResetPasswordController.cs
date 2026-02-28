using MediatR;
using Microsoft.AspNetCore.Mvc;
using StudyStation.API.Features.Users.ResetPassword;

namespace StudyStation.API.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class ResetPasswordController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ResetPasswordController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command)
        {
            try
            {
                var result = await _mediator.Send(command);
                return Ok(new { message = result });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
