namespace StudyStation.API.Features.Profile.DTOs
{
    public class UserProfileDashboardDto
    {
        public UserDetailsDto UserDetails { get; set; } = new();
        public UserStatsDto Stats { get; set; } = new();
        
        public List<PlannerTaskDto> PlannerTasks { get; set; } = new();
        public List<WeeklyHoursDto> WeeklyHours { get; set; } = new();
        public List<ActivityLogDto> ActivityLogs { get; set; } = new();
    }

    public class UserDetailsDto
    {
        public string Name { get; set; } = string.Empty;
        public string Track { get; set; } = string.Empty;
        public string AcademicYear { get; set; } = string.Empty;
        public int CurrentStreak { get; set; }
    }

    public class UserStatsDto
    {
        public decimal TotalStudyHours { get; set; }
        public int TasksDone { get; set; }
        public int TotalSessions { get; set; }
        public decimal ThisWeekHours { get; set; }
        public int TasksToday { get; set; }
        public int ActiveStudyRooms { get; set; }
    }
}
