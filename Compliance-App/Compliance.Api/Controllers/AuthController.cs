using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json;
using Compliance.Api.Data;
using Compliance.Api.DTOs;
using Compliance.Api.Models;
using Compliance.Api.Services;

namespace Compliance.Api.Controllers;

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

        // If user has GroupAdmin role in any tenant, add it as Identity role if not already present
        if (userTenants.Any(ut => ut.Role == "GroupAdmin") && !rolesList.Contains("GroupAdmin"))
        {
            await _userManager.AddToRoleAsync(user, "GroupAdmin");
            rolesList.Add("GroupAdmin");
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

        // If user has GroupAdmin role in any tenant, add it as Identity role if not already present
        if (userTenants.Any(ut => ut.Role == "GroupAdmin") && !rolesList.Contains("GroupAdmin"))
        {
            await _userManager.AddToRoleAsync(user, "GroupAdmin");
            rolesList.Add("GroupAdmin");
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

    [HttpPost("sso")]
    public async Task<IActionResult> SSO([FromBody] SSORequest request)
    {
        try
        {
            // Validate Keycloak token
            var handler = new JwtSecurityTokenHandler();
            
            if (!handler.CanReadToken(request.KeycloakToken))
            {
                return Unauthorized(new { message = "Invalid Keycloak token format" });
            }

            var token = handler.ReadJwtToken(request.KeycloakToken);
            
            // Extract user info from Keycloak token
            var email = token.Claims.FirstOrDefault(c => c.Type == "email" || c.Type == "preferred_username")?.Value;
            var keycloakUserId = token.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
            
            if (string.IsNullOrEmpty(email))
            {
                return Unauthorized(new { message = "Email not found in Keycloak token" });
            }

            // Query Platform API to get user's app links for Compliance app (if PlatformUser exists)
            var platformApiUrl = "http://localhost:5003/api";
            var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", request.KeycloakToken);
            
            // Get Platform User by Keycloak User ID or email
            PlatformUserInfo? platformUser = null;
            List<UserAppLinkInfo> appLinks = new();
            
            try
            {
                var platformUsersResponse = await httpClient.GetAsync($"{platformApiUrl}/platformusers");
                if (platformUsersResponse.IsSuccessStatusCode)
                {
                    var platformUsersJson = await platformUsersResponse.Content.ReadAsStringAsync();
                    var platformUsers = JsonSerializer.Deserialize<List<PlatformUserInfo>>(platformUsersJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    platformUser = platformUsers?.FirstOrDefault(u => 
                        u.KeycloakUserId == keycloakUserId || 
                        u.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
                    
                    // If PlatformUser exists, get their app links for Compliance app
                    if (platformUser != null)
                    {
                        try
                        {
                            var appLinksResponse = await httpClient.GetAsync($"{platformApiUrl}/userapplinks/user/{platformUser.Id}");
                            if (appLinksResponse.IsSuccessStatusCode)
                            {
                                var allLinksJson = await appLinksResponse.Content.ReadAsStringAsync();
                                var allLinks = JsonSerializer.Deserialize<List<UserAppLinkInfo>>(allLinksJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                                appLinks = allLinks?.Where(l => l.AppCode == "Compliance").ToList() ?? new();
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Warning: Could not query user app links: {ex.Message}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // Log but continue - Platform API might not be accessible or user might not exist in Platform yet
                Console.WriteLine($"Info: Platform user not found or Platform API not accessible: {ex.Message}. Continuing with SSO...");
            }

            // Find or create user in Compliance database
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                // Create new user from Keycloak token or Platform user info
                var firstName = platformUser?.FirstName ?? token.Claims.FirstOrDefault(c => c.Type == "given_name")?.Value ?? "User";
                var lastName = platformUser?.LastName ?? token.Claims.FirstOrDefault(c => c.Type == "family_name")?.Value ?? "";
                
                user = new ApplicationUser
                {
                    Email = email,
                    UserName = email,
                    FirstName = firstName,
                    LastName = lastName,
                    IsActive = true,
                    EmailConfirmed = true
                };
                
                var createResult = await _userManager.CreateAsync(user);
                if (!createResult.Succeeded)
                {
                    return BadRequest(new { message = "Failed to create user", errors = createResult.Errors });
                }

                // If we have app links from Platform, create tenant assignments
                if (appLinks.Any())
                {
                    foreach (var link in appLinks)
                    {
                        // Find or create tenant in Compliance database
                        var tenant = await _context.Tenants.FirstOrDefaultAsync(t => t.Code == link.TenantCode);
                        if (tenant == null)
                        {
                            // Create tenant if it doesn't exist
                            tenant = new Compliance.Api.Models.Tenant
                            {
                                Name = link.TenantName,
                                Code = link.TenantCode,
                                Description = $"Tenant from Platform: {link.TenantName}",
                                IsActive = true
                            };
                            _context.Tenants.Add(tenant);
                            await _context.SaveChangesAsync();
                        }

                        // Create user-tenant link with roles from Platform
                        var userTenant = new Compliance.Api.Models.UserTenant
                        {
                            UserId = user.Id, // IdentityUser.Id is a string
                            TenantId = tenant.Id,
                            Role = link.Roles.FirstOrDefault() ?? "User", // Use first role or default to User
                            IsActive = true
                        };
                        _context.UserTenants.Add(userTenant);
                    }
                    await _context.SaveChangesAsync();
                }
            }

            if (!user.IsActive)
            {
                return Unauthorized(new { message = "User is inactive" });
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

            // Generate Compliance token
            var complianceToken = _tokenService.GenerateToken(user, rolesList, tenantRoles);

            // Set token as HTTP-only cookie
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax,
                Expires = DateTime.UtcNow.AddHours(8),
                Path = "/"
            };

            Response.Cookies.Append("authToken", complianceToken, cookieOptions);

            var response = new LoginResponse
            {
                Token = complianceToken,
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
        catch (Exception ex)
        {
            return Unauthorized(new { message = "SSO authentication failed", error = ex.Message });
        }
    }

    // Helper classes for Platform API responses
    private class PlatformUserInfo
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? KeycloakUserId { get; set; }
    }

    private class UserAppLinkInfo
    {
        public Guid Id { get; set; }
        public Guid PlatformUserId { get; set; }
        public Guid TenantId { get; set; }
        public string TenantName { get; set; } = string.Empty;
        public string TenantCode { get; set; } = string.Empty;
        public string AppCode { get; set; } = string.Empty;
        public List<string> Roles { get; set; } = new();
        public bool IsActive { get; set; }
    }

    [HttpPost("logout")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("authToken");
        return Ok(new { message = "Logged out successfully" });
    }
}

public class SSORequest
{
    public string KeycloakToken { get; set; } = string.Empty;
}

