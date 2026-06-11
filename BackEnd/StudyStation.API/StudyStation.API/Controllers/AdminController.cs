using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyStation.API.Features.Admin.Commands.ChangeUserRole;
using StudyStation.API.Features.Admin.Commands.DeleteFlaggedItem;
using StudyStation.API.Features.Admin.Commands.DeleteResource;
using StudyStation.API.Features.Admin.Commands.ToggleUserStatus;
using StudyStation.API.Features.Admin.Queries.GetDashboard;
using StudyStation.API.Features.Admin.Queries.GetModeration;
using StudyStation.API.Features.Admin.Queries.GetResources;
using StudyStation.API.Features.Admin.Queries.GetUsers;

namespace StudyStation.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AdminController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetAdminDashboard()
        {
            try
            {
                var query = new GetAdminDashboardQuery();
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving admin dashboard data", details = ex.Message });
            }
        }

        // ==================== Users Management ====================

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] string? search)
        {
            try
            {
                var query = new GetAdminUsersQuery(search);
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving users", details = ex.Message });
            }
        }

        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> ChangeUserRole(int id, [FromBody] ChangeUserRoleCommand command)
        {
            try
            {
                command.UserId = id;
                var result = await _mediator.Send(command);
                return result ? Ok(new { message = "Role updated successfully" }) : NotFound(new { message = "User not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error changing user role", details = ex.Message });
            }
        }

        [HttpPut("users/{id}/status")]
        public async Task<IActionResult> ToggleUserStatus(int id, [FromBody] ToggleUserStatusCommand command)
        {
            try
            {
                command.UserId = id;
                var result = await _mediator.Send(command);
                return result ? Ok(new { message = $"User {command.Action.ToLower()}d successfully" }) : NotFound(new { message = "User not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating user status", details = ex.Message });
            }
        }

        // ==================== Resources Management ====================

        [HttpGet("resources")]
        public async Task<IActionResult> GetResources([FromQuery] string? search)
        {
            try
            {
                var query = new GetAdminResourcesQuery(search);
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving resources", details = ex.Message });
            }
        }

        [HttpDelete("resources/{id}")]
        public async Task<IActionResult> DeleteResource(int id)
        {
            try
            {
                var result = await _mediator.Send(new DeleteAdminResourceCommand(id));
                return result ? Ok(new { message = "Resource deleted successfully" }) : NotFound(new { message = "Resource not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting resource", details = ex.Message });
            }
        }

        // ==================== Moderation ====================

        [HttpGet("moderation")]
        public async Task<IActionResult> GetModeration()
        {
            try
            {
                var query = new GetModerationQuery();
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving moderation items", details = ex.Message });
            }
        }

        [HttpDelete("moderation/{id}")]
        public async Task<IActionResult> DeleteFlaggedItem(int id)
        {
            try
            {
                var result = await _mediator.Send(new DeleteFlaggedItemCommand(id));
                return result ? Ok(new { message = "Flagged content deleted successfully" }) : NotFound(new { message = "Flagged item not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting flagged item", details = ex.Message });
            }
        }
    }
}
