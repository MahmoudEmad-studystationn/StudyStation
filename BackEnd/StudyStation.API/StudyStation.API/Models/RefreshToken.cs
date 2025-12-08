namespace StudyStation.API.Models
{
    public class RefreshToken
    {
        public int Id { get; set; }
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiryDate { get; set; }
        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

        // Foreign Key
        public int UserId { get; set; }
        // Navigation property
        public ApplicationUser User { get; set; } = null!;
    }
}
