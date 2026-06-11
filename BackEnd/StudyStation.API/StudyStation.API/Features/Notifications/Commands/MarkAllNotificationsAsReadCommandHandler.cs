using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;

namespace StudyStation.API.Features.Notifications.Commands
{
    public class MarkAllNotificationsAsReadCommandHandler : IRequestHandler<MarkAllNotificationsAsReadCommand, bool>
    {
        private readonly DatabaseContext _context;

        public MarkAllNotificationsAsReadCommandHandler(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(MarkAllNotificationsAsReadCommand request, CancellationToken cancellationToken)
        {
            var unreadNotifications = await _context.Notifications
                .Where(n => n.RecipientId == request.UserId && !n.IsRead)
                .ToListAsync(cancellationToken);

            if (!unreadNotifications.Any())
            {
                return true;
            }

            foreach (var notification in unreadNotifications)
            {
                notification.IsRead = true;
            }

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
