using MediatR;
using System.ComponentModel.DataAnnotations;

namespace StudyStation.API.Features.Users.ResetPassword
{
    public class ResetPasswordCommand : IRequest<string>
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Code { get; set; } = string.Empty;

        [Required]
        [MinLength(8)]
        public string NewPassword { get; set; } = string.Empty;
    }
}
