using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using FaultyAssetTracker.Models;

namespace FaultyAssetTracker.Data
{
    public class AppDbContext : IdentityDbContext<IdentityUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<FaultyAsset> FaultyAssets { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder); // 👈 required for Identity tables

            modelBuilder.Entity<FaultyAsset>()
                .Property(f => f.RepairCost)
                .HasPrecision(18, 2);
            modelBuilder.Entity<FaultyAsset>()
                .HasIndex(a => a.AssetTag)
                .IsUnique();

        }
    }
}
