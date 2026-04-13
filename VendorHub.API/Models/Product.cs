namespace VendorHub.API.Models
{
    // This represents the "Products" table.
    // Vendors create products. Admins approve them. Customers buy them.
    public class Product
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public decimal Price { get; set; }
        public string Category { get; set; } = "";
        public string ImageUrl { get; set; } = "";
        public int AvailableUnits { get; set; }
        public int ViewerCount { get; set; } = 0;
        public bool IsApproved { get; set; } = false; // Admin must approve before visible
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign key — which vendor owns this product?
        // A foreign key is a reference to another table's primary key
        public int VendorId { get; set; }

        // Navigation property — lets us access the full Vendor object from a Product
        public User? Vendor { get; set; }

        // One Product can have many Reviews
        public List<Review> Reviews { get; set; } = new();

        // One Product can be in many Orders
        public List<Order> Orders { get; set; } = new();
    }
}