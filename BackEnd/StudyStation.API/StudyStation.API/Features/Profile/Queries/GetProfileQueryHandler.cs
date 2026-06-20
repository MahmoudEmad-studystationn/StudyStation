using MediatR;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Data;
using StudyStation.API.Features.Profile.DTOs;

namespace StudyStation.API.Features.Profile.Queries
{
    public class GetProfileQueryHandler : IRequestHandler<GetProfileQuery, ProfileDto>
    {
        private readonly DatabaseContext _context;

        public GetProfileQueryHandler(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<ProfileDto> Handle(GetProfileQuery request, CancellationToken cancellationToken)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

            if (user == null)
                throw new KeyNotFoundException("User not found");

            // Calculate Dates for Current Week (starting Sunday)
            var today = DateTime.UtcNow.Date;
            var startOfWeek = today.AddDays(-(int)today.DayOfWeek);
            var endOfWeek = startOfWeek.AddDays(7).AddTicks(-1);

            // Fetch study sessions and tasks
            var studySessions = await _context.StudySessions
                .AsNoTracking()
                .Where(s => s.UserId == request.UserId)
                .ToListAsync(cancellationToken);

            var tasks = await _context.ProfileStudyTasks
                .AsNoTracking()
                .Where(t => t.UserId == request.UserId)
                .ToListAsync(cancellationToken);

            var thisWeekSessions = studySessions
                .Where(s => s.StartTime >= startOfWeek && s.StartTime <= endOfWeek)
                .ToList();

            return new ProfileDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                DateOfBirth = user.DateOfBirth,
                Gender = user.Gender,
                Track = user.Track,
                AcademicYear = user.AcademicYear,
                CurrentStreak = user.CurrentStreak,
                TotalStudyHours = studySessions.Sum(s => s.DurationInHours),
                TasksDone = tasks.Count(t => t.IsCompleted),
                TotalSessions = studySessions.Count,
                ThisWeekHours = thisWeekSessions.Sum(s => s.DurationInHours)
            };
        }
    }
}