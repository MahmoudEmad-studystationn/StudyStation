using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.Notifications.DTOs;

namespace StudyStation.API.Features.Notifications.Queries
{
    public class GetUserNotificationsQueryHandler : IRequestHandler<GetUserNotificationsQuery, (IEnumerable<NotificationDto> Notifications, int TotalCount)>
    {
        private readonly DatabaseContext _context;

        public GetUserNotificationsQueryHandler(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<(IEnumerable<NotificationDto> Notifications, int TotalCount)> Handle(GetUserNotificationsQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Notifications
                .Include(n => n.Sender)
                .Where(n => n.RecipientId == request.UserId);

            if (request.UnreadOnly)
            {
                query = query.Where(n => !n.IsRead);
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var notifications = await query
                .OrderByDescending(n => n.CreatedAt)
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(n => new NotificationDto
                {
                    Id = n.Id,
                    SenderName = $"{n.Sender.FirstName} {n.Sender.LastName}".Trim(),
                    // SenderAvatar = n.Sender.ProfilePictureUrl // Assuming there is a profile picture URL, but currently ApplicationUser doesn't have it. We can add it or return null.
                    Type = n.Type,
                    TargetTitle = n.TargetTitle,
                    ReferenceId = n.ReferenceId,
                    IsRead = n.IsRead,
                    CreatedAt = n.CreatedAt
                })
                .ToListAsync(cancellationToken);

            return (notifications, totalCount);
        }
    }
}
