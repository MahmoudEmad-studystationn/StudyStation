namespace StudyStation.API.Features.Admin.DTOs
{
    public class AdminResourceDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;   // Category name
        public string Status { get; set; } = string.Empty;     // "Published" | "Pending"
    }
}
