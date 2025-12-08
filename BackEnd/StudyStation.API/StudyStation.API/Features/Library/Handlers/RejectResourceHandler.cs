using MediatR;
using StudyStation.API.Data;
using StudyStation.API.Features.Library.Commands;
using Microsoft.EntityFrameworkCore;

namespace StudyStation.API.Features.Library.Handlers
{
    public class RejectResourceHandler : IRequestHandler<RejectResourceCommand, bool>
    {
        private readonly DatabaseContext _context;

        public RejectResourceHandler(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(RejectResourceCommand request, CancellationToken cancellationToken)
        {
            var resource = await _context.LibraryResources
                .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

            if (resource == null)
                return false;

            _context.LibraryResources.Remove(resource);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}

