using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.Admin.DTOs;

namespace StudyStation.API.Features.Admin.Queries.GetResources
{
    public class GetAdminResourcesHandler : IRequestHandler<GetAdminResourcesQuery, List<AdminResourceDto>>
    {
        private readonly DatabaseContext _context;

        public GetAdminResourcesHandler(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<List<AdminResourceDto>> Handle(GetAdminResourcesQuery request, CancellationToken cancellationToken)
        {
            var query = _context.LibraryResources
                .Include(r => r.Category)
                .AsQueryable();

            // Apply search filter
            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var search = request.Search.ToLower();
                query = query.Where(r => r.Title.ToLower().Contains(search));
            }

            var resources = await query
                .Select(r => new AdminResourceDto
                {
                    Id = r.Id,
                    Title = r.Title,
                    Category = r.Category != null ? r.Category.Name : "Uncategorized",
                    Status = r.IsApproved ? "Published" : "Pending"
                })
                .ToListAsync(cancellationToken);

            return resources;
        }
    }
}
