using MediatR;
using Microsoft.AspNetCore.Identity;
using StudyStation.API.Data;
using StudyStation.API.Models;
using StudyStation.API.Services;

namespace StudyStation.API.Features.Users.Login
{
    public class LoginHandler : IRequestHandler<LoginCommand, LoginResponse>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JwtService _jwtService;
        private readonly DatabaseContext _context;

        public LoginHandler(UserManager<ApplicationUser> userManager, JwtService jwtService, DatabaseContext context)
        {
            _userManager = userManager;
            _jwtService = jwtService;
            _context = context;
        }

        public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            // 1. البحث عن المستخدم
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                throw new UnauthorizedAccessException("Invalid email or password.");
            }

            // 2. التحقق من كلمة المرور
            var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
            if (!passwordValid)
            {
                throw new UnauthorizedAccessException("Invalid email or password.");
            }

            // 3. (اختياري) التحقق مما إذا كان البريد الإلكتروني قد تم تفعيله
            // يمكنك إزالة هذا الشرط إذا كنت تريد السماح بتسجيل الدخول قبل تفعيل البريد
            //if (!user.EmailConfirmed)
            //{
            //    throw new UnauthorizedAccessException("Please verify your email before logging in.");
            //}

            // 4. إنشاء التوكينز
            var roles = await _userManager.GetRolesAsync(user);
            var accessToken = _jwtService.GenerateAccessToken(user, roles);
            var refreshToken = _jwtService.GenerateRefreshToken(user.Id);

            // 5. حفظ الـ Refresh Token في قاعدة البيانات
            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync(cancellationToken);

            // 6. إرجاع الرد
            return new LoginResponse
            {
                Message = "Login successful.",
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token
            };
        }
    }
}
