namespace PortfolioX.Core.Entities;

public class Admin
{
    public Guid Id { get; set; }
    public string Email { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? ProfilePhotoUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<AdminRefreshToken> RefreshTokens { get; set; } = new List<AdminRefreshToken>();
}

public class AdminRefreshToken
{
    public Guid Id { get; set; }
    public Guid AdminId { get; set; }
    public string Token { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Admin? Admin { get; set; }
}
