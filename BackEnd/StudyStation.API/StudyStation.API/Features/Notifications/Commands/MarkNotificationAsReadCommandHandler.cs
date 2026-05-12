using MediatR;
using StudyStation.API.Data;

namespace StudyStation.API.Features.Notifications.Commands
{
    public class MarkNotificationAsReadCommandHandler : IRequestHandler<MarkNotificationAsReadCommand, bool>
    {
        private readonly DatabaseContext _context;

        public MarkNotificationAsReadCommandHandler(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken)
        {
            var notification = await _context.Notifications.FindAsync(new object[] { request.NotificationId }, cancellationToken);

            if (notification == null || notification.RecipientId != request.UserId)
            {
                return false;
            }

            notification.IsRead = true;
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
