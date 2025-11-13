using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Compliance.Api.Authorization;

public class GroupAdminOrAppAdminHandler : AuthorizationHandler<GroupAdminOrAppAdminRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        GroupAdminOrAppAdminRequirement requirement)
    {
        // Check if user has AppAdmin role
        if (context.User.IsInRole("AppAdmin"))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // Check if user has GroupAdmin role
        if (context.User.IsInRole("GroupAdmin"))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // Check tenant roles from claims (format: "TenantId:Role")
        var tenantRoleClaims = context.User.FindAll("TenantRole");
        foreach (var claim in tenantRoleClaims)
        {
            var parts = claim.Value.Split(':');
            if (parts.Length == 2 && parts[1] == "GroupAdmin")
            {
                context.Succeed(requirement);
                return Task.CompletedTask;
            }
        }

        return Task.CompletedTask;
    }
}

