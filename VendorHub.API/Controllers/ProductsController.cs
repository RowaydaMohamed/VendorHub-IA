using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VendorHub.API.Data;
using VendorHub.API.DTOs;
using VendorHub.API.Models;

namespace VendorHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public ProductsController(AppDbContext db)
        {
            _db = db;
        }

        // GET /api/products
        // Public — no login needed. Supports filtering by category, name, price
        [HttpGet]
        public async Task<IActionResult> GetProducts(
            [FromQuery] string? category,
            [FromQuery] string? search,
            [FromQuery] decimal? maxPrice)
        {
            // Start with all approved products, include vendor info
            var query = _db.Products
                .Where(p => p.IsApproved)
                .Include(p => p.Vendor)
                .AsQueryable();

            // Apply optional filters
            if (!string.IsNullOrEmpty(category))
                query = query.Where(p => p.Category == category);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(p => p.Title.Contains(search));

            if (maxPrice.HasValue)
                query = query.Where(p => p.Price <= maxPrice.Value);

            var products = await query.Select(p => new ProductResponseDTO
            {
                Id = p.Id,
                Title = p.Title,
                Description = p.Description,
                Price = p.Price,
                Category = p.Category,
                ImageUrl = p.ImageUrl,
                AvailableUnits = p.AvailableUnits,
                ViewerCount = p.ViewerCount,
                IsApproved = p.IsApproved,
                VendorName = p.Vendor!.Name,
                VendorId = p.VendorId,
                CreatedAt = p.CreatedAt
            }).ToListAsync();

            return Ok(products);
        }

        // GET /api/products/5
        // Public — increments view count each time someone opens a product
        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            var product = await _db.Products
                .Include(p => p.Vendor)
                .Include(p => p.Reviews)
                    .ThenInclude(r => r.Customer)
                .FirstOrDefaultAsync(p => p.Id == id && p.IsApproved);

            if (product == null) return NotFound();

            // Increment viewer count every time this product is opened
            product.ViewerCount++;
            await _db.SaveChangesAsync();

            return Ok(new ProductResponseDTO
            {
                Id = product.Id,
                Title = product.Title,
                Description = product.Description,
                Price = product.Price,
                Category = product.Category,
                ImageUrl = product.ImageUrl,
                AvailableUnits = product.AvailableUnits,
                ViewerCount = product.ViewerCount,
                IsApproved = product.IsApproved,
                VendorName = product.Vendor!.Name,
                VendorId = product.VendorId,
                CreatedAt = product.CreatedAt
            });
        }

        // POST /api/products
        // Only Vendors can create products
        [HttpPost]
        [Authorize(Roles = "Vendor")]
        public async Task<IActionResult> CreateProduct(CreateProductDTO dto)
        {
            // Read the vendor's ID from their JWT token
            var vendorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var product = new Product
            {
                Title = dto.Title,
                Description = dto.Description,
                Price = dto.Price,
                Category = dto.Category,
                ImageUrl = dto.ImageUrl,
                AvailableUnits = dto.AvailableUnits,
                VendorId = vendorId,
                IsApproved = false // Must wait for admin approval
            };

            _db.Products.Add(product);
            await _db.SaveChangesAsync();

            return Ok("Product submitted for approval.");
        }

        // PUT /api/products/5
        // Only the Vendor who owns this product can update it
        [HttpPut("{id}")]
        [Authorize(Roles = "Vendor")]
        public async Task<IActionResult> UpdateProduct(int id, CreateProductDTO dto)
        {
            var vendorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var product = await _db.Products
                .FirstOrDefaultAsync(p => p.Id == id && p.VendorId == vendorId);

            if (product == null) return NotFound();

            product.Title = dto.Title;
            product.Description = dto.Description;
            product.Price = dto.Price;
            product.Category = dto.Category;
            product.ImageUrl = dto.ImageUrl;
            product.AvailableUnits = dto.AvailableUnits;

            await _db.SaveChangesAsync();
            return Ok("Product updated.");
        }

        // DELETE /api/products/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Vendor")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var vendorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var product = await _db.Products
                .FirstOrDefaultAsync(p => p.Id == id && p.VendorId == vendorId);

            if (product == null) return NotFound();

            _db.Products.Remove(product);
            await _db.SaveChangesAsync();
            return Ok("Product deleted.");
        }

        // GET /api/products/my
        // Vendor sees all their own products (including unapproved)
        [HttpGet("my")]
        [Authorize(Roles = "Vendor")]
        public async Task<IActionResult> GetMyProducts()
        {
            var vendorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var products = await _db.Products
                .Where(p => p.VendorId == vendorId)
                .Select(p => new ProductResponseDTO
                {
                    Id = p.Id,
                    Title = p.Title,
                    Description = p.Description,
                    Price = p.Price,
                    Category = p.Category,
                    ImageUrl = p.ImageUrl,
                    AvailableUnits = p.AvailableUnits,
                    ViewerCount = p.ViewerCount,
                    IsApproved = p.IsApproved,
                    VendorName = "",
                    VendorId = p.VendorId,
                    CreatedAt = p.CreatedAt
                }).ToListAsync();

            return Ok(products);
        }
    }
}