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

    [Authorize(Roles = "Admin,Employee")]
    [HttpGet("users")]
    public ActionResult<IEnumerable<string>> GetUsers()
    {
        var users = _userManager.Users
            .Select(u => u.UserName ?? u.Email ?? string.Empty)
            .Where(u => !string.IsNullOrWhiteSpace(u))
            .Distinct()
            .OrderBy(u => u)
            .ToList();

        return Ok(users);
    }

    

    // DELETE: api/admin/{assetTag} (Deletes asset by asset tag)
    [Authorize(Roles = "Admin")]
    [HttpDelete("{assetTag}")]
    public async Task<IActionResult> Delete(string assetTag)
    {
        var asset = await _context.FaultyAssets
            .FirstOrDefaultAsync(a => a.AssetTag == assetTag);
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
