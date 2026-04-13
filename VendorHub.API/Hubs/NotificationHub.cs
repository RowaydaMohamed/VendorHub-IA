using Microsoft.AspNetCore.SignalR;

namespace VendorHub.API.Hubs
{
    // A Hub is like a live phone line between the server and connected browsers
    // Each vendor who is logged in and online has an open connection here
    public class NotificationHub : Hub
    {
        // When a vendor connects, they join a "group" named after their userId
        // This lets us send a message to just that vendor, not everyone
        public async Task JoinVendorGroup(string vendorId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"vendor_{vendorId}");
        }
    }
}