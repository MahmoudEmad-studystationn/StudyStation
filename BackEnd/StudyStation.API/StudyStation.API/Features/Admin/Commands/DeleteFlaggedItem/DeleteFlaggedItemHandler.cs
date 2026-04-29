using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;

namespace StudyStation.API.Features.Admin.Commands.DeleteFlaggedItem
{
    public class DeleteFlaggedItemHandler : IRequestHandler<DeleteFlaggedItemCommand, bool>
    {
        private readonly DatabaseContext _context;

        public DeleteFlaggedItemHandler(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(DeleteFlaggedItemCommand request, CancellationToken cancellationToken)
        {
            var flaggedItem = await _context.FlaggedItems
                .FirstOrDefaultAsync(f => f.Id == request.FlaggedItemId, cancellationToken);

            if (flaggedItem == null) return false;

            // Delete the actual content based on type
            switch (flaggedItem.ContentType)
            {
                case "Post":
                    var post = await _context.Posts
                        .Include(p => p.Comments)
                        .Include(p => p.Reactions)
                        .FirstOrDefaultAsync(p => p.Id == flaggedItem.ContentId, cancellationToken);

                    if (post != null)
                    {
                        // Remove related comments and reactions first
                        _context.Comments.RemoveRange(post.Comments);
                        _context.Reactions.RemoveRange(post.Reactions);
                        _context.Posts.Remove(post);
                    }
                    break;

                case "Room":
                    var room = await _context.StudyRooms
                        .FirstOrDefaultAsync(r => r.Id == flaggedItem.ContentId, cancellationToken);

                    if (room != null)
                    {
                        // Cascade deletes are configured for StudyRoom dependents
                        _context.StudyRooms.Remove(room);
                    }
                    break;
            }

            // Mark the flagged item as resolved
            flaggedItem.IsResolved = true;

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
