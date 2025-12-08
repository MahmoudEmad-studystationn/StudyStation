using MediatR;
using StudyStation.API.Features.Library.Models;

namespace StudyStation.API.Features.Library.Queries
{
    public class GetAllResourcesQuery : IRequest<List<LibraryResource>>
    {
    }
}
