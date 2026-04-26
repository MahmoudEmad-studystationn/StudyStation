using MediatR;
using StudyStation.API.Features.Admin.DTOs;

namespace StudyStation.API.Features.Admin.Queries.GetDashboard
{
    public class GetAdminDashboardQuery : IRequest<AdminDashboardDto>
    {
    }
}
