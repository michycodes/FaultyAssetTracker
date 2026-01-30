using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

//[Authorize(Roles = "Admin")]
[Route("api/admin")]
[ApiController]
public class AdminController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;

    public AdminController(UserManager<IdentityUser> userManager)
    {
        _userManager = userManager;
    }

    [HttpPost("create-user")]
    public async Task<IActionResult> CreateUser(string email, string password, string role)
    {
        var user = new IdentityUser { UserName = email, Email = email };

        var result = await _userManager.CreateAsync(user, password);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        await _userManager.AddToRoleAsync(user, role);
        return Ok("User created.");
    }
}
