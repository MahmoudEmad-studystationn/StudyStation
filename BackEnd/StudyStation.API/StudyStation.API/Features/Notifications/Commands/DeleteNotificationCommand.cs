using MediatR;

namespace StudyStation.API.Features.Notifications.Commands
{
    public class DeleteNotificationCommand : IRequest<bool>
    {
        public int NotificationId { get; set; }
        public int UserId { get; set; }
    }
}
