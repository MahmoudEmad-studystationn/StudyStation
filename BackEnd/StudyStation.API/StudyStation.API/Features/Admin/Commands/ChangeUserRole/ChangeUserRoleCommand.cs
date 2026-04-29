using MediatR;

namespace StudyStation.API.Features.Admin.Commands.ChangeUserRole
{
    public class ChangeUserRoleCommand : IRequest<bool>
    {
        public int UserId { get; set; }
        public string NewRole { get; set; } = string.Empty;  // "Admin" | "User"
    }
}
