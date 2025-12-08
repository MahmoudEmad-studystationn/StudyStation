using MediatR;
using Microsoft.AspNetCore.Mvc;
using StudyStation.API.Features.Users.ResendCode;

namespace StudyStation.API.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class ResendCodeController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ResendCodeController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("resend-code")]
        public async Task<IActionResult> ResendCode([FromBody] ResendCodeCommand command)
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
        }
    }
}
