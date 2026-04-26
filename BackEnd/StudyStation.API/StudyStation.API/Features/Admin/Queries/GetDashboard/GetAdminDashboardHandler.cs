// This will be filled in during the next step.
using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.Admin.DTOs;

namespace StudyStation.API.Features.Admin.Queries.GetDashboard
{
    public class GetAdminDashboardHandler : IRequestHandler<GetAdminDashboardQuery, AdminDashboardDto>
    {
        private readonly DatabaseContext _context;

        public GetAdminDashboardHandler(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<AdminDashboardDto> Handle(GetAdminDashboardQuery request, CancellationToken cancellationToken)
        {
            var now = DateTime.UtcNow;
            var today = now.Date;
            var startOfThisMonth = new DateTime(now.Year, now.Month, 1);
            var startOfLastMonth = startOfThisMonth.AddMonths(-1);

            // Fetch Global Stats
            var totalUsers = await _context.Users.CountAsync(cancellationToken);
            var usersThisMonth = await _context.Users.CountAsync(u => u.CreatedOn >= startOfThisMonth, cancellationToken);
            var usersLastMonth = await _context.Users.CountAsync(u => u.CreatedOn >= startOfLastMonth && u.CreatedOn < startOfThisMonth, cancellationToken);
            var usersPercentChange = usersLastMonth > 0 ? ((decimal)(usersThisMonth - usersLastMonth) / usersLastMonth) * 100m : (usersThisMonth > 0 ? 100m : 0m);

            var totalResources = await _context.LibraryResources.CountAsync(cancellationToken);
            // LibraryResource lacks CreatedAt, so using placeholder for percent change
            var resourcesPercentChange = 0m;

            var activeSessions = await _context.StudyRooms.CountAsync(cancellationToken); // Assuming all StudyRooms are currently active sessions for this mock or we filter by a status if exists.

            var totalPosts = await _context.Posts.CountAsync(cancellationToken);
            var postsThisMonth = await _context.Posts.CountAsync(p => p.CreatedAt >= startOfThisMonth, cancellationToken);
            var postsLastMonth = await _context.Posts.CountAsync(p => p.CreatedAt >= startOfLastMonth && p.CreatedAt < startOfThisMonth, cancellationToken);
            var postsPercentChange = postsLastMonth > 0 ? ((decimal)(postsThisMonth - postsLastMonth) / postsLastMonth) * 100m : (postsThisMonth > 0 ? 100m : 0m);

            // Fetch Quick Stats
            // Active users (e.g. logged in last 30 days) - Placeholder logic, count total for now or filter ActivityLog
            var activeUsersCount = await _context.Users.CountAsync(cancellationToken); 
            var studyRoomsOpenCount = activeSessions;
            var flaggedContentCount = await _context.FlaggedItems.CountAsync(fi => !fi.IsResolved, cancellationToken);
            
            var allStudySessions = await _context.StudySessions.AsNoTracking().ToListAsync(cancellationToken);
            var avgSessionMinutes = allStudySessions.Any() ? (int)allStudySessions.Average(s => s.DurationInHours * 60m) : 0;
            
            var resourcesToday = 0; // Placeholder due to no CreatedAt
            var newSignupsToday = await _context.Users.CountAsync(u => u.CreatedOn >= today, cancellationToken);

            // Fetch Recent Activities (Global)
            var globalActivities = await _context.ActivityLogs
                .AsNoTracking()
                .OrderByDescending(a => a.Timestamp)
                .Take(7)
                .Select(a => new GlobalActivityLogDto
                {
                    Description = a.Description,
                    Timestamp = a.Timestamp
                })
                .ToListAsync(cancellationToken);

            return new AdminDashboardDto
            {
                GlobalStats = new GlobalStatsDto
                {
                    TotalUsers = totalUsers,
                    TotalUsersPercentChange = decimal.Round(usersPercentChange, 1),
                    TotalResources = totalResources,
                    TotalResourcesPercentChange = resourcesPercentChange,
                    ActiveSessions = activeSessions,
                    PostsCount = totalPosts,
                    PostsCountPercentChange = decimal.Round(postsPercentChange, 1)
                },
                QuickStats = new QuickStatsDto
                {
                    ActiveUsers = activeUsersCount,
                    StudyRoomsOpen = studyRoomsOpenCount,
                    FlaggedContent = flaggedContentCount,
                    AvgSessionMinutes = avgSessionMinutes,
                    ResourcesToday = resourcesToday,
                    NewSignupsToday = newSignupsToday
                },
                RecentActivities = globalActivities
            };
        }
    }
}
