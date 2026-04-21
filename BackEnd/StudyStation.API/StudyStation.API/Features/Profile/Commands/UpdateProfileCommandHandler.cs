using MediatR;
using Microsoft.AspNetCore.Identity;
using StudyStation.API.Models;
using StudyStation.API.Features.Profile.Commands;

namespace StudyStation.API.Features.Profile.Commands
{
    public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, bool>
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public UpdateProfileCommandHandler(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<bool> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(request.UserId.ToString());

            if (user == null)
                throw new Exception("User not found");

            user.FirstName = request.Dto.FirstName;
            user.LastName = request.Dto.LastName;
            user.Gender = request.Dto.Gender;
            user.DateOfBirth = request.Dto.DateOfBirth;

            var result = await _userManager.UpdateAsync(user);

            return result.Succeeded;
        }
    }
}