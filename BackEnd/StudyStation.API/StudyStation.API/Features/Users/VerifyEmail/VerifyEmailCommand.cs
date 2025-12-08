using MediatR;
using System.ComponentModel.DataAnnotations;

namespace StudyStation.API.Features.Users.VerifyEmail
{
    public class VerifyEmailCommand : IRequest<string>
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Code { get; set; } = string.Empty;
    }
}
