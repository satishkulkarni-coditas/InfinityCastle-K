using Microsoft.AspNetCore.Authorization;

namespace Compliance.Api.Authorization;

public class GroupAdminOrAppAdminRequirement : IAuthorizationRequirement
{
}

