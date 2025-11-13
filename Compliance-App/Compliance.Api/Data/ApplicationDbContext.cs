using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Compliance.Api.Models;

namespace Compliance.Api.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<UserTenant> UserTenants { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure Tenant
        builder.Entity<Tenant>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
        });

        // Configure UserTenant (many-to-many with role)
        builder.Entity<UserTenant>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.TenantId });
            
            entity.HasOne(ut => ut.User)
                .WithMany(u => u.UserTenants)
                .HasForeignKey(ut => ut.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(ut => ut.Tenant)
                .WithMany(t => t.UserTenants)
                .HasForeignKey(ut => ut.TenantId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.Property(e => e.Role).IsRequired().HasMaxLength(50);
        });
    }
}

