using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FaultyAssetTracker.Data;
using FaultyAssetTracker.Models;

namespace FaultyAssetTracker.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FaultyAssetsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FaultyAssetsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/FaultyAssets
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FaultyAsset>>> GetAll()
        {
            return await _context.FaultyAssets.ToListAsync();
        }

        // GET: api/FaultyAssets/5
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
            _context.FaultyAssets.Add(asset);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = asset.Id }, asset);
        }

        // PUT: api/FaultyAssets/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, FaultyAsset asset)
        {
            if (id != asset.Id)
                return BadRequest();

            _context.Entry(asset).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.FaultyAssets.Any(e => e.Id == id))
                    return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE: api/FaultyAssets/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var asset = await _context.FaultyAssets.FindAsync(id);
            if (asset == null)
                return NotFound();

            _context.FaultyAssets.Remove(asset);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
