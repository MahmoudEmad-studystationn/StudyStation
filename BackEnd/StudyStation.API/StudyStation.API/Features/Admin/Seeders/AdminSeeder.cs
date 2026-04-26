using Microsoft.AspNetCore.Identity;
using StudyStation.API.Models;

namespace StudyStation.API.Features.Admin.Seeders
{
    public static class AdminSeeder
    {
        public static async Task SeedAdminAsync(IServiceProvider serviceProvider)
        {
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

            string[] roleNames = { "Admin", "User", "Moderator" };

            foreach (var roleName in roleNames)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    await roleManager.CreateAsync(new IdentityRole<int>(roleName));
                }
            }

            string adminEmail = "admin@studystation.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);

            if (adminUser == null)
            {
                adminUser = new ApplicationUser
                {
                    UserName = "admin",
                    Email = adminEmail,
                    FirstName = "System",
                    LastName = "Admin",
                    EmailConfirmed = true,
                    DateOfBirth = new DateTime(2000, 1, 1).ToUniversalTime(),
                    Gender = "Other",
                    Track = "Administration",
                    AcademicYear = "N/A"
                };

                var result = await userManager.CreateAsync(adminUser, "Admin@12345");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                }
            }
        }
    }
}
