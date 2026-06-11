using MediatR;
using StudyStation.API.Features.Admin.DTOs;

namespace StudyStation.API.Features.Admin.Queries.GetUsers
{
    public class GetAdminUsersQuery : IRequest<List<AdminUserDto>>
    {
        public string? Search { get; set; }

        public GetAdminUsersQuery(string? search = null)
        {
            Search = search;
        }
    }
}
