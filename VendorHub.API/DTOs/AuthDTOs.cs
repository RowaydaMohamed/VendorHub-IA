namespace VendorHub.API.DTOs
{
    // What the frontend sends when registering a new account
    public class RegisterDTO
    {
        public string Name { get; set; } = "";
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
        public string Role { get; set; } = "Customer"; // "Vendor" or "Customer"
    }

    // What the frontend sends when logging in
    public class LoginDTO
    {
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
    }

    // What we send BACK after a successful login
    // Notice: no PasswordHash — we never send that back
    public class AuthResponseDTO
    {
        public string Token { get; set; } = "";   // JWT token for future requests
        public string Name { get; set; } = "";
        public string Role { get; set; } = "";
        public int UserId { get; set; }
    }
}