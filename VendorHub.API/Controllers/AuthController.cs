using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using VendorHub.API.Data;
using VendorHub.API.DTOs;
using VendorHub.API.Models;

namespace VendorHub.API.Controllers
{
    // [ApiController] tells .NET this is an API controller (adds automatic validation)
    // [Route] sets the base URL: all endpoints here start with /api/auth
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        // We need the database and configuration — we get them through Dependency Injection
        // Dependency Injection means .NET automatically creates and provides these objects
        private readonly AppDbContext _db;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        // POST /api/auth/register
        // Anyone can call this to create an account
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDTO dto)
        {
            // Check if email is already taken
            var exists = await _db.Users.AnyAsync(u => u.Email == dto.Email);
            if (exists)
                return BadRequest("Email already in use.");

            // Create the new user — hash the password before saving
            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role == "Vendor" ? "Vendor" : "Customer",
                // Vendors need admin approval, Customers are auto-approved
                IsApproved = dto.Role != "Vendor"
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return Ok("Account created successfully.");
        }

        // POST /api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDTO dto)
        {
            // Find user by email
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

            // Verify password against stored hash
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized("Invalid email or password.");

            // Vendors must be approved before they can log in
            if (user.Role == "Vendor" && !user.IsApproved)
                return Unauthorized("Your vendor account is pending admin approval.");

            // Generate JWT token
            var token = GenerateJwtToken(user);

            return Ok(new AuthResponseDTO
            {
                Token = token,
                Name = user.Name,
                Role = user.Role,
                UserId = user.Id
            });
        }

        // This private method creates the JWT token
        // A JWT token is a signed string that proves who the user is
        // It looks like: xxxxx.yyyyy.zzzzz
        private string GenerateJwtToken(User user)
        {
            // Claims are pieces of information embedded in the token
            // The server reads these on every request to know who is calling
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            // Sign the token with a secret key from appsettings.json
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7), // Token expires after 7 days
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}