using MediatR;
using Microsoft.AspNetCore.Mvc;
using StudyStation.API.Features.Auth.Commands;
using StudyStation.API.Features.Auth.DTOs;

namespace StudyStation.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AuthController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
        {
            if (dto == null)
                return BadRequest("Request body is required.");

            var result = await _mediator.Send(
                new LoginCommand(dto.Email, dto.Password));

            return Ok(result);
        }
    }
}
