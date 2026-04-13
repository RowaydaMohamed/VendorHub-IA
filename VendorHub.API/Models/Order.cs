namespace VendorHub.API.Models
{
    // Represents a purchase made by a Customer
    public class Order
    {
        public int Id { get; set; }
        public int Quantity { get; set; }
        public decimal TotalPrice { get; set; }   // Quantity × Price at time of purchase
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Which customer made this order?
        public int CustomerId { get; set; }
        public User? Customer { get; set; }

        // Which product was ordered?
        public int ProductId { get; set; }
        public Product? Product { get; set; }
    }
}