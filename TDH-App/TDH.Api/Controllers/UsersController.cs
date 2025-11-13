using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TDH.Api.Data;
using TDH.Api.DTOs;
using TDH.Api.Models;

namespace TDH.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ApplicationDbContext _context;

    public UsersController(UserManager<ApplicationUser> userManager, ApplicationDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    [HttpGet]
    [Authorize(Policy = "AdminOrEntityAdmin")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userManager.Users
            .Where(u => u.IsActive)
            .ToListAsync();

        var result = new List<object>();
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var userTenants = await _context.UserTenants
                .Where(ut => ut.UserId == user.Id && ut.IsActive)
                .Include(ut => ut.Tenant)
                .ToListAsync();

            result.Add(new
            {
                user.Id,
                user.Email,
                user.FirstName,
                user.LastName,
                user.CreatedDate,
                Roles = roles.ToList(),
                Tenants = userTenants.Select(ut => new
                {
                    ut.TenantId,
                    TenantName = ut.Tenant.Name,
                    TenantCode = ut.Tenant.Code,
                    ut.Role
                }).ToList()
            });
        }

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null || !user.IsActive)
        {
            return NotFound();
        }

        var roles = await _userManager.GetRolesAsync(user);
        var userTenants = await _context.UserTenants
            .Where(ut => ut.UserId == id && ut.IsActive)
            .Include(ut => ut.Tenant)
            .ToListAsync();

        return Ok(new
        {
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.CreatedDate,
            Roles = roles,
            Tenants = userTenants.Select(ut => new
            {
                ut.TenantId,
                TenantName = ut.Tenant.Name,
                ut.Role
            })
        });
    }

    [HttpPost]
    [Authorize(Policy = "AdminOrEntityAdmin")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        if (await _userManager.FindByEmailAsync(request.Email) != null)
        {
            return BadRequest(new { message = "User with this email already exists" });
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            IsActive = true
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new { message = "Failed to create user", errors = result.Errors });
        }

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, new
        {
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName
        });
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOrEntityAdmin")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserRequest request)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null || !user.IsActive)
        {
            return NotFound(new { message = "User not found" });
        }

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest(new { message = "Failed to update user", errors = result.Errors });
        }

        // Update password if provided
        if (!string.IsNullOrEmpty(request.Password))
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var passwordResult = await _userManager.ResetPasswordAsync(user, token, request.Password);
            if (!passwordResult.Succeeded)
            {
                return BadRequest(new { message = "Failed to update password", errors = passwordResult.Errors });
            }
        }

        return Ok(new
        {
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName
        });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        user.IsActive = false;
        await _userManager.UpdateAsync(user);

        return NoContent();
    }
}

