using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PortfolioX.Core.DTOs;
using PortfolioX.Core.Entities;
using PortfolioX.Infrastructure;
using PortfolioX.Services;

namespace PortfolioX.API.Controllers;

[ApiController]
[Route("api")]
public class CommentsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly INotificationService _notificationService;

    public CommentsController(AppDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    private bool IsAdmin() => bool.TryParse(User.FindFirst("isadmin")?.Value, out var isAdmin) && isAdmin;

    [HttpGet("portfolios/{portfolioId}/comments")]
    public async Task<IActionResult> GetComments(Guid portfolioId)
    {
        Guid? viewerId = Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var vid) ? vid : null;

        var comments = await _context.Comments
            .AsNoTracking()
            .Where(c => c.PortfolioId == portfolioId)
            .Include(c => c.User)
            .Include(c => c.Likes)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync();

        var repliesByParent = comments
            .Where(c => c.ParentCommentId != null)
            .GroupBy(c => c.ParentCommentId!.Value)
            .ToDictionary(g => g.Key, g => g.ToList());

        List<CommentDto> MapList(IEnumerable<Comment> list) => list.Select(c => new CommentDto
        {
            Id = c.Id,
            UserId = c.UserId,
            Username = c.User?.Username ?? "",
            AvatarUrl = c.User?.ProfilePhotoUrl,
            Content = c.Content,
            CreatedAt = c.CreatedAt,
            LikeCount = c.Likes.Count,
            IsLikedByMe = viewerId != null && c.Likes.Any(l => l.UserId == viewerId),
            Replies = repliesByParent.TryGetValue(c.Id, out var replies) ? MapList(replies) : []
        }).ToList();

        var topLevel = comments.Where(c => c.ParentCommentId == null).OrderByDescending(c => c.CreatedAt).ToList();
        return Ok(MapList(topLevel));
    }

    [Authorize]
    [HttpPost("portfolios/{portfolioId}/comments")]
    public async Task<IActionResult> AddComment(Guid portfolioId, [FromBody] CreateCommentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
            return BadRequest(new { message = "Comment cannot be empty." });

        var portfolio = await _context.Portfolios.FindAsync(portfolioId);
        if (portfolio == null) return NotFound();

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var comment = new Comment { Id = Guid.NewGuid(), PortfolioId = portfolioId, UserId = userId, Content = request.Content.Trim() };
        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        var commenter = await _context.Users.FindAsync(userId);

        if (portfolio.UserId != userId)
        {
            await _notificationService.CreateAsync(
                portfolio.UserId,
                "New comment",
                $"{commenter?.Username} commented on your portfolio {portfolio.Title}",
                "comment",
                $"/portfolio/{portfolio.Slug}#comment-{comment.Id}");
        }

        return Ok(new CommentDto
        {
            Id = comment.Id,
            UserId = userId,
            Username = commenter?.Username ?? "",
            AvatarUrl = commenter?.ProfilePhotoUrl,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            LikeCount = 0,
            IsLikedByMe = false,
            Replies = []
        });
    }

    [Authorize]
    [HttpPost("comments/{commentId}/replies")]
    public async Task<IActionResult> AddReply(Guid commentId, [FromBody] CreateCommentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
            return BadRequest(new { message = "Reply cannot be empty." });

        var parent = await _context.Comments
            .Include(c => c.User)
            .Include(c => c.Portfolio)
            .FirstOrDefaultAsync(c => c.Id == commentId);
        if (parent == null) return NotFound();
        if (parent.ParentCommentId != null)
            return BadRequest(new { message = "Cannot reply to a reply." });

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var reply = new Comment { Id = Guid.NewGuid(), PortfolioId = parent.PortfolioId, UserId = userId, ParentCommentId = parent.Id, Content = request.Content.Trim() };
        _context.Comments.Add(reply);
        await _context.SaveChangesAsync();

        var replier = await _context.Users.FindAsync(userId);

        if (parent.UserId != userId)
        {
            await _notificationService.CreateAsync(
                parent.UserId,
                "New reply",
                $"{replier?.Username} replied to your comment on {parent.Portfolio?.Title}",
                "reply",
                $"/portfolio/{parent.Portfolio?.Slug}#comment-{parent.Id}");
        }

        if (parent.Portfolio != null && parent.Portfolio.UserId != userId && parent.Portfolio.UserId != parent.UserId)
        {
            await _notificationService.CreateAsync(
                parent.Portfolio.UserId,
                "New reply",
                $"{replier?.Username} replied to {parent.User?.Username}'s comment on your portfolio {parent.Portfolio.Title}",
                "reply",
                $"/portfolio/{parent.Portfolio.Slug}#comment-{parent.Id}");
        }

        return Ok(new CommentDto
        {
            Id = reply.Id,
            UserId = userId,
            Username = replier?.Username ?? "",
            AvatarUrl = replier?.ProfilePhotoUrl,
            Content = reply.Content,
            CreatedAt = reply.CreatedAt,
            LikeCount = 0,
            IsLikedByMe = false,
            Replies = []
        });
    }

    [Authorize]
    [HttpPost("comments/{id}/like")]
    public async Task<IActionResult> ToggleCommentLike(Guid id)
    {
        var comment = await _context.Comments.FindAsync(id);
        if (comment == null) return NotFound();

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var existing = await _context.CommentLikes.FirstOrDefaultAsync(l => l.CommentId == id && l.UserId == userId);

        bool liked;
        if (existing != null)
        {
            _context.CommentLikes.Remove(existing);
            liked = false;
        }
        else
        {
            _context.CommentLikes.Add(new CommentLike { Id = Guid.NewGuid(), CommentId = id, UserId = userId });
            liked = true;
        }
        await _context.SaveChangesAsync();

        var likeCount = await _context.CommentLikes.CountAsync(l => l.CommentId == id);
        return Ok(new { liked, likeCount });
    }

    [Authorize]
    [HttpDelete("comments/{id}")]
    public async Task<IActionResult> DeleteComment(Guid id)
    {
        var comment = await _context.Comments.FindAsync(id);
        if (comment == null) return NotFound();

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        if (comment.UserId != userId && !IsAdmin())
            return Forbid();

        _context.Comments.Remove(comment);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
