namespace VendorHub.API.Models
{
    // A rating + comment left by a Customer on a Product they purchased
    public class Review
    {
        public int Id { get; set; }
        public int Rating { get; set; }        // 1 to 5 stars
        public string Comment { get; set; } = "";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int CustomerId { get; set; }
        public User? Customer { get; set; }

        public int ProductId { get; set; }
        public Product? Product { get; set; }
    }
}