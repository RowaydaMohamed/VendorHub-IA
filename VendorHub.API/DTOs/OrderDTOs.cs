namespace VendorHub.API.DTOs
{
    // What a Customer sends when purchasing
    public class CreateOrderDTO
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    // What we send back
    public class OrderResponseDTO
    {
        public int Id { get; set; }
        public string ProductTitle { get; set; } = "";
        public int Quantity { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}