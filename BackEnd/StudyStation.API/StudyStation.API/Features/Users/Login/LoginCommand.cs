using MediatR;
using System.ComponentModel.DataAnnotations;

namespace StudyStation.API.Features.Users.Login
{
    public class LoginCommand : IRequest<LoginResponse>
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
