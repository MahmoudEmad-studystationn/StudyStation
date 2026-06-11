using MediatR;
using StudyStation.API.Features.Notifications.DTOs;

namespace StudyStation.API.Features.Notifications.Queries
{
    public class GetUserNotificationsQuery : IRequest<(IEnumerable<NotificationDto> Notifications, int TotalCount)>
    {
        public int UserId { get; set; }
        public bool UnreadOnly { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
