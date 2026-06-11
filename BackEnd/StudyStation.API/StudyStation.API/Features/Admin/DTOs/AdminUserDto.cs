namespace StudyStation.API.Features.Admin.DTOs
{
    public class AdminUserDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;       // "Admin" | "User"
        public string Status { get; set; } = string.Empty;     // "Active" | "Suspended"
    }
}
