using MediatR;
using StudyStation.API.Data;
using StudyStation.API.Features.Library.Commands;
using Microsoft.EntityFrameworkCore;

namespace StudyStation.API.Features.Library.Handlers
{
    public class ApproveResourceHandler : IRequestHandler<ApproveResourceCommand, bool>
    {
        private readonly DatabaseContext _context;

        public ApproveResourceHandler(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(ApproveResourceCommand request, CancellationToken cancellationToken)
        {
            var resource = await _context.LibraryResources
                .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

            if (resource == null)
                return false;

            resource.IsApproved = true;

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
