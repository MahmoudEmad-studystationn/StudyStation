using MediatR;

namespace StudyStation.API.Features.Notifications.Queries
{
    public class GetUnreadNotificationsCountQuery : IRequest<int>
    {
        public int UserId { get; set; }
    }
}
