using MediatR;
using System.ComponentModel.DataAnnotations;

namespace StudyStation.API.Features.Users.ForgotPassword
{
    public class ForgotPasswordCommand : IRequest<ForgotPasswordResponse>
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}
