using FaultyAssetTracker.Data;
using FaultyAssetTracker.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FaultyAssetTracker.Controllers
{
   [Authorize(Roles = "Admin,Employee")]
    [Route("api/[controller]")]
    [ApiController]
    public class InventoryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InventoryController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<InventoryAsset>>> GetAll()
        {
            var items = await _context.InventoryAssets
                .OrderBy(a => a.AssetTag)
                .ToListAsync();

            return Ok(items);
        }

        [HttpGet("{assetTag}")]
        public async Task<ActionResult<InventoryAsset>> GetByAssetTag(string assetTag)
        {
            var item = await _context.InventoryAssets
                .FirstOrDefaultAsync(a => a.AssetTag == assetTag);

            if (item == null)
                return NotFound("inventory asset not found.");

            return Ok(item);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<InventoryAsset>> Create(CreateInventoryAssetDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.AssetTag)
                || string.IsNullOrWhiteSpace(dto.SerialNo)
                || string.IsNullOrWhiteSpace(dto.Category)
                || string.IsNullOrWhiteSpace(dto.AssetName)
                || string.IsNullOrWhiteSpace(dto.Branch)
                || string.IsNullOrWhiteSpace(dto.Vendor))
            {
                return BadRequest("all inventory fields are required.");
            }

            var exists = await _context.InventoryAssets
                .AnyAsync(a => a.AssetTag == dto.AssetTag || a.SerialNo == dto.SerialNo);

            if (exists)
                return BadRequest("asset tag or serial number already exists in inventory.");

            var item = new InventoryAsset
            {
                Category = dto.Category,
                AssetName = dto.AssetName,
                SerialNo = dto.SerialNo,
                AssetTag = dto.AssetTag,
                Branch = dto.Branch,
                Vendor = dto.Vendor
            };

            _context.InventoryAssets.Add(item);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetByAssetTag), new { assetTag = item.AssetTag }, item);
        }
    }
}