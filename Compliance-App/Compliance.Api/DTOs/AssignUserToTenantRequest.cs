using System.ComponentModel.DataAnnotations;

namespace Compliance.Api.DTOs;

public class AssignUserToTenantRequest
{
    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    public Guid TenantId { get; set; }

    [Required]
    public string Role { get; set; } = "User"; // AppAdmin, GroupAdmin, User
}

