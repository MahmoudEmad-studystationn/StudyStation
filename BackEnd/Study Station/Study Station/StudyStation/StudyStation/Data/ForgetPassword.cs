using System.ComponentModel.DataAnnotations;

namespace StudyStation.Data
{
    public class ForgetPassword
    {
        [Required]
        [EmailAddress]
        public string? Email { get; set; }

        [Required]
        public string? ClientURI { get; set; }
    }
}
