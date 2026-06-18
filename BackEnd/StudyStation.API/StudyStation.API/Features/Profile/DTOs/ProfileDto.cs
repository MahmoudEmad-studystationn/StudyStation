namespace StudyStation.API.Features.Profile.DTOs
{
    public class ProfileDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string Track { get; set; } = string.Empty;
        public string AcademicYear { get; set; } = string.Empty;
        public int CurrentStreak { get; set; }
        public decimal TotalStudyHours { get; set; }
        public int TasksDone { get; set; }
        public int TotalSessions { get; set; }
        public decimal ThisWeekHours { get; set; }
    }
}