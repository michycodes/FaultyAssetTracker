namespace FaultyAssetTracker.Models
{
    public class FaultyAssetDto
    {
        public string Category { get; set; } = string.Empty;
        public string AssetName { get; set; } = string.Empty;
        public string TicketId { get; set; } = string.Empty;
        public string SerialNo { get; set; } = string.Empty;
        public string AssetTag { get; set; } = string.Empty;
        public string Branch { get; set; } = string.Empty;
        public DateTime DateReceived { get; set; }
        public string ReceivedBy { get; set; } = string.Empty;
        public string Vendor { get; set; } = string.Empty;
        public string FaultReported { get; set; } = string.Empty;
        public DateTime? VendorPickupDate { get; set; }
        public decimal? RepairCost { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? LastModifiedBy { get; set; }
        public DateTime? LastModifiedAt { get; set; }
    }

}
