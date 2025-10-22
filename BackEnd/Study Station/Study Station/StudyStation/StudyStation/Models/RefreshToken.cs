namespace StudyStation.Models
{
    // جدول منفصل للتوكينز (لو حبيتي تخزني RefreshToken history أو أكتر من جهاز)
    public class RefreshToken
    {
        public int Id { get; set; }
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiryDate { get; set; }
        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;


        // العلاقة مع اليوزر
        public int UserId { get; set; }
        public ApplicationUser? User { get; set; }
    }
}
