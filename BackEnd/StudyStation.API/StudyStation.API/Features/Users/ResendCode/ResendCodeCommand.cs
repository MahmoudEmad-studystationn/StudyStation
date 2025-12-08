using MediatR;
using System.ComponentModel.DataAnnotations;

namespace StudyStation.API.Features.Users.ResendCode
{
    public class ResendCodeCommand : IRequest<string>
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string CodeType { get; set; } = string.Empty; // سيكون "VerifyEmail" أو "ResetPassword"
    }
}
