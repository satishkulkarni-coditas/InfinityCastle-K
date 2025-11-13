namespace TDH.Api.Models;

public class UserTenant
{
    public string UserId { get; set; } = string.Empty;
    public Guid TenantId { get; set; }
    public string Role { get; set; } = "User"; // Admin, EntityAdmin, User
    public DateTime AssignedDate { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public virtual ApplicationUser User { get; set; } = null!;
    public virtual Tenant Tenant { get; set; } = null!;
}

