namespace StudyStation.API.Features.Admin.DTOs
{
    public class AdminDashboardDto
    {
        public GlobalStatsDto GlobalStats { get; set; } = new();
        public QuickStatsDto QuickStats { get; set; } = new();
        public List<GlobalActivityLogDto> RecentActivities { get; set; } = new();
    }

    public class GlobalStatsDto
    {
        public int TotalUsers { get; set; }
        public decimal TotalUsersPercentChange { get; set; }
        public int TotalResources { get; set; }
        public decimal TotalResourcesPercentChange { get; set; }
        public int ActiveSessions { get; set; }
        public int PostsCount { get; set; }
        public decimal PostsCountPercentChange { get; set; }
    }

    public class QuickStatsDto
    {
        public int ActiveUsers { get; set; }
        public int StudyRoomsOpen { get; set; }
        public int FlaggedContent { get; set; }
        public int AvgSessionMinutes { get; set; }
        public int ResourcesToday { get; set; }
        public int NewSignupsToday { get; set; }
    }

    public class GlobalActivityLogDto
    {
        public string Description { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }
}
