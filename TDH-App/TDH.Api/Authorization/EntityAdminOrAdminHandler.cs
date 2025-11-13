using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace TDH.Api.Authorization;

public class EntityAdminOrAdminHandler : AuthorizationHandler<EntityAdminOrAdminRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        EntityAdminOrAdminRequirement requirement)
    {
        // Check if user has Admin role
        if (context.User.IsInRole("Admin"))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // Check if user has EntityAdmin role
        if (context.User.IsInRole("EntityAdmin"))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // Check tenant roles from claims (format: "TenantId:Role")
        var tenantRoleClaims = context.User.FindAll("TenantRole");
        foreach (var claim in tenantRoleClaims)
        {
            var parts = claim.Value.Split(':');
            if (parts.Length == 2 && parts[1] == "EntityAdmin")
            {
                context.Succeed(requirement);
                return Task.CompletedTask;
            }
        }

        return Task.CompletedTask;
    }
}

