using MediatR;

namespace StudyStation.API.Features.Admin.Commands.ToggleUserStatus
{
    public class ToggleUserStatusCommand : IRequest<bool>
    {
        public int UserId { get; set; }
        public string Action { get; set; } = string.Empty;   // "Suspend" | "Activate"
    }
}
