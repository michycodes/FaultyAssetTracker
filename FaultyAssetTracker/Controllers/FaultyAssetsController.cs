using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FaultyAssetTracker.Data;
using FaultyAssetTracker.Models;
using Microsoft.AspNetCore.Authorization;

namespace FaultyAssetTracker.Controllers
{
    // [Authorize(Roles = "Admin,Employee")]
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
        public async Task<ActionResult<IEnumerable<FaultyAsset>>> GetAll()
        {
            return await _context.FaultyAssets.ToListAsync();
        }

        // GET: api/FaultyAssets/5 (searches for an asset with id)
        [HttpGet("{id}")]
        public async Task<ActionResult<FaultyAsset>> GetById(int id)
        {
            var asset = await _context.FaultyAssets.FindAsync(id);
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

            return CreatedAtAction(nameof(GetById), new { id = asset.Id }, asset);
        }

        // PUT: api/FaultyAssets/5
        [Authorize(Roles = "Admin,Employee")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, FaultyAsset asset)
        {
            if (id != asset.Id)
                return BadRequest();

            var allowedStatuses = new[] { "Pending", "In Repair", "Repaired" };

            if (asset.RepairCost < 0)
                return BadRequest("repair cost cannot be negative.");

            if (!allowedStatuses.Contains(asset.Status))
                return BadRequest("status must be: Pending, In Repair, or Repaired.");

            _context.Entry(asset).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                var user = User.Identity?.Name ?? "system";
                await LogAudit(asset.Id, user, "updated asset");

              //  await LogAudit(asset.Id, $"updated asset {asset.AssetName}");
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.FaultyAssets.Any(e => e.Id == id))
                    return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE: api/FaultyAssets/5(Deletes asset)
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var asset = await _context.FaultyAssets.FindAsync(id);
            if (asset == null)
                return NotFound();

            _context.FaultyAssets.Remove(asset);
            await _context.SaveChangesAsync();

            var user = User.Identity?.Name ?? "system";
            await LogAudit(asset.Id, user, $"deleted asset {asset.SerialNo}");


           // await LogAudit(id, $"deleted asset {asset.AssetName}");

            return NoContent();
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

        // GET: api/FaultyAssets/search?status=Pending&vendor=TechFix&branch=Lagos
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<FaultyAsset>>> Search(
            [FromQuery] string? status,
            [FromQuery] string? vendor,
            [FromQuery] string? branch)
        {
            var query = _context.FaultyAssets.AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(a => a.Status == status);

            if (!string.IsNullOrEmpty(vendor))
                query = query.Where(a => a.Vendor.Contains(vendor));

            if (!string.IsNullOrEmpty(branch))
                query = query.Where(a => a.Branch.Contains(branch));

            return await query.ToListAsync();
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
