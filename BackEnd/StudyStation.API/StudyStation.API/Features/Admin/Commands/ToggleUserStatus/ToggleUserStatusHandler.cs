using MediatR;
using Microsoft.AspNetCore.Identity;
using StudyStation.API.Models;

namespace StudyStation.API.Features.Admin.Commands.ToggleUserStatus
{
    public class ToggleUserStatusHandler : IRequestHandler<ToggleUserStatusCommand, bool>
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public ToggleUserStatusHandler(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<bool> Handle(ToggleUserStatusCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(request.UserId.ToString());
            if (user == null) return false;

            if (request.Action == "Suspend")
            {
                // Enable lockout and set lockout end to max value (permanent suspension)
                await _userManager.SetLockoutEnabledAsync(user, true);
                await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
            }
            else if (request.Action == "Activate")
            {
                // Clear lockout by setting end date to null
                await _userManager.SetLockoutEndDateAsync(user, null);
            }
            else
            {
                return false; // Invalid action
            }

            return true;
        }
    }
}
