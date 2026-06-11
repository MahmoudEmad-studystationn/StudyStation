using MediatR;
using StudyStation.API.Features.Notifications.DTOs;
using StudyStation.API.Features.Notifications.Models;

namespace StudyStation.API.Features.Notifications.Commands
{
    public class CreateNotificationCommand : IRequest<NotificationDto>
    {
        public int RecipientId { get; set; }
        public int SenderId { get; set; }
        public NotificationType Type { get; set; }
        public string TargetTitle { get; set; } = string.Empty;
        public int? ReferenceId { get; set; }
    }
}
