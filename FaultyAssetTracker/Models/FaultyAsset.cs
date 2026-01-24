namespace FaultyAssetTracker.Models
{
    public class FaultyAsset
    {
        public int Id { get; set; }
        public string Category { get; set; }
        public string AssetName { get; set; } = string.Empty;
        public string TicketId { get; set; }
        public string SerialNo { get; set; }
        public string AssetTag { get; set; }
        public string Branch { get; set; }
        public DateTime DateReceived { get; set; }
        public string ReceivedBy { get; set; }
        public string Vendor { get; set; }
        public string FaultReported { get; set; }
        public DateTime? VendorPickupDate { get; set; }
        public decimal? RepairCost { get; set; }
        public string Status { get; set; }
    }

}
