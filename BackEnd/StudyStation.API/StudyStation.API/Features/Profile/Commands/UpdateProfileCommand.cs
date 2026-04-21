using MediatR;
using StudyStation.API.Features.Profile.DTOs;

namespace StudyStation.API.Features.Profile.Commands
{
    public class UpdateProfileCommand : IRequest<bool>
    {
        public int UserId { get; }
        public UpdateProfileDto Dto { get; }

        public UpdateProfileCommand(int userId, UpdateProfileDto dto)
        {
            UserId = userId;
            Dto = dto;
        }
    }
}