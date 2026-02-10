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
                    AssetTag = a.AssetTag,
                    SerialNo = a.SerialNo,
                    Vendor = a.Vendor,
                    Branch = a.Branch,
                    Status = a.Status,
                    RepairCost = a.RepairCost
                })
                .ToListAsync();
        }


        // GET: api/FaultyAssets/5 (searches for an asset with id)
        [HttpGet("{assetTag}")]
        public async Task<ActionResult<FaultyAssetDto>> GetByAssetTag(string assetTag)
        {
            var asset = await _context.FaultyAssets
                .Where(a => a.AssetTag == assetTag)
                .Select(a => new FaultyAssetDto
                {
                    AssetTag = a.AssetTag,
                    SerialNo = a.SerialNo,
                    Vendor = a.Vendor,
                    Branch = a.Branch,
                    Status = a.Status,
                    RepairCost = a.RepairCost
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

            var allowedStatuses = new[] { "Pending", "In Repair", "Repaired" };

            if (asset.RepairCost < 0)
                return BadRequest("repair cost cannot be negative.");

            if (!allowedStatuses.Contains(asset.Status))
                return BadRequest("status must be: Pending, In Repair, or Repaired.");

            _context.FaultyAssets.Add(asset);
            await _context.SaveChangesAsync();
            var user = User.Identity?.Name ?? "system";
            await LogAudit(asset.Id, user, $"created asset {asset.SerialNo}");


            // await LogAudit(asset.Id, $"created asset {asset.AssetName}");

            return CreatedAtAction(nameof(GetByAssetTag), new { assetTag = asset.AssetTag}, asset);
        }

        

        // GET: api/FaultyAssets/stats(shows status of th asset)
        [HttpGet("stats")]
        public async Task<ActionResult> GetStats()
        {
            var totalAssets = await _context.FaultyAssets.CountAsync();
            var pending = await _context.FaultyAssets.CountAsync(a => a.Status == "Pending");
            var inRepair = await _context.FaultyAssets.CountAsync(a => a.Status == "In Repair");
            var repaired = await _context.FaultyAssets.CountAsync(a => a.Status == "Repaired");
            var totalRepairCost = await _context.FaultyAssets.SumAsync(a => a.RepairCost);

            return Ok(new
            {
                TotalAssets = totalAssets,
                Pending = pending,
                InRepair = inRepair,
                Repaired = repaired,
                TotalRepairCost = totalRepairCost
            });
        }

        // GET: api/FaultyAssets/search?AssetTag
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<FaultyAssetDto>>> Search(
    [FromQuery] string AssetTag)
        {
            return await _context.FaultyAssets
                .Where(a => a.AssetTag == AssetTag)
                .Select(a => new FaultyAssetDto
                {
                    AssetTag = a.AssetTag,
                    SerialNo = a.SerialNo,
                    Vendor = a.Vendor,
                    Branch = a.Branch,
                    Status = a.Status,
                    RepairCost = a.RepairCost
                })
                .ToListAsync();
        }


        // AUDIT LOGGER(shows the person who last made changes to a file)
        private async Task LogAudit(int assetId, string message, string v)
        {
            var username = User.Identity?.Name ?? "unknown";

            var log = new AuditLog
            {
                AssetId = assetId,
                User = username,
                Action = message,
                Timestamp = DateTime.UtcNow
            };

            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }
    }
}
