using MediatR;

namespace StudyStation.API.Features.Notifications.Commands
{
    public class MarkNotificationAsReadCommand : IRequest<bool>
    {
        public int NotificationId { get; set; }
        public int UserId { get; set; }
    }
}
