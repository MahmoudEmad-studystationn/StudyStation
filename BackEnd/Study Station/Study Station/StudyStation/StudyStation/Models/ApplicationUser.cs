using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;


namespace StudyStation.Models
{
    public class ApplicationUser : IdentityUser<int>
    {

        [Required, MaxLength(50)]
        public string FirstName { get; set; }

        [Required, MaxLength(50)]
        public string LastName { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; }

        // هيتم تخزين الباسورد المشفر هنا (مش الـ Plain Password)
        [Required]
        public string PasswordHash { get; set; }

        [Required]
        public DateTime DateOfBirth { get; set; }

        // العمر يتحسب أوتوماتيك
        [Range(12, 100, ErrorMessage = "Age must be between 12 and 100")]
        public int Age
        {
            get
            {
                var today = DateTime.Today;
                var age = today.Year - DateOfBirth.Year;
                if (DateOfBirth.Date > today.AddYears(-age)) age--;
                return age;
            }
        }

        public string Gender { get; set; } = "Female";

        // لو حابّة تخزني RefreshToken جوّا الجدول نفسه
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiry { get; set; }

        public int IsActive { get; set; } = 1;
        public DateTime CreatedOn { get; set; } = DateTime.Now;

        // لو هتستخدمي جدول RefreshToken منفصل، خلي فيه Navigation
        public ICollection<RefreshToken>? RefreshTokens { get; set; }
    }
}
