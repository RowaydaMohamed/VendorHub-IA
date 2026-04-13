using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VendorHub.API.Data;
using VendorHub.API.DTOs;
using VendorHub.API.Hubs;
using VendorHub.API.Models;

namespace VendorHub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IHubContext<NotificationHub> _hubContext;

        // IHubContext lets us send SignalR messages from inside a controller
        public OrdersController(AppDbContext db, IHubContext<NotificationHub> hubContext)
        {
            _db = db;
            _hubContext = hubContext;
        }

        // POST /api/orders
        // Only logged-in Customers can purchase
        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> PlaceOrder(CreateOrderDTO dto)
        {
            var customerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var product = await _db.Products
                .Include(p => p.Vendor)
                .FirstOrDefaultAsync(p => p.Id == dto.ProductId && p.IsApproved);

            if (product == null) return NotFound("Product not found.");
            if (product.AvailableUnits < dto.Quantity)
                return BadRequest("Not enough stock available.");

            // Create the order
            var order = new Order
            {
                CustomerId = customerId,
                ProductId = dto.ProductId,
                Quantity = dto.Quantity,
                TotalPrice = product.Price * dto.Quantity
            };

            // Reduce stock
            product.AvailableUnits -= dto.Quantity;

            // Create a notification for the vendor
            var customer = await _db.Users.FindAsync(customerId);
            var notification = new Notification
            {
                UserId = product.VendorId,
                Message = $"{customer!.Name} purchased {dto.Quantity}x '{product.Title}' for ${order.TotalPrice}"
            };

            _db.Orders.Add(order);
            _db.Notifications.Add(notification);
            await _db.SaveChangesAsync();

            // Send REAL-TIME notification to the vendor via SignalR
            // This sends to the vendor's group we set up in NotificationHub
            await _hubContext.Clients
                .Group($"vendor_{product.VendorId}")
                .SendAsync("ReceiveNotification", notification.Message);

            return Ok(new OrderResponseDTO
            {
                Id = order.Id,
                ProductTitle = product.Title,
                Quantity = order.Quantity,
                TotalPrice = order.TotalPrice,
                CreatedAt = order.CreatedAt
            });
        }

        // GET /api/orders/my
        // Customer sees their own order history
        [HttpGet("my")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetMyOrders()
        {
            var customerId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var orders = await _db.Orders
                .Where(o => o.CustomerId == customerId)
                .Include(o => o.Product)
                .Select(o => new OrderResponseDTO
                {
                    Id = o.Id,
                    ProductTitle = o.Product!.Title,
                    Quantity = o.Quantity,
                    TotalPrice = o.TotalPrice,
                    CreatedAt = o.CreatedAt
                }).ToListAsync();

            return Ok(orders);
        }

        // GET /api/orders/vendor-sales
        // Vendor sees all sales of their products
        [HttpGet("vendor-sales")]
        [Authorize(Roles = "Vendor")]
        public async Task<IActionResult> GetVendorSales()
        {
            var vendorId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var sales = await _db.Orders
                .Include(o => o.Product)
                .Include(o => o.Customer)
                .Where(o => o.Product!.VendorId == vendorId)
                .Select(o => new
                {
                    o.Id,
                    ProductTitle = o.Product!.Title,
                    CustomerName = o.Customer!.Name,
                    o.Quantity,
                    o.TotalPrice,
                    o.CreatedAt
                }).ToListAsync();

            return Ok(sales);
        }
    }
}