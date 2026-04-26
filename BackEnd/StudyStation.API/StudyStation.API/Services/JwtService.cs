using Microsoft.IdentityModel.Tokens;
using StudyStation.API.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace StudyStation.API.Services
{
    public class JwtService
    {
        private readonly IConfiguration _configuration;

        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateAccessToken(ApplicationUser user, IList<string> roles)
        {
            var key = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt Key not configured");
            var issuer = _configuration["Jwt:Issuer"];
            var audience = _configuration["Jwt:Audience"];

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
               new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
               new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
               new Claim(JwtRegisteredClaimNames.GivenName, user.FirstName),
               new Claim(JwtRegisteredClaimNames.FamilyName, user.LastName),
               new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15), // مدة صلاحية قصيرة
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public RefreshToken GenerateRefreshToken(int userId)
        {
            return new RefreshToken
            {
                Token = Convert.ToBase64String(Guid.NewGuid().ToByteArray()),
                ExpiryDate = DateTime.UtcNow.AddDays(7),
                UserId = userId
            };
        }
    }
}
