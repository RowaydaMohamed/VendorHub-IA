namespace VendorHub.API.DTOs
{
    // What a Vendor sends when creating or updating a product
    public class CreateProductDTO
    {
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public decimal Price { get; set; }
        public string Category { get; set; } = "";
        public string ImageUrl { get; set; } = "";
        public int AvailableUnits { get; set; }
    }

    // What we send back when someone requests a product
    public class ProductResponseDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public decimal Price { get; set; }
        public string Category { get; set; } = "";
        public string ImageUrl { get; set; } = "";
        public int AvailableUnits { get; set; }
        public int ViewerCount { get; set; }
        public bool IsApproved { get; set; }
        public string VendorName { get; set; } = "";
        public int VendorId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}