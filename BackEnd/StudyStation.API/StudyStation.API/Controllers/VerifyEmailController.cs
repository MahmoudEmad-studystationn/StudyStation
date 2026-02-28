using MediatR;
using Microsoft.AspNetCore.Mvc;
using StudyStation.API.Features.Users.VerifyEmail;

namespace StudyStation.API.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class VerifyEmailController : ControllerBase
    {
        private readonly IMediator _mediator;

        public VerifyEmailController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("verify-email")] // <-- هذا هو الرابط الصحيح
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailCommand command)
        {
            try
            {
                var result = await _mediator.Send(command);
                return Ok(new { message = result });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
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
