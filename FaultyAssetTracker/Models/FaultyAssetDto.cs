namespace FaultyAssetTracker.Models
{
    public class FaultyAssetDto
    {
        public string AssetTag { get; set; }
        public string SerialNo { get; set; }
        public string Vendor { get; set; }
        public string Branch { get; set; }
        public string Status { get; set; }
        public decimal? RepairCost { get; set; }
    }

}
