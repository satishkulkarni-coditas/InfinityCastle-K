using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Compliance.Api.Data;
using Compliance.Api.DTOs;
using Compliance.Api.Models;

namespace Compliance.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TenantsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TenantsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllTenants()
    {
        var tenants = await _context.Tenants
            .Where(t => t.IsActive)
            .Select(t => new
            {
                t.Id,
                t.Name,
                t.Code,
                t.Description,
                t.CreatedDate,
                UserCount = _context.UserTenants.Count(ut => ut.TenantId == t.Id && ut.IsActive)
            })
            .ToListAsync();

        return Ok(tenants);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTenant(Guid id)
    {
        var tenant = await _context.Tenants
            .Include(t => t.UserTenants)
                .ThenInclude(ut => ut.User)
            .FirstOrDefaultAsync(t => t.Id == id && t.IsActive);

        if (tenant == null)
        {
            return NotFound();
        }

        return Ok(new
        {
            tenant.Id,
            tenant.Name,
            tenant.Code,
            tenant.Description,
            tenant.CreatedDate,
            Users = tenant.UserTenants
                .Where(ut => ut.IsActive)
                .Select(ut => new
                {
                    ut.UserId,
                    ut.User.Email,
                    ut.User.FirstName,
                    ut.User.LastName,
                    ut.Role
                })
        });
    }

    [HttpPost]
    [Authorize(Roles = "AppAdmin")]
    public async Task<IActionResult> CreateTenant([FromBody] CreateTenantRequest request)
    {
        if (await _context.Tenants.AnyAsync(t => t.Code == request.Code))
        {
            return BadRequest(new { message = "Tenant with this code already exists" });
        }

        var tenant = new Tenant
        {
            Name = request.Name,
            Code = request.Code,
            Description = request.Description,
            IsActive = true
        };

        _context.Tenants.Add(tenant);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTenant), new { id = tenant.Id }, new
        {
            tenant.Id,
            tenant.Name,
            tenant.Code,
            tenant.Description
        });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "AppAdmin")]
    public async Task<IActionResult> UpdateTenant(Guid id, [FromBody] CreateTenantRequest request)
    {
        var tenant = await _context.Tenants.FindAsync(id);
        if (tenant == null || !tenant.IsActive)
        {
            return NotFound();
        }

        tenant.Name = request.Name;
        tenant.Description = request.Description;
        tenant.ModifiedDate = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            tenant.Id,
            tenant.Name,
            tenant.Code,
            tenant.Description
        });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "AppAdmin")]
    public async Task<IActionResult> DeleteTenant(Guid id)
    {
        var tenant = await _context.Tenants.FindAsync(id);
        if (tenant == null)
        {
            return NotFound();
        }

        tenant.IsActive = false;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

