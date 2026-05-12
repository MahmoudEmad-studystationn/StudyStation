using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyStation.API.Features.SavedItems.Commands;
using StudyStation.API.Features.SavedItems.DTOs;
using StudyStation.API.Features.SavedItems.Queries;

namespace StudyStation.API.Features.SavedItems.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SavedItemsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public SavedItemsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        private int GetUserId()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdStr, out int userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("User is not authenticated correctly.");
        }

        [HttpGet]
        public async Task<IActionResult> GetSavedItems()
        {
            try
            {
                var query = new GetSavedItemsQuery { UserId = GetUserId() };
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> SaveItem([FromBody] SaveItemRequest request)
        {
            try
            {
                var command = new SaveItemCommand 
                { 
                    UserId = GetUserId(), 
                    Request = request 
                };

                var result = await _mediator.Send(command);

                if (!result)
                {
                    return BadRequest(new { message = "Failed to save the item. It may not exist." });
                }

                return Ok(new { message = "Item saved successfully." });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> UnsaveItem(int id)
        {
            try
            {
                var command = new UnsaveItemCommand 
                { 
                    UserId = GetUserId(), 
                    SavedItemId = id 
                };

                var result = await _mediator.Send(command);

                if (!result)
                {
                    return NotFound(new { message = "Saved item not found or you do not have permission to delete it." });
                }

                return Ok(new { message = "Item unsaved successfully." });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }
    }
}
