using MediatR;
using Microsoft.AspNetCore.Identity;
using StudyStation.API.Models;

namespace StudyStation.API.Features.Admin.Commands.ChangeUserRole
{
    public class ChangeUserRoleHandler : IRequestHandler<ChangeUserRoleCommand, bool>
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public ChangeUserRoleHandler(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<bool> Handle(ChangeUserRoleCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(request.UserId.ToString());
            if (user == null) return false;

            // Remove all current roles
            var currentRoles = await _userManager.GetRolesAsync(user);
            if (currentRoles.Any())
            {
                await _userManager.RemoveFromRolesAsync(user, currentRoles);
            }

            // Assign the new role
            var result = await _userManager.AddToRoleAsync(user, request.NewRole);
            return result.Succeeded;
        }
    }
}
