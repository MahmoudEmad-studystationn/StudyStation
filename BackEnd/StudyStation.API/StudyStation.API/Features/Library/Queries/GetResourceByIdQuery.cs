using MediatR;
using StudyStation.API.Features.Library.Models;

namespace StudyStation.API.Features.Library.Queries
{
    public class GetResourceByIdQuery : IRequest<LibraryResource>
    {
        public int Id { get; set; }
        public GetResourceByIdQuery(int id)
        {
            Id = id;
        }
    }
}
