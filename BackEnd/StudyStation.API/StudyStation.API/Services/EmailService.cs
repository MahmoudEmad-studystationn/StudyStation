using System.Net;
using System.Net.Mail;

namespace StudyStation.API.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        // سنستخدم IConfiguration للوصول إلى الإعدادات بشكل آمن لاحقاً
        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            // من الأفضل استخدام user-secrets لتخزين هذه البيانات في بيئة التطوير
            var fromEmail = _configuration["EmailSettings:SenderEmail"];
            var fromName = _configuration["EmailSettings:SenderName"];
            var smtpServer = _configuration["EmailSettings:SmtpServer"];
            var port = int.Parse(_configuration["EmailSettings:Port"]!);
            var password = _configuration["EmailSettings:SenderPassword"];

            var message = new MailMessage(fromEmail, toEmail, subject, body)
            {
                IsBodyHtml = true,
                From = new MailAddress(fromEmail, fromName)
            };

            using var client = new SmtpClient(smtpServer, port)
            {
               // UseDefaultCredentials = false,
                Credentials = new NetworkCredential(fromEmail, password),
                EnableSsl = true
            };

            await client.SendMailAsync(message);
        }
    }
}
