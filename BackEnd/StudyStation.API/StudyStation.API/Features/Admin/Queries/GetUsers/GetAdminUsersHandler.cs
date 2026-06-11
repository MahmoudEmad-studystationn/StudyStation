using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StudyStation.API.Features.Admin.DTOs;
using StudyStation.API.Models;

namespace StudyStation.API.Features.Admin.Queries.GetUsers
{
    public class GetAdminUsersHandler : IRequestHandler<GetAdminUsersQuery, List<AdminUserDto>>
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public GetAdminUsersHandler(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<List<AdminUserDto>> Handle(GetAdminUsersQuery request, CancellationToken cancellationToken)
        {
            var usersQuery = _userManager.Users.AsQueryable();

            // Apply search filter
            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                var search = request.Search.ToLower();
                usersQuery = usersQuery.Where(u =>
                    u.FirstName.ToLower().Contains(search) ||
                    u.LastName.ToLower().Contains(search) ||
                    u.Email!.ToLower().Contains(search));
            }

            var users = await usersQuery.ToListAsync(cancellationToken);

            var result = new List<AdminUserDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                var primaryRole = roles.FirstOrDefault() ?? "User";

                // Determine status using Identity's built-in LockoutEnd
                var status = user.LockoutEnd.HasValue && user.LockoutEnd > DateTimeOffset.UtcNow
                    ? "Suspended"
                    : "Active";

                result.Add(new AdminUserDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email ?? string.Empty,
                    Role = primaryRole,
                    Status = status
                });
            }

            return result;
        }
    }
}
