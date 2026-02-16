using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FaultyAssetTracker.Data;
using FaultyAssetTracker.Models;
using Microsoft.AspNetCore.Authorization;

namespace FaultyAssetTracker.Controllers
{
    [Authorize(Roles = "Admin,Employee")]
    [Route("api/[controller]")]
    [ApiController]
    public class FaultyAssetsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private static readonly string[] AllowedStatuses =
        {
            "Pending",
            "In Repair",
            "Repaired",
            "EOL (End of Life)",
            "Fixed and Dispatched to Branch",
            "Dispatched to Vendor"
        };

        public FaultyAssetsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/FaultyAssets (Lists all the assets)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FaultyAssetDto>>> GetAll()
        {
            return await _context.FaultyAssets
                .Select(a => new FaultyAssetDto
                {
                    Category = a.Category,
                    AssetName = a.AssetName,
                    TicketId = a.TicketId,
                    SerialNo = a.SerialNo,
                    AssetTag = a.AssetTag,
                    Branch = a.Branch,
                    DateReceived = a.DateReceived,
                    ReceivedBy = a.ReceivedBy,
                    Vendor = a.Vendor,
                    FaultReported = a.FaultReported,
                    VendorPickupDate = a.VendorPickupDate,
                    Status = a.Status,
                    RepairCost = a.RepairCost,
                    LastModifiedBy = _context.AuditLogs
                        .Where(log => log.AssetId == a.Id)
                        .OrderByDescending(log => log.Timestamp)
                        .Select(log => log.User)
                        .FirstOrDefault(),
                    LastModifiedAt = _context.AuditLogs
                        .Where(log => log.AssetId == a.Id)
                        .OrderByDescending(log => log.Timestamp)
                        .Select(log => (DateTime?)log.Timestamp)
                        .FirstOrDefault()
                })
                .ToListAsync();
        }


        // GET: api/FaultyAssets/ASSET-001 (searches for an asset by tag)
        [HttpGet("{assetTag}")]
        public async Task<ActionResult<FaultyAssetDto>> GetByAssetTag(string assetTag)
        {
            var asset = await _context.FaultyAssets
                .Where(a => a.AssetTag == assetTag)
                .Select(a => new FaultyAssetDto
                {
                    Category = a.Category,
                    AssetName = a.AssetName,
                    TicketId = a.TicketId,
                    SerialNo = a.SerialNo,
                    AssetTag = a.AssetTag,
                    Branch = a.Branch,
                    DateReceived = a.DateReceived,
                    ReceivedBy = a.ReceivedBy,
                    Vendor = a.Vendor,
                    FaultReported = a.FaultReported,
                    VendorPickupDate = a.VendorPickupDate,
                    RepairCost = a.RepairCost,
                    Status = a.Status,
                    LastModifiedBy = _context.AuditLogs
                        .Where(log => log.AssetId == a.Id)
                        .OrderByDescending(log => log.Timestamp)
                        .Select(log => log.User)
                        .FirstOrDefault(),
                    LastModifiedAt = _context.AuditLogs
                        .Where(log => log.AssetId == a.Id)
                        .OrderByDescending(log => log.Timestamp)
                        .Select(log => (DateTime?)log.Timestamp)
                        .FirstOrDefault()
                })
                .FirstOrDefaultAsync();

            if (asset == null)
                return NotFound();

            return asset;
        }


        // POST: api/FaultyAssets 
        [HttpPost]
        public async Task<ActionResult<FaultyAsset>> Create(FaultyAsset asset)
        {
            bool exists = await _context.FaultyAssets
                .AnyAsync(a => a.SerialNo == asset.SerialNo || a.AssetTag == asset.AssetTag);

            if (exists)
                return BadRequest("this asset already exists.");

            if (asset.RepairCost < 0)
                return BadRequest("repair cost cannot be negative.");

            if (!AllowedStatuses.Contains(asset.Status))
                return BadRequest($"status must be one of: {string.Join(", ", AllowedStatuses)}.");

            _context.FaultyAssets.Add(asset);
            await _context.SaveChangesAsync();
            await LogAudit(asset.Id, $"created asset {asset.SerialNo}");

            return CreatedAtAction(nameof(GetByAssetTag), new { assetTag = asset.AssetTag }, asset);
        }



