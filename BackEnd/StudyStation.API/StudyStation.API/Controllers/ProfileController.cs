using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyStation.API.Features.Profile.Queries;
using System.Security.Claims;
using StudyStation.API.Features.Profile.Commands;
using StudyStation.API.Features.Profile.DTOs;
namespace StudyStation.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // 🔥 مهم جدًا
    public class ProfileController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ProfileController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var result = await _mediator.Send(new GetProfileQuery(userId));

            return Ok(result);
        }
        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);

            var result = await _mediator.Send(new UpdateProfileCommand(userId, dto));

            if (!result)
                return BadRequest("Update failed");

            return Ok("Profile updated successfully");
        }
    }
}