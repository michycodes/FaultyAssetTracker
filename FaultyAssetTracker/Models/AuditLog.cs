using System;

namespace FaultyAssetTracker.Models
{
    public class AuditLog
    {
        public int Id { get; set; }
        public int AssetId { get; set; }
        public string Action { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? User { get; set; }
    }
}
