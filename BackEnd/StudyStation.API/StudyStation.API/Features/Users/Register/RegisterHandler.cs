using MediatR;
using Microsoft.AspNetCore.Identity;
using StudyStation.API.Models;
using StudyStation.API.Services; // <-- إضافة مهمة

namespace StudyStation.API.Features.Users.Register
{
    public class RegisterHandler : IRequestHandler<RegisterCommand, RegisterResponse>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEmailService _emailService; // <-- إضافة خدمة البريد الإلكتروني

        // تحديث الـ Constructor ليقوم باستقبال الخدمة الجديدة
        public RegisterHandler(UserManager<ApplicationUser> userManager, IEmailService emailService)
        {
            _userManager = userManager;
            _emailService = emailService;
        }

        public async Task<RegisterResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
        {
            // 1. التحقق مما إذا كان البريد الإلكتروني موجوداً بالفعل
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                throw new Exception("Email already exists.");
            }

            // 2. إنشاء كائن المستخدم الجديد
            var user = new ApplicationUser
            {
                UserName = request.Email,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                DateOfBirth = request.DateOfBirth,
                Gender = request.Gender,
                CreatedOn = DateTime.UtcNow
            };

            // 3. إنشاء المستخدم في قاعدة البيانات مع كلمة المرور
            var result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"User creation failed: {errors}");
            }

            // --- الجزء الجديد: توليد وإرسال OTP ---

            // 4. توليد كود OTP
            var otpCode = new Random().Next(100000, 999999).ToString(); // كود من 6 أرقام
            user.OtpCode = otpCode;
            user.OtpExpiryDate = DateTime.UtcNow.AddMinutes(10); // صلاحية الكود 10 دقائق

            // 5. تحديث المستخدم في قاعدة البيانات لحفظ الـ OTP
            await _userManager.UpdateAsync(user);

            // 6. إرسال البريد الإلكتروني
            var emailSubject = "Your OTP Code for StudyStation";
            var emailBody = $"<p>Welcome to StudyStation!</p>" +
                            $"<p>Your One-Time Password (OTP) is: <strong>{otpCode}</strong></p>" +
                            $"<p>This code is valid for 10 minutes.</p>";

            await _emailService.SendEmailAsync(user.Email, emailSubject, emailBody);

            // --- نهاية الجزء الجديد ---

            // 7. إعداد وإعادة الاستجابة الناجحة
            return new RegisterResponse
            {
                UserId = user.Id,
                Email = user.Email,
                Message = "User registered successfully. An OTP has been sent to your email." // تحديث الرسالة
            };
        }
    }
}
