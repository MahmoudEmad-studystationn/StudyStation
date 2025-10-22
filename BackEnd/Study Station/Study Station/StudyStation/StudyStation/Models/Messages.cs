namespace StudyStation.Models
{
    public class Messages
    {
        public string[] To { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }

        public Messages(string[] to, string subject, string body)
        {
            To = to;
            Subject = subject;
            Body = body;
        }

    }

}