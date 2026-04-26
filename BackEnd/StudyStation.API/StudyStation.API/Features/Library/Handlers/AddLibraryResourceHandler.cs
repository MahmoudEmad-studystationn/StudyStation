using MediatR;
using StudyStation.API.Data;
using StudyStation.API.Features.Library.Commands;
using StudyStation.API.Features.Library.Models;

namespace StudyStation.API.Features.Library.Handlers
{
    public class AddLibraryResourceHandler : IRequestHandler<AddLibraryResourceCommand, int>
    {
        private readonly DatabaseContext _context;

        public AddLibraryResourceHandler(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<int> Handle(AddLibraryResourceCommand request, CancellationToken cancellationToken)
        {
            var resource = new LibraryResource
            {
                Title = request.Title,
                Type = request.Type,
                Url = request.Url,
                FilePath = request.FilePath,
                Description = request.Description,
                IsApproved = false,
                CategoryId = request.CategoryId,
                ResourceTypeId = request.ResourceTypeId
            };

            _context.LibraryResources.Add(resource);
            await _context.SaveChangesAsync(cancellationToken);

            return resource.Id;
        }
    }
}
