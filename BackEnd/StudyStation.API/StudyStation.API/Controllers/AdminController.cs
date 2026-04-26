using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyStation.API.Features.Admin.Queries.GetDashboard;

namespace StudyStation.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // We can add Roles = "Admin" if Identity handles roles
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
    }
}
