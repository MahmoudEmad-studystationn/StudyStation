using System.ComponentModel.DataAnnotations;

namespace StudyStation.Models
{
    // DTO لعملية تسجيل الدخول
    public class LoginDetail
    {
        [Required, EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
    }
}
