using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudyStation.API.Features.Notifications.Commands;
using StudyStation.API.Features.Notifications.Queries;
using System.Security.Claims;

namespace StudyStation.API.Features.Notifications.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public NotificationsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        private int GetCurrentUserId()
        {
            return int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        }

        [HttpGet]
        public async Task<IActionResult> GetUserNotifications([FromQuery] bool unreadOnly = false, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var userId = GetCurrentUserId();
            var query = new GetUserNotificationsQuery
            {
                UserId = userId,
                UnreadOnly = unreadOnly,
                Page = page,
                PageSize = pageSize
            };

            var result = await _mediator.Send(query);
            return Ok(new
            {
                TotalCount = result.TotalCount,
                Page = page,
                PageSize = pageSize,
                Notifications = result.Notifications
            });
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = GetCurrentUserId();
            var query = new GetUnreadNotificationsCountQuery { UserId = userId };
            var count = await _mediator.Send(query);
            return Ok(new { UnreadCount = count });
        }

        [HttpPut("mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = GetCurrentUserId();
            var command = new MarkAllNotificationsAsReadCommand { UserId = userId };
            await _mediator.Send(command);
            return Ok(new { Message = "All notifications marked as read." });
        }

        [HttpPut("{id}/mark-read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = GetCurrentUserId();
            var command = new MarkNotificationAsReadCommand { NotificationId = id, UserId = userId };
            var result = await _mediator.Send(command);

            if (!result)
            {
                return NotFound(new { Message = "Notification not found or unauthorized." });
            }

            return Ok(new { Message = "Notification marked as read." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var userId = GetCurrentUserId();
            var command = new DeleteNotificationCommand { NotificationId = id, UserId = userId };
            var result = await _mediator.Send(command);

            if (!result)
            {
                return NotFound(new { Message = "Notification not found or unauthorized." });
            }

            return Ok(new { Message = "Notification deleted successfully." });
        }
    }
}
