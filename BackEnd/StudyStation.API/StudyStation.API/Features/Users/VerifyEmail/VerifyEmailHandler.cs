using MediatR;
using Microsoft.AspNetCore.Identity;
using StudyStation.API.Models;

namespace StudyStation.API.Features.Users.VerifyEmail
{
    public class VerifyEmailHandler : IRequestHandler<VerifyEmailCommand, string>
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public VerifyEmailHandler(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<string> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
        {
            // 1. البحث عن المستخدم
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                throw new KeyNotFoundException("User not found.");
            }

            // 2. التحقق من أن البريد الإلكتروني لم يتم تأكيده بالفعل
            if (user.EmailConfirmed)
            {
                return "Email is already verified.";
            }

            // 3. التحقق من صحة الكود
            // ملاحظة: Identity لا يوفر طريقة مباشرة للتحقق من OTP.
            // سنقوم بمقارنة الكود وتاريخ انتهاء صلاحيته يدوياً.
            if (user.EmailVerificationCode != request.Code)
            {
                throw new InvalidOperationException("Invalid verification code.");
            }

            if (user.EmailVerificationCodeExpiry < DateTime.UtcNow)
            {
                throw new InvalidOperationException("Verification code has expired.");
            }

            // 4. تحديث حالة المستخدم
            user.EmailConfirmed = true;
            user.EmailVerificationCode = null; // مسح الكود بعد استخدامه
            user.EmailVerificationCodeExpiry = null;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                throw new Exception("Failed to verify email. Please try again.");
            }

            return "Email verified successfully. You can now log in.";
        }
    }
}
