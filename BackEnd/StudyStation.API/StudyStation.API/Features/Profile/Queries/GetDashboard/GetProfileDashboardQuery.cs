using MediatR;
using StudyStation.API.Features.Profile.DTOs;

namespace StudyStation.API.Features.Profile.Queries.GetDashboard
{
    public class GetProfileDashboardQuery : IRequest<UserProfileDashboardDto>
    {
        public int UserId { get; set; }

        public GetProfileDashboardQuery(int userId)
        {
            UserId = userId;
        }
    }
}
