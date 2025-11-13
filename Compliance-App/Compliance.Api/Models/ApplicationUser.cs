using Microsoft.AspNetCore.Identity;

namespace Compliance.Api.Models;

public class ApplicationUser : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public virtual ICollection<UserTenant> UserTenants { get; set; } = new List<UserTenant>();
}

