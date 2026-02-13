namespace FaultyAssetTracker.Models
{
    public class UpdateFaultyAssetDto
    {
        public string Vendor { get; set; } = string.Empty;
        public string Branch { get; set; } = string.Empty;
        public string FaultReported { get; set; } = string.Empty;
        public decimal? RepairCost { get; set; }
        public string Status { get; set; } = "Pending";
    }
}