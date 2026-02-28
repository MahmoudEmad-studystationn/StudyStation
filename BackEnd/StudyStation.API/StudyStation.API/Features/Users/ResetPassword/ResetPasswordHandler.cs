using MediatR;
using Microsoft.AspNetCore.Identity;
using StudyStation.API.Models;
using System.Security.Cryptography;
using System.Text;

namespace StudyStation.API.Features.Users.ResetPassword
{
    public class ResetPasswordHandler : IRequestHandler<ResetPasswordCommand, string>
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public ResetPasswordHandler(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<string> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
        {
            // 1. البحث عن المستخدم
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                // لا نكشف ما إذا كان المستخدم موجوداً أم لا لأسباب أمنية
                throw new InvalidOperationException("Invalid request.");
            }

            // 2. التحقق من صحة الكود
            // ملاحظة: Identity يستخدم توكن خاص به لإعادة تعيين كلمة المرور،
            // لكننا سنستخدم الـ OTP الذي قمنا بتخزينه يدوياً.
            // if (user.PasswordResetCode != request.Code || user.PasswordResetCodeExpiry < DateTime.UtcNow)
            //{
            //    throw new InvalidOperationException("Invalid or expired password reset code.");
            // }

            var incomingHash = Convert.ToBase64String(
                SHA256.HashData(Encoding.UTF8.GetBytes(request.Code))
            );

            if (user.OtpCodeHash == null ||
                user.OtpExpiryDate == null ||
                user.OtpCodeHash != incomingHash ||
                user.OtpExpiryDate < DateTime.UtcNow)
            {
                throw new InvalidOperationException("Invalid or expired password reset code.");
            }


            // 3. إعادة تعيين كلمة المرور
            // أولاً، نحتاج إلى توكن إعادة التعيين الخاص بـ Identity
            var identityToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, identityToken, request.NewPassword);

            if (!result.Succeeded)
            {
                // جمع الأخطاء وعرضها
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Failed to reset password: {errors}");
            }

            // 4. مسح كود الـ OTP بعد استخدامه
            // user.PasswordResetCode = null;
            // user.PasswordResetCodeExpiry = null;
            user.OtpCodeHash = null;
            user.OtpExpiryDate = null;

            await _userManager.UpdateAsync(user);

            return "Password has been reset successfully.";
        }
    }
}
