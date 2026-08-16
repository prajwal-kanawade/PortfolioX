namespace PortfolioX.Core.DTOs;

public class CommentDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Username { get; set; } = null!;
    public string? AvatarUrl { get; set; }
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public int LikeCount { get; set; }
    public bool IsLikedByMe { get; set; }
    public List<CommentDto> Replies { get; set; } = [];
}

public class CreateCommentRequest
{
    public string Content { get; set; } = null!;
}
