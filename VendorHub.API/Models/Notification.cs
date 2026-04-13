namespace VendorHub.API.Models
{
    // A message sent to a Vendor when their product is purchased
    public class Notification
    {
        public int Id { get; set; }
        public string Message { get; set; } = "";
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int UserId { get; set; }
        public User? User { get; set; }
    }
}