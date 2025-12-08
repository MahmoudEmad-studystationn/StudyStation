namespace StudyStation.API.Features.Users.Login
{
    public class LoginResponse
    {
        public string Message { get; set; } = string.Empty;
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }
}
