using MediatR;

namespace StudyStation.API.Features.Notifications.Commands
{
    public class MarkAllNotificationsAsReadCommand : IRequest<bool>
    {
        public int UserId { get; set; }
    }
}
