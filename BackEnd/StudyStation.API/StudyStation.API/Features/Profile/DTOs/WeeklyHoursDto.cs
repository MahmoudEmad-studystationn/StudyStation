namespace StudyStation.API.Features.Profile.DTOs
{
    public class WeeklyHoursDto
    {
        public string DayOfWeek { get; set; } = string.Empty;
        public decimal Hours { get; set; }
    }
}
