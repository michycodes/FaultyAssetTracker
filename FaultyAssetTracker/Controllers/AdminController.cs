using FaultyAssetTracker.Models;
using FaultyAssetTracker.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// [Authorize(Roles = "Admin")]
[Route("api/admin")]
[ApiController]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly UserManager<IdentityUser> _userManager;

    public AdminController(UserManager<IdentityUser> userManager, AppDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    [HttpPost("create-user")]
    public async Task<IActionResult> CreateUser(string email, string password, string role)
    {
        var user = new IdentityUser { UserName = email, Email = email };

        var result = await _userManager.CreateAsync(user, password);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        await _userManager.AddToRoleAsync(user, "Employee");
        return Ok("User created.");
    }

    // PUT: api/FaultyAssets/5
    [Authorize(Roles = "Admin")]
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
