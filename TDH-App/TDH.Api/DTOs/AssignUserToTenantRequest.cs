using System.ComponentModel.DataAnnotations;

namespace TDH.Api.DTOs;

public class AssignUserToTenantRequest
{
    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    public Guid TenantId { get; set; }

    [Required]
    public string Role { get; set; } = "User"; // Admin, EntityAdmin, User
}

