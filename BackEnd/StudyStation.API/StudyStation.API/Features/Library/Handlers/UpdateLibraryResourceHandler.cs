using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.Library.Commands;

namespace StudyStation.API.Features.Library.Handlers
{
    public class UpdateLibraryResourceHandler : IRequestHandler<UpdateLibraryResourceCommand, bool>
    {
        private readonly DatabaseContext _context;
        public UpdateLibraryResourceHandler(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(UpdateLibraryResourceCommand request, CancellationToken cancellationToken)
        {
            var resource = await _context.LibraryResources
                .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

            if (resource == null) return false;

            resource.Title = request.Title;
            resource.Type = request.Type;
            resource.Url = request.Url;
            resource.FilePath = request.FilePath;
            resource.Description = request.Description;
            resource.CategoryId = request.CategoryId;
            resource.ResourceTypeId = request.ResourceTypeId;

            //resource.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}

