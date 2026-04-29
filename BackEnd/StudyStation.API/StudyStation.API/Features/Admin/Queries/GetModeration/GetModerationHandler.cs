using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.Admin.DTOs;

namespace StudyStation.API.Features.Admin.Queries.GetModeration
{
    public class GetModerationHandler : IRequestHandler<GetModerationQuery, List<ModerationItemDto>>
    {
        private readonly DatabaseContext _context;

        public GetModerationHandler(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<List<ModerationItemDto>> Handle(GetModerationQuery request, CancellationToken cancellationToken)
        {
            // Get all unresolved flagged items with reporter info
            var flaggedItems = await _context.FlaggedItems
                .AsNoTracking()
                .Include(f => f.Reporter)
                .Where(f => !f.IsResolved)
                .OrderByDescending(f => f.ReportedAt)
                .ToListAsync(cancellationToken);

            var result = new List<ModerationItemDto>();

            foreach (var item in flaggedItems)
            {
                var contentPreview = await GetContentPreview(item.ContentType, item.ContentId, cancellationToken);

                result.Add(new ModerationItemDto
                {
                    Id = item.Id,
                    ContentPreview = contentPreview,
                    UserName = $"@{item.Reporter.UserName ?? "unknown"}",
                    Type = item.ContentType,
                    ReportedAt = item.ReportedAt,
                    ContentId = item.ContentId
                });
            }

            return result;
        }

        private async Task<string> GetContentPreview(string contentType, int contentId, CancellationToken cancellationToken)
        {
            const int maxLength = 50;

            switch (contentType)
            {
                case "Post":
                    var post = await _context.Posts
                        .AsNoTracking()
                        .FirstOrDefaultAsync(p => p.Id == contentId, cancellationToken);
                    if (post != null)
                    {
                        var text = !string.IsNullOrEmpty(post.Content) ? post.Content : post.Title;
                        return text.Length > maxLength ? text.Substring(0, maxLength) + "..." : text;
                    }
                    return "[Deleted content]";

                case "Room":
                    var room = await _context.StudyRooms
                        .AsNoTracking()
                        .FirstOrDefaultAsync(r => r.Id == contentId, cancellationToken);
                    if (room != null)
                    {
                        var roomText = $"Room \"{room.Name}\"";
                        if (!string.IsNullOrEmpty(room.Description))
                        {
                            roomText += $" — {room.Description}";
                        }
                        return roomText.Length > maxLength ? roomText.Substring(0, maxLength) + "..." : roomText;
                    }
                    return "[Deleted room]";

                default:
                    return "[Unknown content type]";
            }
        }
    }
}
