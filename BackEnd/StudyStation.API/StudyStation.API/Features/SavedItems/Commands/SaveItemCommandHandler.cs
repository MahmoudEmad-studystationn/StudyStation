using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.SavedItems.Models;

namespace StudyStation.API.Features.SavedItems.Commands
{
    public class SaveItemCommandHandler : IRequestHandler<SaveItemCommand, bool>
    {
        private readonly DatabaseContext _context;

        public SaveItemCommandHandler(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(SaveItemCommand request, CancellationToken cancellationToken)
        {
            // Verify if the item exists
            if (request.Request.ItemType == SavedItemType.Post)
            {
                var postExists = await _context.Posts.AnyAsync(p => p.Id == request.Request.ItemId, cancellationToken);
                if (!postExists) return false;

                // Check if already saved
                var alreadySaved = await _context.SavedItems.AnyAsync(s => s.UserId == request.UserId && s.ItemType == SavedItemType.Post && s.PostId == request.Request.ItemId, cancellationToken);
                if (alreadySaved) return true; // Idempotent
            }
            else if (request.Request.ItemType == SavedItemType.LibraryResource)
            {
                var resourceExists = await _context.LibraryResources.AnyAsync(r => r.Id == request.Request.ItemId, cancellationToken);
                if (!resourceExists) return false;

                // Check if already saved
                var alreadySaved = await _context.SavedItems.AnyAsync(s => s.UserId == request.UserId && s.ItemType == SavedItemType.LibraryResource && s.LibraryResourceId == request.Request.ItemId, cancellationToken);
                if (alreadySaved) return true; // Idempotent
            }
            else
            {
                return false;
            }

            var savedItem = new SavedItem
            {
                UserId = request.UserId,
                ItemType = request.Request.ItemType,
                PostId = request.Request.ItemType == SavedItemType.Post ? request.Request.ItemId : null,
                LibraryResourceId = request.Request.ItemType == SavedItemType.LibraryResource ? request.Request.ItemId : null,
                SavedAt = DateTime.UtcNow
            };

            _context.SavedItems.Add(savedItem);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
