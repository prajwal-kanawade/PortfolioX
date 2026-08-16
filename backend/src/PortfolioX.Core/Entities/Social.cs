namespace PortfolioX.Core.Entities;

public class PortfolioLike
{
    public Guid Id { get; set; }
    public Guid PortfolioId { get; set; }
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Portfolio? Portfolio { get; set; }
    public User? User { get; set; }
}

public class Comment
{
    public Guid Id { get; set; }
    public Guid PortfolioId { get; set; }
    public Guid UserId { get; set; }
    public Guid? ParentCommentId { get; set; }
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Portfolio? Portfolio { get; set; }
    public User? User { get; set; }
    public Comment? ParentComment { get; set; }
    public ICollection<Comment> Replies { get; set; } = new List<Comment>();
    public ICollection<CommentLike> Likes { get; set; } = new List<CommentLike>();
}

public class CommentLike
{
    public Guid Id { get; set; }
    public Guid CommentId { get; set; }
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Comment? Comment { get; set; }
    public User? User { get; set; }
}

public class UserFollow
{
    public Guid Id { get; set; }
    public Guid FollowerId { get; set; }
    public Guid FolloweeId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? Follower { get; set; }
    public User? Followee { get; set; }
}
