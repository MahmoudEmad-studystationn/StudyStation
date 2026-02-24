using MediatR;
using Microsoft.AspNetCore.Identity;
using StudyStation.API.Models;
using StudyStation.API.Services;
using StudyStation.API.Data;
using StudyStation.API.Features.Auth.DTOs;

namespace StudyStation.API.Features.Auth.Commands
{
    public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResponseDto>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JwtService _jwtService;
        private readonly DatabaseContext _context;

        public LoginCommandHandler(
            UserManager<ApplicationUser> userManager,
            JwtService jwtService,
            DatabaseContext context)
        {
            _userManager = userManager;
            _jwtService = jwtService;
            _context = context;
        }

        public async Task<LoginResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);

            if (user == null)
                throw new Exception("Invalid email or password");

            if (!user.EmailConfirmed)
                throw new Exception("Email not confirmed");

            var isValidPassword = await _userManager.CheckPasswordAsync(user, request.Password);

            if (!isValidPassword)
                throw new Exception("Invalid email or password");

            var accessToken = _jwtService.GenerateAccessToken(user);
            var refreshToken = _jwtService.GenerateRefreshToken(user.Id);

            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync(cancellationToken);

            return new LoginResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token
            };
        }
    }
}