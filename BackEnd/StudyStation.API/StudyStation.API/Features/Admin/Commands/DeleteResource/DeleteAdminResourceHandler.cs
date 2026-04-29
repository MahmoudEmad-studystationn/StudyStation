using MediatR;
using StudyStation.API.Data;

namespace StudyStation.API.Features.Admin.Commands.DeleteResource
{
    public class DeleteAdminResourceHandler : IRequestHandler<DeleteAdminResourceCommand, bool>
    {
        private readonly DatabaseContext _context;

        public DeleteAdminResourceHandler(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(DeleteAdminResourceCommand request, CancellationToken cancellationToken)
        {
            var resource = await _context.LibraryResources.FindAsync(new object[] { request.ResourceId }, cancellationToken);
            if (resource == null) return false;

            _context.LibraryResources.Remove(resource);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
