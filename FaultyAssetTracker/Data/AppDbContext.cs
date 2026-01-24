using Microsoft.EntityFrameworkCore;
using FaultyAssetTracker.Models;

namespace FaultyAssetTracker.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<FaultyAsset> FaultyAssets { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<FaultyAsset>()
                .Property(f => f.RepairCost)
                .HasPrecision(18, 2); // 18 digits total, 2 after decimal
        }
    }
}
