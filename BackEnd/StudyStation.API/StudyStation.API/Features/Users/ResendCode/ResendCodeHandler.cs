using MediatR;
using Microsoft.AspNetCore.Identity;
using StudyStation.API.Models;
using StudyStation.API.Services;

namespace StudyStation.API.Features.Users.ResendCode
{
    public class ResendCodeHandler : IRequestHandler<ResendCodeCommand, string>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEmailService _emailService;

        public ResendCodeHandler(UserManager<ApplicationUser> userManager, IEmailService emailService)
        {
            _userManager = userManager;
            _emailService = emailService;
        }

        public async Task<string> Handle(ResendCodeCommand request, CancellationToken cancellationToken)
        {
            // 1. البحث عن المستخدم
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                // لأسباب أمنية، لا نكشف ما إذا كان البريد الإلكتروني موجوداً أم لا
                return "If a user with this email exists, a new code has been sent.";
            }

            // 2. إنشاء كود OTP جديد
            var otp = new Random().Next(100000, 999999).ToString();
            var expiryDate = DateTime.UtcNow.AddMinutes(10); // صالح لمدة 10 دقائق

            // 3. تحديد نوع الكود وتحديث المستخدم
            switch (request.CodeType.ToLower())
            {
                case "verifyemail":
                    if (user.EmailConfirmed)
                    {
                        return "This email is already verified.";
                    }
                    user.EmailVerificationCode = otp;
                    user.EmailVerificationCodeExpiry = expiryDate;
                    await _emailService.SendEmailAsync(user.Email, "Your New Verification Code", $"Your new verification code is: {otp}");
                    break;

                case "resetpassword":
                    user.PasswordResetCode = otp;
                    user.PasswordResetCodeExpiry = expiryDate;
                    await _emailService.SendEmailAsync(user.Email, "Your New Password Reset Code", $"Your new password reset code is: {otp}");
                    break;

                default:
                    throw new InvalidOperationException("Invalid code type specified.");
            }

            // 4. حفظ التغييرات في قاعدة البيانات
            await _userManager.UpdateAsync(user);

            return "If a user with this email exists, a new code has been sent.";
        }
    }
}
