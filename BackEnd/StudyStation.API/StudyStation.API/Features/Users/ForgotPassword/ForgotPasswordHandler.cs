using MediatR;
using Microsoft.AspNetCore.Identity;
using StudyStation.API.Models;
using StudyStation.API.Services;
using System.Security.Cryptography;
using System.Text;

namespace StudyStation.API.Features.Users.ForgotPassword
{
    public class ForgotPasswordHandler : IRequestHandler<ForgotPasswordCommand, ForgotPasswordResponse>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEmailService _emailService;

        public ForgotPasswordHandler(UserManager<ApplicationUser> userManager, IEmailService emailService)
        {
            _userManager = userManager;
            _emailService = emailService;
        }

        public async Task<ForgotPasswordResponse> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
        {
            // 1. البحث عن المستخدم
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                // ملاحظة أمنية: لا تخبر المهاجم أن البريد الإلكتروني غير موجود.
                // أعد دائماً رسالة نجاح وهمية.
                return new ForgotPasswordResponse { Message = "If an account with this email exists, an OTP has been sent." };
            }

            // ✅ مسح أي OTP قديم قبل توليد جديد
            user.OtpCodeHash = null;
            user.OtpExpiryDate = null;

            // 2. توليد كود OTP جديد
            //var otpCode = new Random().Next(100000, 999999).ToString();
            //user.OtpCode = otpCode;
            //user.OtpExpiryDate = DateTime.UtcNow.AddMinutes(10); // صلاحية الكود 10 دقائق

            var otpCode = RandomNumberGenerator.GetInt32(100000, 999999).ToString();

            var hash = Convert.ToBase64String(
                SHA256.HashData(Encoding.UTF8.GetBytes(otpCode))
            );

            user.OtpCodeHash = hash;
            user.OtpExpiryDate = DateTime.UtcNow.AddMinutes(10);

            // 3. تحديث المستخدم في قاعدة البيانات
            await _userManager.UpdateAsync(user);

            // 4. إرسال البريد الإلكتروني
            var emailSubject = "Your Password Reset OTP";
            var emailBody = $"<p>You requested a password reset.</p>" +
                            $"<p>Your One-Time Password (OTP) is: <strong>{otpCode}</strong></p>" +
                            $"<p>This code is valid for 10 minutes.</p>";

            // الكود الجديد والأكثر أماناً
            if (!string.IsNullOrEmpty(user.Email))
            {
                await _emailService.SendEmailAsync(user.Email, emailSubject, emailBody);
            }


            return new ForgotPasswordResponse { Message = "If an account with this email exists, an OTP has been sent." };
        }
    }
}
