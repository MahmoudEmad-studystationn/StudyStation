using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using StudyStation.API.Features.StudyWithFriends.Models;

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
        public string? OtpCodeHash { get; set; }
        public DateTime? OtpExpiryDate { get; set; }

        // ... (باقي الخصائص مثل FirstName, LastName, etc.)

        // الخصائص الجديدة لتأكيد البريد الإلكتروني
        public string? EmailVerificationCode { get; set; }
        public DateTime? EmailVerificationCodeExpiry { get; set; }

        // الخصائص الجديدة لإعادة تعيين كلمة المرور
        // public string? PasswordResetCode { get; set; }
        //public DateTime? PasswordResetCodeExpiry { get; set; }

        // ... (باقي الكلاس)

        // --- Navigation properties (تأكد من وجود كل هذه) ---
        public ICollection<Post> Posts { get; set; } = new List<Post>();
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public ICollection<Reaction> Reactions { get; set; } = new List<Reaction>();
        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

        // Study With Friends properties
        public ICollection<StudyRoom> OwnedStudyRooms { get; set; } = new List<StudyRoom>();
        public ICollection<RoomParticipant> RoomParticipations { get; set; } = new List<RoomParticipant>();

        // Profile Dashboard properties
        public string Track { get; set; } = string.Empty;
        [MaxLength(50)]
        public string AcademicYear { get; set; } = string.Empty;
        public int CurrentStreak { get; set; } = 0;
        public decimal DailyGoalHours { get; set; } = 0m;

        public ICollection<StudyStation.API.Features.Profile.Models.StudyTask> ProfileStudyTasks { get; set; } = new List<StudyStation.API.Features.Profile.Models.StudyTask>();
        public ICollection<StudyStation.API.Features.Profile.Models.StudySession> StudySessions { get; set; } = new List<StudyStation.API.Features.Profile.Models.StudySession>();
        public ICollection<StudyStation.API.Features.Profile.Models.ActivityLog> ActivityLogs { get; set; } = new List<StudyStation.API.Features.Profile.Models.ActivityLog>();

        // Saved Items
        public ICollection<StudyStation.API.Features.SavedItems.Models.SavedItem> SavedItems { get; set; } = new List<StudyStation.API.Features.SavedItems.Models.SavedItem>();
    }
}
