namespace PortfolioX.Core.DTOs;

public class PublicUserProfileDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = null!;
    public string? FullName { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public int FollowerCount { get; set; }
    public int FollowingCount { get; set; }
    public bool IsFollowedByMe { get; set; }
}
