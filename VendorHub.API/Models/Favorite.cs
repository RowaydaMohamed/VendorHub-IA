namespace VendorHub.API.Models
{
    // A saved/wishlist product for a Customer
    public class Favorite
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int CustomerId { get; set; }
        public User? Customer { get; set; }

        public int ProductId { get; set; }
        public Product? Product { get; set; }
    }
}