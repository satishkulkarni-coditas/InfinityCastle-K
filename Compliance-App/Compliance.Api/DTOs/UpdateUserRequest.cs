using System.ComponentModel.DataAnnotations;

namespace Compliance.Api.DTOs;

public class UpdateUserRequest
{
    [Required]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    public string LastName { get; set; } = string.Empty;

    public string? Password { get; set; }
}

