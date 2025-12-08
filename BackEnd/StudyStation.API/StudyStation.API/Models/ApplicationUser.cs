using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace StudyStation.API.Models
{
    public class ApplicationUser : IdentityUser<int>
    {
        [Required, MaxLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required, MaxLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        public DateTime DateOfBirth { get; set; }

        public string Gender { get; set; } = string.Empty;

        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;

        // --- حقول الـ OTP ---
        public string? OtpCode { get; set; }
        public DateTime? OtpExpiryDate { get; set; }

        // ... (باقي الخصائص مثل FirstName, LastName, etc.)

        // الخصائص الجديدة لتأكيد البريد الإلكتروني
        public string? EmailVerificationCode { get; set; }
        public DateTime? EmailVerificationCodeExpiry { get; set; }

        // الخصائص الجديدة لإعادة تعيين كلمة المرور
        public string? PasswordResetCode { get; set; }
        public DateTime? PasswordResetCodeExpiry { get; set; }

        // ... (باقي الكلاس)

        // --- Navigation properties (تأكد من وجود كل هذه) ---
        public ICollection<Post> Posts { get; set; } = new List<Post>();
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public ICollection<Reaction> Reactions { get; set; } = new List<Reaction>();
        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    }
}
