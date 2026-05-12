using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.SavedItems.DTOs;
using StudyStation.API.Features.SavedItems.Models;

namespace StudyStation.API.Features.SavedItems.Queries
{
    public class GetSavedItemsQueryHandler : IRequestHandler<GetSavedItemsQuery, List<SavedItemResponse>>
    {
        private readonly DatabaseContext _context;

        public GetSavedItemsQueryHandler(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<List<SavedItemResponse>> Handle(GetSavedItemsQuery request, CancellationToken cancellationToken)
        {
            var savedItems = await _context.SavedItems
                .Include(s => s.Post)
                    .ThenInclude(p => p.User) // Include user to get AuthorName for Posts
                .Include(s => s.LibraryResource)
                    .ThenInclude(r => r.ResourceType) // Include to get ResourceTypeName
                .Where(s => s.UserId == request.UserId)
                .OrderByDescending(s => s.SavedAt)
                .ToListAsync(cancellationToken);

            var responseList = new List<SavedItemResponse>();

            foreach (var item in savedItems)
            {
                var response = new SavedItemResponse
                {
                    Id = item.Id,
                    ItemType = item.ItemType.ToString(),
                    SavedAt = item.SavedAt
                };

                if (item.ItemType == SavedItemType.Post && item.Post != null)
                {
                    response.OriginalItemId = item.Post.Id;
                    response.Title = item.Post.Title;
                    response.ContentSnippet = item.Post.Content.Length > 100 
                        ? item.Post.Content.Substring(0, 100) + "..." 
                        : item.Post.Content;
                    response.AuthorName = $"{item.Post.User.FirstName} {item.Post.User.LastName}";
                    response.Url = item.Post.ImageUrl ?? string.Empty;
                }
                else if (item.ItemType == SavedItemType.LibraryResource && item.LibraryResource != null)
                {
                    response.OriginalItemId = item.LibraryResource.Id;
                    response.Title = item.LibraryResource.Title;
                    response.ContentSnippet = item.LibraryResource.Description;
                    response.ResourceTypeName = item.LibraryResource.ResourceType?.Name ?? string.Empty;
                    response.Url = item.LibraryResource.Url ?? item.LibraryResource.FilePath ?? string.Empty;
                    response.AuthorName = string.Empty; // Libraries don't have direct Authors in this model currently
                }

                responseList.Add(response);
            }

            return responseList;
        }
    }
}
