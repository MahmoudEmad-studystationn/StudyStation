using MediatR;
using StudyStation.API.Features.Admin.DTOs;

namespace StudyStation.API.Features.Admin.Queries.GetResources
{
    public class GetAdminResourcesQuery : IRequest<List<AdminResourceDto>>
    {
        public string? Search { get; set; }

        public GetAdminResourcesQuery(string? search = null)
        {
            Search = search;
        }
    }
}
