using MediatR;
using StudyStation.API.Data;

namespace StudyStation.API.Features.Notifications.Commands
{
    public class DeleteNotificationCommandHandler : IRequestHandler<DeleteNotificationCommand, bool>
    {
        private readonly DatabaseContext _context;

        public DeleteNotificationCommandHandler(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(DeleteNotificationCommand request, CancellationToken cancellationToken)
        {
            var notification = await _context.Notifications.FindAsync(new object[] { request.NotificationId }, cancellationToken);

            if (notification == null || notification.RecipientId != request.UserId)
            {
                return false;
            }

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
