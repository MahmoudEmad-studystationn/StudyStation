namespace StudyStation.API.Features.Profile.DTOs
{
    public class ActivityLogDto
    {
        public int Id { get; set; }
        public string ActionType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }
}
