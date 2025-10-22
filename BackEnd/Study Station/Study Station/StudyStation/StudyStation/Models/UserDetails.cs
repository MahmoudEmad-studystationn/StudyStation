using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace StudyStation.Models
{
    // DTO لعملية التسجيل
    public class UserDetails
    {
        [Required] public string FirstName { get; set; }
        [Required] public string LastName { get; set; }

        [Required, EmailAddress]
        [RegularExpression(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",ErrorMessage = "Invalid email format")]  
        public string Email { get; set; }

        [Required,PasswordPropertyText]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{12,}$",
        ErrorMessage = "Password must be at least 12 characters long and include uppercase, lowercase, number, and a special character.")]
        public string Password { get; set; }

        [Required, Compare("Password", ErrorMessage = "Passwords do not match")]
        public string ConfirmPassword { get; set; }

        [Required]
        public DateTime DateOfBirth { get; set; }

        [Required]
        public string Gender { get; set; }
    }
}
