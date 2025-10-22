
using StudyStation.Models;
using System.Net;
using System.Net.Mail;

namespace StudyStation.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _emailSettings;
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _emailSettings = new EmailSettings();
            _configuration = configuration;
        }
        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            //var from = _configuration["EmailSettings:From"];
            var from = _emailSettings.SenderEmail;
            /*var smtpServer = _configuration["EmailSettings:SmtpServer"];
            var port = int.Parse(_configuration["EmailSettings:Port"]!);
            var username = _configuration["EmailSettings:Username"];
            var password = _configuration["EmailSettings:Password"];*/
            var smtpServer = _emailSettings.SmtpServer;
            var port = _emailSettings.Port;
            var username = _emailSettings.SenderEmail;
            var password = _emailSettings.SenderPassword;

            var message = new MailMessage(from, toEmail, subject, body);
            message.IsBodyHtml = true;
            message.From = new MailAddress(from, _emailSettings.SenderName);


            using var client = new SmtpClient(smtpServer, port)
            {
                Credentials = new NetworkCredential(username, password),
                EnableSsl = true
            };
            await client.SendMailAsync(message);
        }
    }
}
