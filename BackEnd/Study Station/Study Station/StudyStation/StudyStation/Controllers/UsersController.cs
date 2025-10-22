using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using StudyStation.Data;
using StudyStation.Models;
using StudyStation.Services;

namespace StudyStation.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly DatabaseContext dbContext;
        private readonly PasswordHasher<ApplicationUser> passwordHasher;
        private readonly JwtService jwtService;
        private readonly IEmailService emailService;
        private readonly UserManager<ApplicationUser> userManager;
        private readonly SignInManager<ApplicationUser> signInManager;




        public UsersController(DatabaseContext dbContext, JwtService jwtService, IEmailService emailService, UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager)
        {
            this.dbContext = dbContext;
            passwordHasher = new PasswordHasher<ApplicationUser>();
            this.jwtService = jwtService;
            this.emailService = emailService;
            this.userManager = userManager;
            this.signInManager = signInManager;
        }



        [HttpPost]
        [Route("Registration")]
        public async Task<IActionResult> Registration([FromBody] UserDetails userDetails)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors)
                                              .Select(e => e.ErrorMessage)
                                              .ToList();
                return BadRequest(new { Errors = errors });
            }

            var age = DateTime.UtcNow.Year - userDetails.DateOfBirth.Year;
            if (userDetails.DateOfBirth.Date > DateTime.UtcNow.AddYears(-age)) age--;
            if (age < 12) return BadRequest("User must be at least 12 years old.");

            if (await userManager.FindByEmailAsync(userDetails.Email) != null)
                return BadRequest("Email already exists.");

            var user = new ApplicationUser
            {
                UserName = userDetails.Email,
                Email = userDetails.Email,
                FirstName = userDetails.FirstName,
                LastName = userDetails.LastName,
                DateOfBirth = userDetails.DateOfBirth,
                Gender = userDetails.Gender,
                CreatedOn = DateTime.UtcNow
            };

            var createResult = await userManager.CreateAsync(user, userDetails.Password);
            if (!createResult.Succeeded)
            {
                return BadRequest(new { Errors = createResult.Errors.Select(e => e.Description) });
            }

            return Ok(new
            {
                Message = "User registered successfully",
                user.FirstName,
                user.LastName,
                user.Email,
                user.Age,
                user.Gender
            });
        }
        /*  public IActionResult Registration(UserDetails userDetails)
          {
              if (!ModelState.IsValid)
              {
                  var errors = ModelState.Values.SelectMany(v => v.Errors)
                                                .Select(e => e.ErrorMessage)
                                                .ToList();
                  return BadRequest(new { Errors = errors });
              }

              var age = DateTime.Today.Year - userDetails.DateOfBirth.Year;
              if (userDetails.DateOfBirth.Date > DateTime.Today.AddYears(-age)) age--;
              if (age < 12)
              {
                  return BadRequest("User must be at least 12 years old.");
              }

              if (dbContext.Users.Any(u => u.Email == userDetails.Email))
                  return BadRequest("Email already exists.");

              var user = new User
              {
                  FirstName = userDetails.FirstName,
                  LastName = userDetails.LastName,
                  Email = userDetails.Email,
                  DateOfBirth = userDetails.DateOfBirth,
                  Gender = userDetails.Gender,
                  CreatedOn = DateTime.Now,
                  IsActive = 1
              };

              user.PasswordHash = passwordHasher.HashPassword(user, userDetails.Password);

              dbContext.Users.Add(user);
              dbContext.SaveChanges();

              return Ok(new
              {
                  Message = "User registered successfully",
                  user.FirstName,
                  user.LastName,
                  user.Email,
                  user.Age,
                  user.Gender
              });
          }
          */
        [HttpPost]
        [Route("Login")]

        public async Task<IActionResult> Login([FromBody] LoginDetail loginDetail)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var user = await userManager.FindByEmailAsync(loginDetail.Email);
            if (user == null) return Unauthorized("Invalid email or password.");

            var passwordValid = await userManager.CheckPasswordAsync(user, loginDetail.Password);
            if (!passwordValid) return Unauthorized("Invalid email or password.");

            var accessToken = jwtService.GenerateAccessToken(user);
            var refreshToken = jwtService.GenerateRefreshToken(user.Id);

            // Save refresh token in DB
            dbContext.RefreshTokens.Add(refreshToken);
            await dbContext.SaveChangesAsync();

            return Ok(new
            {
                Message = "Login successful",
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token,
                User = new
                {
                    user.Id,
                    user.FirstName,
                    user.LastName,
                    user.Email,
                    user.Age,
                    user.Gender
                }
            });
        }
        /* public IActionResult Login(LoginDetail loginDetail)
         {
             if (!ModelState.IsValid) return BadRequest(ModelState);

             var user = dbContext.Users.FirstOrDefault(u => u.Email == loginDetail.Email);
             if (user == null)
             {
                 return Unauthorized("Invalid email or password");
             }

             var result = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, loginDetail.Password);
             if (result == PasswordVerificationResult.Failed)
             {
                 return Unauthorized("Invalid email or password");
             }

             // توليد Access Token
             var accessToken = jwtService.GenerateAccessToken(user);

             // توليد Refresh Token جديد
             var refreshToken = jwtService.GenerateRefreshToken(user);

             // نخزن الـ RefreshToken في جدول RefreshTokens
             user.RefreshToken = refreshToken.Token;
             user.RefreshTokenExpiry = refreshToken.ExpiryDate;
             dbContext.SaveChanges();

             return Ok(new
             {
                 Message = "Login successful",
                 AccessToken = accessToken,
                 RefreshToken = refreshToken.Token,
                 User = new
                 {
                     user.UserId,
                     user.FirstName,
                     user.LastName,
                     user.Email,
                     user.Age,
                     user.Gender
                 }
             });
         }*/

        [HttpPost("RefreshToken")]

        public async Task<IActionResult> RefreshToken([FromBody] string refreshToken)
        {
            if (string.IsNullOrWhiteSpace(refreshToken)) return BadRequest("Refresh token is required.");

            var tokenEntity = await dbContext.RefreshTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

            if (tokenEntity == null || tokenEntity.ExpiryDate < DateTime.UtcNow)
                return Unauthorized("Invalid or expired refresh token.");

            var user = tokenEntity.User!;
            var newAccessToken = jwtService.GenerateAccessToken(user);
            var newRefreshToken = jwtService.GenerateRefreshToken(user.Id);

            // Optionally delete old token and store new one
            dbContext.RefreshTokens.Remove(tokenEntity);
            dbContext.RefreshTokens.Add(newRefreshToken);
            await dbContext.SaveChangesAsync();

            return Ok(new
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken.Token
            });
        }
        /*  public IActionResult RefreshToken(string refreshToken)
          {
              var user = dbContext.Users.FirstOrDefault(u => u.RefreshToken == refreshToken);
              if (user == null || user.RefreshTokenExpiry < DateTime.Now)
                  return Unauthorized("Invalid or expired refresh token.");

              var newAccessToken = jwtService.GenerateAccessToken(user);
              var newRefreshToken = jwtService.GenerateRefreshToken(user);

              user.RefreshToken = newRefreshToken.Token;
              user.RefreshTokenExpiry = newRefreshToken.ExpiryDate;
              dbContext.SaveChanges();

              return Ok(new
              {
                  AccessToken = newAccessToken,
                  RefreshToken = newRefreshToken.Token
              });
          }*/

        [HttpPost("ForgetPassword")]

        public async Task<IActionResult> ForgotPassword([FromBody] ForgetPassword forgetPassword)
        {
            if (!ModelState.IsValid) return BadRequest();

            var user = await userManager.FindByEmailAsync(forgetPassword.Email);
            if (user == null) return BadRequest("Invalid Request");

            var token = await userManager.GeneratePasswordResetTokenAsync(user);
            var param = new Dictionary<string, string?>
            {
                {"token", token },
                {"email", forgetPassword.Email! }
            };

            var callback = QueryHelpers.AddQueryString(forgetPassword.ClientURI!, param);

            // Send email with link to client
            await emailService.SendEmailAsync(user.Email!, "Reset password token", callback);

            return Ok(new { Message = "Reset password link sent to email if it exists." });
        }
        /*  public async Task<IActionResult> ForgotPassword([FromBody] ForgetPassword forgetPassword)
          {
              if (!ModelState.IsValid)
                  return BadRequest();

              var user = await userManager.FindByEmailAsync(forgetPassword.Email);
              if (user == null)
                  return BadRequest("Invaild Request");

              var token = await userManager.GeneratePasswordResetTokenAsync(user);
              var param = new Dictionary<string, string?>
              {
                  {"token", token },
                  {"email", forgetPassword.Email! }
              };

              var callback = QueryHelpers.AddQueryString(forgetPassword.ClientURI!, param);

              var message = new Messages(
                  new string[] { user.Email }, "Reset password token", callback);

              await emailService.SendEmailAsync(
                  user.Email,
                  "Reset password token",
                  callback
                  );
              return Ok();
          }*/

        [HttpGet]
        [Route("GetUsers")]
        [Authorize]

        public async Task<IActionResult> GetUsers()
        {
            var users = await dbContext.Users
                .Select(u => new { u.Id, u.FirstName, u.LastName, u.Email, u.Age, u.Gender })
                .ToListAsync();

            return Ok(users);
        }

        /*public IActionResult GetUsers()
        {
            var users = dbContext.Users.ToList();
            return Ok(users);

        }*/

        [HttpGet]
        public IActionResult EmailSent()
        {
            return view();
        }

        private IActionResult view()
        {
            throw new NotImplementedException();
        }

        [HttpGet]
        [Route("GetUser")]
        [Authorize]
        public async Task<IActionResult> GetUser([FromQuery] int id)
        {
            var user = await dbContext.Users
                .Where(x => x.Id == id)
                .Select(u => new { u.Id, u.FirstName, u.LastName, u.Email, u.Age, u.Gender })
                .FirstOrDefaultAsync();

            if (user == null) return NoContent();

            return Ok(user);
        }
        /*public IActionResult GetUser(int id)
        {
            var user = dbContext.Users.FirstOrDefault(x => x.UserId == id);
            if (user != null)
            {
                return Ok(user);
            }
            else
            {
                return NoContent();
            }


        }*/
    }
}
