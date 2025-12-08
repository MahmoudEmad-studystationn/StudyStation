using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.Library.Models;
using StudyStation.API.Features.Library.Queries;

namespace StudyStation.API.Features.Library.Handlers
{
    public class GetAllResourcesHandler : IRequestHandler<GetAllResourcesQuery, List<LibraryResource>>
    {
        private readonly DatabaseContext _context;

        public GetAllResourcesHandler(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<List<LibraryResource>> Handle(GetAllResourcesQuery request, CancellationToken cancellationToken)
        {
            return await _context.LibraryResources
                .Where(r => r.IsApproved)
                .ToListAsync(cancellationToken);
        }
    }
}