        // GET: api/FaultyAssets/stats (shows status counts)
        [HttpGet("stats")]
        public async Task<ActionResult> GetStats()
        {
            var totalAssets = await _context.FaultyAssets.CountAsync();
            var pending = await _context.FaultyAssets.CountAsync(a => a.Status == "Pending");
            var inRepair = await _context.FaultyAssets.CountAsync(a => a.Status == "In Repair");
            var repaired = await _context.FaultyAssets.CountAsync(a => a.Status == "Repaired");
            var eol = await _context.FaultyAssets.CountAsync(a => a.Status == "EOL (End of Life)");
            var fixedAndDispatchedToBranch = await _context.FaultyAssets.CountAsync(a => a.Status == "Fixed and Dispatched to Branch");
            var dispatchedToVendor = await _context.FaultyAssets.CountAsync(a => a.Status == "Dispatched to Vendor");
            var totalRepairCost = await _context.FaultyAssets.SumAsync(a => a.RepairCost);

            return Ok(new
            {
                TotalAssets = totalAssets,
                Pending = pending,
                InRepair = inRepair,
                Repaired = repaired,
                Eol = eol,
                FixedAndDispatchedToBranch = fixedAndDispatchedToBranch,
                DispatchedToVendor = dispatchedToVendor,
                TotalRepairCost = totalRepairCost
            });
        }

        // GET: api/FaultyAssets/search?AssetTag=ASSET-001
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<FaultyAssetDto>>> Search([FromQuery] string AssetTag)
        {
            return await _context.FaultyAssets
                .Where(a => a.AssetTag == AssetTag)
                .Select(a => new FaultyAssetDto
                {
                    Category = a.Category,
                    AssetName = a.AssetName,
                    TicketId = a.TicketId,
                    SerialNo = a.SerialNo,
                    AssetTag = a.AssetTag,
                    Branch = a.Branch,
                    DateReceived = a.DateReceived,
                    ReceivedBy = a.ReceivedBy,
                    Vendor = a.Vendor,
                    FaultReported = a.FaultReported,
                    VendorPickupDate = a.VendorPickupDate,
                    RepairCost = a.RepairCost,
                    Status = a.Status,
                    LastModifiedBy = _context.AuditLogs
                        .Where(log => log.AssetId == a.Id)
                        .OrderByDescending(log => log.Timestamp)
                        .Select(log => log.User)
                        .FirstOrDefault(),
                    LastModifiedAt = _context.AuditLogs
                        .Where(log => log.AssetId == a.Id)
                        .OrderByDescending(log => log.Timestamp)
                        .Select(log => (DateTime?)log.Timestamp)
                        .FirstOrDefault()
                })
                .ToListAsync();
        }

