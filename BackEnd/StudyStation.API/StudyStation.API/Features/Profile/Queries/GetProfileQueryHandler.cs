using MediatR;
using Microsoft.AspNetCore.Identity;
using StudyStation.API.Models;
using StudyStation.API.Features.Profile.DTOs;

namespace StudyStation.API.Features.Profile.Queries
{
    public class GetProfileQueryHandler : IRequestHandler<GetProfileQuery, ProfileDto>
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public GetProfileQueryHandler(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<ProfileDto> Handle(GetProfileQuery request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByIdAsync(request.UserId.ToString());

            if (user == null)
                throw new Exception("User not found");

            return new ProfileDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                DateOfBirth = user.DateOfBirth,
                Gender = user.Gender
            };
        }
    }
}