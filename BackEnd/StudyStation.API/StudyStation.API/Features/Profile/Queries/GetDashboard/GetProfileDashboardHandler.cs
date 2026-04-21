using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.Profile.DTOs;

namespace StudyStation.API.Features.Profile.Queries.GetDashboard
{
    public class GetProfileDashboardHandler : IRequestHandler<GetProfileDashboardQuery, UserProfileDashboardDto>
    {
        private readonly DatabaseContext _context;

        public GetProfileDashboardHandler(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<UserProfileDashboardDto> Handle(GetProfileDashboardQuery request, CancellationToken cancellationToken)
        {
            // Fetch User
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
                
            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }

            // Calculate Dates for Current Week
            var today = DateTime.UtcNow.Date;
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek);
            var endOfWeek = startOfWeek.AddDays(7).AddTicks(-1);

            // Fetch Data
            var studySessions = await _context.StudySessions
                .AsNoTracking()
                .Where(s => s.UserId == request.UserId)
                .ToListAsync(cancellationToken);

            var tasks = await _context.ProfileStudyTasks
                .AsNoTracking()
                .Where(t => t.UserId == request.UserId)
                .ToListAsync(cancellationToken);

            var activeStudyRoomsCount = await _context.RoomParticipants
                .AsNoTracking()
                .Where(rp => rp.UserId == request.UserId)
                .CountAsync(cancellationToken);
                
            // Weekly Hours Grouping
            var thisWeekSessions = studySessions
                .Where(s => s.StartTime >= startOfWeek && s.StartTime <= endOfWeek)
                .ToList();

            var weeklyHours = new List<WeeklyHoursDto>();
            for (int i = 0; i < 7; i++)
            {
                var day = startOfWeek.AddDays(i);
                weeklyHours.Add(new WeeklyHoursDto
                {
                    DayOfWeek = day.DayOfWeek.ToString(),
                    Hours = thisWeekSessions
                        .Where(s => s.StartTime.Date == day.Date)
                        .Sum(s => s.DurationInHours)
                });
            }

            var activityLogs = await _context.ActivityLogs
                .AsNoTracking()
                .Where(a => a.UserId == request.UserId)
                .OrderByDescending(a => a.Timestamp)
                .Take(10)
                .Select(a => new ActivityLogDto
                {
                    Id = a.Id,
                    ActionType = a.ActionType,
                    Description = a.Description,
                    Timestamp = a.Timestamp
                })
                .ToListAsync(cancellationToken);

            // Build Result
            var dto = new UserProfileDashboardDto
            {
                UserDetails = new UserDetailsDto
                {
                    Name = $"{user.FirstName} {user.LastName}".Trim(),
                    Track = user.Track,
                    AcademicYear = user.AcademicYear,
                    CurrentStreak = user.CurrentStreak
                },
                Stats = new UserStatsDto
                {
                    TotalStudyHours = studySessions.Sum(s => s.DurationInHours),
                    TasksDone = tasks.Count(t => t.IsCompleted),
                    TotalSessions = studySessions.Count,
                    ThisWeekHours = thisWeekSessions.Sum(s => s.DurationInHours),
                    TasksToday = tasks.Count(t => t.DueDate.Date == today),
                    ActiveStudyRooms = activeStudyRoomsCount
                },
                PlannerTasks = tasks
                    .Where(t => t.DueDate >= startOfWeek && t.DueDate <= endOfWeek)
                    .OrderBy(t => t.DueDate)
                    .Select(t => new PlannerTaskDto
                    {
                        Id = t.Id,
                        Title = t.Title,
                        Description = t.Description,
                        DueDate = t.DueDate,
                        IsCompleted = t.IsCompleted
                    }).ToList(),
                WeeklyHours = weeklyHours,
                ActivityLogs = activityLogs
            };

            return dto;
        }
    }
}