        // GET: api/FaultyAssets/{assetTag}/audit (asset-specific audit trail)
        [HttpGet("{assetTag}/audit")]
        public async Task<ActionResult<IEnumerable<object>>> GetAuditTrailByAssetTag(string assetTag)
        {
            var assetId = await _context.FaultyAssets
                .Where(a => a.AssetTag == assetTag)
                .Select(a => (int?)a.Id)
                .FirstOrDefaultAsync();

            if (assetId == null)
                return NotFound("asset not found.");

            var logs = await _context.AuditLogs
                .Where(l => l.AssetId == assetId.Value)
                .OrderByDescending(l => l.Timestamp)
                .Select(l => new
                {
                    l.Id,
                    l.AssetId,
                    l.Action,
                    l.User,
                    l.Timestamp
                })
                .ToListAsync();

            return Ok(logs);
        }
        // PUT: api/FaultyAssets/{assetTag}
        [HttpPut("{assetTag}")]
        public async Task<IActionResult> Update(string assetTag, UpdateFaultyAssetDto updatedAsset)
        {
            var existingAsset = await _context.FaultyAssets
                .FirstOrDefaultAsync(a => a.AssetTag == assetTag);

            if (existingAsset == null)
                return NotFound("asset not found.");

            if (updatedAsset.RepairCost < 0)
                return BadRequest("repair cost cannot be negative.");

            if (!AllowedStatuses.Contains(updatedAsset.Status))
                return BadRequest($"status must be one of: {string.Join(", ", AllowedStatuses)}.");

            // update only what is allowed
            if (string.IsNullOrWhiteSpace(updatedAsset.AssetTag)
               || string.IsNullOrWhiteSpace(updatedAsset.SerialNo)
               || string.IsNullOrWhiteSpace(updatedAsset.Category)
               || string.IsNullOrWhiteSpace(updatedAsset.AssetName)
               || string.IsNullOrWhiteSpace(updatedAsset.TicketId)
               || string.IsNullOrWhiteSpace(updatedAsset.Branch)
               || string.IsNullOrWhiteSpace(updatedAsset.ReceivedBy)
               || string.IsNullOrWhiteSpace(updatedAsset.Vendor)
               || string.IsNullOrWhiteSpace(updatedAsset.FaultReported))
            {
                return BadRequest("all required asset fields must be provided.");
            }

            bool duplicateAssetTag = await _context.FaultyAssets
                .AnyAsync(a => a.AssetTag == updatedAsset.AssetTag && a.Id != existingAsset.Id);
            if (duplicateAssetTag)
                return BadRequest("asset tag already exists.");

            bool duplicateSerialNo = await _context.FaultyAssets
                .AnyAsync(a => a.SerialNo == updatedAsset.SerialNo && a.Id != existingAsset.Id);
            if (duplicateSerialNo)
                return BadRequest("serial number already exists.");

            existingAsset.Category = updatedAsset.Category;
            existingAsset.AssetName = updatedAsset.AssetName;
            existingAsset.TicketId = updatedAsset.TicketId;
            existingAsset.SerialNo = updatedAsset.SerialNo;
            existingAsset.AssetTag = updatedAsset.AssetTag;
            existingAsset.Branch = updatedAsset.Branch;
            existingAsset.DateReceived = updatedAsset.DateReceived;
            existingAsset.ReceivedBy = updatedAsset.ReceivedBy;
            existingAsset.Vendor = updatedAsset.Vendor;
            existingAsset.FaultReported = updatedAsset.FaultReported;
            existingAsset.VendorPickupDate = updatedAsset.VendorPickupDate;
            existingAsset.Status = updatedAsset.Status;
            existingAsset.RepairCost = updatedAsset.RepairCost;
           // existingAsset.Vendor = string.IsNullOrWhiteSpace(updatedAsset.Vendor) ? existingAsset.Vendor : updatedAsset.Vendor;
           // existingAsset.Branch = string.IsNullOrWhiteSpace(updatedAsset.Branch) ? existingAsset.Branch : updatedAsset.Branch;
          //  existingAsset.FaultReported = string.IsNullOrWhiteSpace(updatedAsset.FaultReported) ? existingAsset.FaultReported : updatedAsset.FaultReported;

            await _context.SaveChangesAsync();

            var user = User.Identity?.Name ?? "system";
            await LogAudit(existingAsset.Id, $"updated asset {existingAsset.AssetTag}");

            return NoContent();
        }




        // AUDIT LOGGER (tracks who made changes)
        private async Task LogAudit(int assetId, string action)
        {
            var username = User.Identity?.Name ?? "unknown";

            var log = new AuditLog
            {
                AssetId = assetId,
                User = username,
                Action = action,
                Timestamp = DateTime.UtcNow
            };

            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }
    }
}   
