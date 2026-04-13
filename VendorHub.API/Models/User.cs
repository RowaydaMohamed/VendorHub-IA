namespace VendorHub.API.Models
{
    // This class represents the "Users" table in the database.
    // Every person who uses the app — Admin, Vendor, or Customer — is stored here.
    public class User
    {
        public int Id { get; set; }               // Primary key — auto-incremented unique ID
        public string Name { get; set; } = "";    // Full name
        public string Email { get; set; } = "";   // Used for login
        public string PasswordHash { get; set; } = ""; // We never store plain passwords
        public string Role { get; set; } = "Customer"; // "Admin", "Vendor", or "Customer"
        public bool IsApproved { get; set; } = false;  // Vendors need Admin approval
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties — Entity Framework uses these to understand relationships
        // One User (Vendor) can have many Products
        public List<Product> Products { get; set; } = new();

        // One User (Customer) can have many Orders
        public List<Order> Orders { get; set; } = new();

        // One User (Customer) can have many Favorites
        public List<Favorite> Favorites { get; set; } = new();

        // One User can have many Notifications
        public List<Notification> Notifications { get; set; } = new();
    }
}