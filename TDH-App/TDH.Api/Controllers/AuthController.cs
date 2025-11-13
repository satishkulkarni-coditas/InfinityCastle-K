using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TDH.Api.Data;
using TDH.Api.DTOs;
using TDH.Api.Models;
using TDH.Api.Services;

namespace TDH.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ApplicationDbContext _context;
    private readonly ITokenService _tokenService;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ApplicationDbContext context,
        ITokenService tokenService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _context = context;
        _tokenService = tokenService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null || !user.IsActive)
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: false);
        if (!result.Succeeded)
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }

        // Get user roles
        var roles = await _userManager.GetRolesAsync(user);
        var rolesList = roles.ToList();

        // Get user tenants with roles
        var userTenants = await _context.UserTenants
            .Where(ut => ut.UserId == user.Id && ut.IsActive)
            .Include(ut => ut.Tenant)
            .ToListAsync();

        var tenantRoles = userTenants.Select(ut => (ut.TenantId, ut.Role)).ToList();

        // If user has EntityAdmin role in any tenant, add it as Identity role if not already present
        if (userTenants.Any(ut => ut.Role == "EntityAdmin") && !rolesList.Contains("EntityAdmin"))
        {
            await _userManager.AddToRoleAsync(user, "EntityAdmin");
            rolesList.Add("EntityAdmin");
        }

        // Generate token
        var token = _tokenService.GenerateToken(user, rolesList, tenantRoles);

        // Set token as HTTP-only cookie
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = false, // Set to false for local development (HTTP)
            SameSite = SameSiteMode.Lax, // Use Lax for localhost (works better than None)
            Expires = DateTime.UtcNow.AddHours(8),
            Path = "/" // Ensure cookie is available for all paths
        };

        Response.Cookies.Append("authToken", token, cookieOptions);

        var response = new LoginResponse
        {
            Token = token,
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = $"{user.FirstName} {user.LastName}",
            Roles = rolesList,
            Tenants = userTenants.Select(ut => new TenantInfo
            {
                Id = ut.TenantId,
                Name = ut.Tenant.Name,
                Code = ut.Tenant.Code,
                Role = ut.Role
            }).ToList()
        };

        return Ok(response);
    }

    [HttpGet("me")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null || !user.IsActive)
        {
            return Unauthorized(new { message = "User not found or inactive" });
        }

        // Get user roles
        var roles = await _userManager.GetRolesAsync(user);
        var rolesList = roles.ToList();

        // Get user tenants with roles
        var userTenants = await _context.UserTenants
            .Where(ut => ut.UserId == user.Id && ut.IsActive)
            .Include(ut => ut.Tenant)
            .ToListAsync();

        // If user has EntityAdmin role in any tenant, add it as Identity role if not already present
        if (userTenants.Any(ut => ut.Role == "EntityAdmin") && !rolesList.Contains("EntityAdmin"))
        {
            await _userManager.AddToRoleAsync(user, "EntityAdmin");
            rolesList.Add("EntityAdmin");
        }

        var response = new LoginResponse
        {
            Token = string.Empty, // Don't send token back, it's in cookie
            UserId = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = $"{user.FirstName} {user.LastName}",
            Roles = rolesList,
            Tenants = userTenants.Select(ut => new TenantInfo
            {
                Id = ut.TenantId,
                Name = ut.Tenant.Name,
                Code = ut.Tenant.Code,
                Role = ut.Role
            }).ToList()
        };

        return Ok(response);
    }

    [HttpPost("logout")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("authToken");
        return Ok(new { message = "Logged out successfully" });
    }
}

