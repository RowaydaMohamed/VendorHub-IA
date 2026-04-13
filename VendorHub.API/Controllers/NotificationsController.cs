using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VendorHub.API.Data;

namespace VendorHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Vendor")]
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public NotificationsController(AppDbContext db) { _db = db; }

        // GET /api/notifications
        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var vendorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var notifications = await _db.Notifications
                .Where(n => n.UserId == vendorId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return Ok(notifications);
        }

        // PUT /api/notifications/5/read
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkRead(int id)
        {
            var vendorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var notification = await _db.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == vendorId);

            if (notification == null) return NotFound();

            notification.IsRead = true;
            await _db.SaveChangesAsync();
            return Ok();
        }
    }
}