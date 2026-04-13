using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VendorHub.API.Data;

namespace VendorHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] // Every endpoint in this controller requires Admin role
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AdminController(AppDbContext db)
        {
            _db = db;
        }

        // GET /api/admin/vendors
        // See all vendor accounts
        [HttpGet("vendors")]
        public async Task<IActionResult> GetVendors()
        {
            var vendors = await _db.Users
                .Where(u => u.Role == "Vendor")
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.IsApproved,
                    u.CreatedAt
                }).ToListAsync();

            return Ok(vendors);
        }

        // PUT /api/admin/vendors/5/approve
        [HttpPut("vendors/{id}/approve")]
        public async Task<IActionResult> ApproveVendor(int id)
        {
            var vendor = await _db.Users.FindAsync(id);
            if (vendor == null || vendor.Role != "Vendor") return NotFound();

            vendor.IsApproved = true;
            await _db.SaveChangesAsync();
            return Ok("Vendor approved.");
        }

        // PUT /api/admin/vendors/5/reject
        [HttpPut("vendors/{id}/reject")]
        public async Task<IActionResult> RejectVendor(int id)
        {
            var vendor = await _db.Users.FindAsync(id);
            if (vendor == null || vendor.Role != "Vendor") return NotFound();

            _db.Users.Remove(vendor);
            await _db.SaveChangesAsync();
            return Ok("Vendor rejected and removed.");
        }

        // GET /api/admin/products/pending
        // See all products waiting for approval
        [HttpGet("products/pending")]
        public async Task<IActionResult> GetPendingProducts()
        {
            var products = await _db.Products
                .Where(p => !p.IsApproved)
                .Include(p => p.Vendor)
                .Select(p => new
                {
                    p.Id,
                    p.Title,
                    p.Description,
                    p.Price,
                    p.Category,
                    VendorName = p.Vendor!.Name,
                    p.CreatedAt
                }).ToListAsync();

            return Ok(products);
        }

        // PUT /api/admin/products/5/approve
        [HttpPut("products/{id}/approve")]
        public async Task<IActionResult> ApproveProduct(int id)
        {
            var product = await _db.Products.FindAsync(id);
            if (product == null) return NotFound();

            product.IsApproved = true;
            await _db.SaveChangesAsync();
            return Ok("Product approved.");
        }

        // PUT /api/admin/products/5/reject
        [HttpPut("products/{id}/reject")]
        public async Task<IActionResult> RejectProduct(int id)
        {
            var product = await _db.Products.FindAsync(id);
            if (product == null) return NotFound();

            _db.Products.Remove(product);
            await _db.SaveChangesAsync();
            return Ok("Product rejected and removed.");
        }
    }
}