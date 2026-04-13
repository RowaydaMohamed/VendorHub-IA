using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VendorHub.API.Data;
using VendorHub.API.Models;

namespace VendorHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Customer")]
    public class FavoritesController : ControllerBase
    {
        private readonly AppDbContext _db;
        public FavoritesController(AppDbContext db) { _db = db; }

        // GET /api/favorites
        [HttpGet]
        public async Task<IActionResult> GetFavorites()
        {
            var customerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var favorites = await _db.Favorites
                .Where(f => f.CustomerId == customerId)
                .Include(f => f.Product)
                .Select(f => new
                {
                    f.Id,
                    f.ProductId,
                    ProductTitle = f.Product!.Title,
                    ProductPrice = f.Product.Price,
                    ProductImage = f.Product.ImageUrl
                }).ToListAsync();

            return Ok(favorites);
        }

        // POST /api/favorites
        [HttpPost("{productId}")]
        public async Task<IActionResult> AddFavorite(int productId)
        {
            var customerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var already = await _db.Favorites
                .AnyAsync(f => f.CustomerId == customerId && f.ProductId == productId);

            if (already) return BadRequest("Already in favorites.");

            _db.Favorites.Add(new Favorite
            {
                CustomerId = customerId,
                ProductId = productId
            });
            await _db.SaveChangesAsync();
            return Ok("Added to favorites.");
        }

        // DELETE /api/favorites/5
        [HttpDelete("{productId}")]
        public async Task<IActionResult> RemoveFavorite(int productId)
        {
            var customerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var fav = await _db.Favorites
                .FirstOrDefaultAsync(f => f.CustomerId == customerId && f.ProductId == productId);

            if (fav == null) return NotFound();

            _db.Favorites.Remove(fav);
            await _db.SaveChangesAsync();
            return Ok("Removed from favorites.");
        }
    }
}