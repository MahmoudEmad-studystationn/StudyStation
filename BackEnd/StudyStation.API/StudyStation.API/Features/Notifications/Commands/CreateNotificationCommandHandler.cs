using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.Notifications.DTOs;
using StudyStation.API.Features.Notifications.Models;
using StudyStation.API.Hubs;

namespace StudyStation.API.Features.Notifications.Commands
{
    public class CreateNotificationCommandHandler : IRequestHandler<CreateNotificationCommand, NotificationDto>
    {
        private readonly DatabaseContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public CreateNotificationCommandHandler(DatabaseContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        public async Task<NotificationDto> Handle(CreateNotificationCommand request, CancellationToken cancellationToken)
        {
            // Do not notify if the sender is the recipient
            if (request.SenderId == request.RecipientId)
            {
                return null;
            }

            var sender = await _context.Users.FindAsync(new object[] { request.SenderId }, cancellationToken);
            if (sender == null)
            {
                return null;
            }

            var notification = new Notification
            {
                RecipientId = request.RecipientId,
                SenderId = request.SenderId,
                Type = request.Type,
                TargetTitle = request.TargetTitle,
                ReferenceId = request.ReferenceId,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync(cancellationToken);

            var notificationDto = new NotificationDto
            {
                Id = notification.Id,
                SenderName = $"{sender.FirstName} {sender.LastName}".Trim(),
                Type = notification.Type,
                TargetTitle = notification.TargetTitle,
                ReferenceId = notification.ReferenceId,
                IsRead = notification.IsRead,
                CreatedAt = notification.CreatedAt
            };

            // Push real-time notification via SignalR
            await _hubContext.Clients.User(request.RecipientId.ToString())
                .SendAsync("ReceiveNotification", notificationDto, cancellationToken);

            return notificationDto;
        }
    }
}
