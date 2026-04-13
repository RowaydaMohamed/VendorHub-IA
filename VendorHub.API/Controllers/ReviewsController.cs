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
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public ReviewsController(AppDbContext db) { _db = db; }

        // GET /api/reviews/product/5
        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetReviews(int productId)
        {
            var reviews = await _db.Reviews
                .Where(r => r.ProductId == productId)
                .Include(r => r.Customer)
                .Select(r => new
                {
                    r.Id,
                    r.Rating,
                    r.Comment,
                    CustomerName = r.Customer!.Name,
                    r.CreatedAt
                }).ToListAsync();

            return Ok(reviews);
        }

        // POST /api/reviews
        // Only customers who purchased can review
        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> AddReview(
            [FromBody] Review dto)
        {
            var customerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // Check customer actually purchased this product
            var purchased = await _db.Orders
                .AnyAsync(o => o.CustomerId == customerId && o.ProductId == dto.ProductId);

            if (!purchased)
                return BadRequest("You can only review products you have purchased.");

            var review = new Review
            {
                CustomerId = customerId,
                ProductId = dto.ProductId,
                Rating = dto.Rating,
                Comment = dto.Comment
            };

            _db.Reviews.Add(review);
            await _db.SaveChangesAsync();
            return Ok("Review submitted.");
        }
    }
}