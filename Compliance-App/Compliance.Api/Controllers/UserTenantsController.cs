using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Compliance.Api.Data;
using Compliance.Api.DTOs;
using Compliance.Api.Models;

namespace Compliance.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserTenantsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public UserTenantsController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    [HttpPost("assign")]
    [Authorize(Roles = "AppAdmin")]
    public async Task<IActionResult> AssignUserToTenant([FromBody] AssignUserToTenantRequest request)
    {
        // Validate role
        var validRoles = new[] { "AppAdmin", "GroupAdmin", "User" };
        if (!validRoles.Contains(request.Role))
        {
            return BadRequest(new { message = "Invalid role. Must be AppAdmin, GroupAdmin, or User" });
        }

        // Check if assignment already exists
        var existing = await _context.UserTenants
            .FirstOrDefaultAsync(ut => ut.UserId == request.UserId && ut.TenantId == request.TenantId);

        if (existing != null)
        {
            if (existing.IsActive)
            {
                // Update role if already assigned
                existing.Role = request.Role;
            }
            else
            {
                // Reactivate assignment
                existing.IsActive = true;
                existing.Role = request.Role;
                existing.AssignedDate = DateTime.UtcNow;
            }
        }
        else
        {
            // Create new assignment
            var userTenant = new UserTenant
            {
                UserId = request.UserId,
                TenantId = request.TenantId,
                Role = request.Role,
                IsActive = true
            };

            _context.UserTenants.Add(userTenant);
        }

        await _context.SaveChangesAsync();

        // If GroupAdmin role is assigned, also add it as an Identity role if not already present
        if (request.Role == "GroupAdmin")
        {
            var user = await _userManager.FindByIdAsync(request.UserId);
            if (user != null)
            {
                var userRoles = await _userManager.GetRolesAsync(user);
                if (!userRoles.Contains("GroupAdmin"))
                {
                    await _userManager.AddToRoleAsync(user, "GroupAdmin");
                }
            }
        }

        return Ok(new { message = "User assigned to tenant successfully" });
    }

    [HttpPost("unassign")]
    [Authorize(Roles = "AppAdmin")]
    public async Task<IActionResult> UnassignUserFromTenant([FromBody] AssignUserToTenantRequest request)
    {
        var userTenant = await _context.UserTenants
            .FirstOrDefaultAsync(ut => ut.UserId == request.UserId && ut.TenantId == request.TenantId);

        if (userTenant == null)
        {
            return NotFound();
        }

        userTenant.IsActive = false;
        await _context.SaveChangesAsync();

        return Ok(new { message = "User unassigned from tenant successfully" });
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserTenants(string userId)
    {
        var userTenants = await _context.UserTenants
            .Where(ut => ut.UserId == userId && ut.IsActive)
            .Include(ut => ut.Tenant)
            .Select(ut => new
            {
                ut.TenantId,
                TenantName = ut.Tenant.Name,
                TenantCode = ut.Tenant.Code,
                ut.Role,
                ut.AssignedDate
            })
            .ToListAsync();

        return Ok(userTenants);
    }

    [HttpGet("tenant/{tenantId}")]
    public async Task<IActionResult> GetTenantUsers(Guid tenantId)
    {
        var userTenants = await _context.UserTenants
            .Where(ut => ut.TenantId == tenantId && ut.IsActive)
            .Include(ut => ut.User)
            .Select(ut => new
            {
                ut.UserId,
                ut.User.Email,
                ut.User.FirstName,
                ut.User.LastName,
                ut.Role,
                ut.AssignedDate
            })
            .ToListAsync();

        return Ok(userTenants);
    }
}

