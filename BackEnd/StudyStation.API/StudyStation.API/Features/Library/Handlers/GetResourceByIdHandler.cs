using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.Library.Models;
using StudyStation.API.Features.Library.Queries;

namespace StudyStation.API.Features.Library.Handlers
{
    public class GetResourceByIdHandler : IRequestHandler<GetResourceByIdQuery, LibraryResource>
    {
        private readonly DatabaseContext _context;

        public GetResourceByIdHandler(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<LibraryResource> Handle(GetResourceByIdQuery request, CancellationToken cancellationToken)
        {
            return await _context.LibraryResources
                .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);
        }
    }
}
