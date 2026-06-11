using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;

namespace StudyStation.API.Features.Notifications.Queries
{
    public class GetUnreadNotificationsCountQueryHandler : IRequestHandler<GetUnreadNotificationsCountQuery, int>
    {
        private readonly DatabaseContext _context;

        public GetUnreadNotificationsCountQueryHandler(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<int> Handle(GetUnreadNotificationsCountQuery request, CancellationToken cancellationToken)
        {
            return await _context.Notifications
                .Where(n => n.RecipientId == request.UserId && !n.IsRead)
                .CountAsync(cancellationToken);
        }
    }
}
