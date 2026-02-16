using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IConfiguration _config;

    public AuthController(UserManager<IdentityUser> userManager, IConfiguration config)
    {
        _userManager = userManager;
        _config = config;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(string email, string password)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
            return Unauthorized("Invalid credentials");

        var isValid = await _userManager.CheckPasswordAsync(user, password);
        if (!isValid)
            return Unauthorized("Invalid credentials");

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new
        {
            token = GenerateToken(user, roles)
        });
    }

    [Authorize(Roles = "Admin,Employee")]
    [HttpPut("change-name")]
    public async Task<IActionResult> ChangeName([FromBody] ChangeNameRequest request)
    {
        var newName = (request.NewName ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(newName))
            return BadRequest("name cannot be empty.");

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized("invalid token context.");

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return Unauthorized("user not found.");

        var existingUser = await _userManager.FindByNameAsync(newName);
        if (existingUser != null && existingUser.Id != user.Id)
            return BadRequest("name already exists.");

        user.UserName = newName;
        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
            return BadRequest(updateResult.Errors.Select(e => e.Description));

        var roles = await _userManager.GetRolesAsync(user);
        return Ok(new
        {
            token = GenerateToken(user, roles),
            displayName = user.UserName
        });
    }

    private string GenerateToken(IdentityUser user, IList<string> roles)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.UserName ?? user.Email ?? string.Empty),
            new Claim(ClaimTypes.NameIdentifier, user.Id)
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"])
        );

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(3),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public class ChangeNameRequest
{
    public string NewName { get; set; } = string.Empty;
}
