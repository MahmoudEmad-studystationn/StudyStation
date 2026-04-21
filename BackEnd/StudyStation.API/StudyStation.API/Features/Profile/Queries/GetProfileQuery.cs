using MediatR;
using StudyStation.API.Features.Profile.DTOs;

namespace StudyStation.API.Features.Profile.Queries
{
    public class GetProfileQuery : IRequest<ProfileDto>
    {
        public int UserId { get; }

        public GetProfileQuery(int userId)
        {
            UserId = userId;
        }
    }
}