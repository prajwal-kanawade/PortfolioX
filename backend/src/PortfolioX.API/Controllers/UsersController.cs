using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PortfolioX.Core.DTOs;
using PortfolioX.Core.Entities;
using PortfolioX.Infrastructure;

namespace PortfolioX.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{id}/public-profile")]
    public async Task<IActionResult> GetPublicProfile(Guid id)
    {
        var row = await _context.Users.AsNoTracking()
            .Where(u => u.Id == id && u.IsActive && !u.IsBanned)
            .Where(u => u.Settings == null || u.Settings.IsProfilePublic)
            .Select(u => new { u.Id, u.Username, u.FirstName, u.LastName, u.Bio, u.ProfilePhotoUrl })
            .FirstOrDefaultAsync();

        if (row == null) return NotFound();

        var fullName = string.Join(" ", new[] { row.FirstName, row.LastName }.Where(s => !string.IsNullOrWhiteSpace(s)));

        Guid? viewerId = Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var vid) ? vid : null;
        var followerCount = await _context.UserFollows.CountAsync(f => f.FolloweeId == id);
        var followingCount = await _context.UserFollows.CountAsync(f => f.FollowerId == id);
        var isFollowedByMe = viewerId != null && await _context.UserFollows.AnyAsync(f => f.FollowerId == viewerId && f.FolloweeId == id);

        return Ok(new PublicUserProfileDto
        {
            Id = row.Id,
            Username = row.Username,
            FullName = string.IsNullOrWhiteSpace(fullName) ? null : fullName,
            Bio = row.Bio,
            AvatarUrl = row.ProfilePhotoUrl,
            FollowerCount = followerCount,
            FollowingCount = followingCount,
            IsFollowedByMe = isFollowedByMe
        });
    }

    [Authorize]
    [HttpPost("{id}/follow")]
    public async Task<IActionResult> ToggleFollow(Guid id)
    {
        var followerId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        if (followerId == id)
            return BadRequest(new { message = "You can't follow yourself." });

        var target = await _context.Users.FindAsync(id);
        if (target == null) return NotFound();

        var existing = await _context.UserFollows.FirstOrDefaultAsync(f => f.FollowerId == followerId && f.FolloweeId == id);

        bool following;
        if (existing != null)
        {
            _context.UserFollows.Remove(existing);
            following = false;
        }
        else
        {
            _context.UserFollows.Add(new UserFollow { Id = Guid.NewGuid(), FollowerId = followerId, FolloweeId = id });
            following = true;
        }
        await _context.SaveChangesAsync();

        var followerCount = await _context.UserFollows.CountAsync(f => f.FolloweeId == id);
        return Ok(new { following, followerCount });
    }

    [HttpGet("{id}/followers")]
    public async Task<IActionResult> GetFollowers(Guid id)
    {
        Guid? viewerId = Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var vid) ? vid : null;

        var followerIds = await _context.UserFollows.AsNoTracking()
            .Where(f => f.FolloweeId == id)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => f.FollowerId)
            .ToListAsync();

        var chips = await BuildUserChipsAsync(followerIds, viewerId);
        return Ok(chips);
    }

    [HttpGet("{id}/following")]
    public async Task<IActionResult> GetFollowing(Guid id)
    {
        Guid? viewerId = Guid.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var vid) ? vid : null;

        var followeeIds = await _context.UserFollows.AsNoTracking()
            .Where(f => f.FollowerId == id)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => f.FolloweeId)
            .ToListAsync();

        var chips = await BuildUserChipsAsync(followeeIds, viewerId);
        return Ok(chips);
    }

    private async Task<List<UserChipDto>> BuildUserChipsAsync(List<Guid> userIds, Guid? viewerId)
    {
        if (userIds.Count == 0) return [];

        var users = await _context.Users.AsNoTracking()
            .Where(u => userIds.Contains(u.Id))
            .Select(u => new { u.Id, u.Username, u.ProfilePhotoUrl })
            .ToDictionaryAsync(u => u.Id);

        var followedByViewer = viewerId == null
            ? new HashSet<Guid>()
            : (await _context.UserFollows.AsNoTracking()
                .Where(f => f.FollowerId == viewerId && userIds.Contains(f.FolloweeId))
                .Select(f => f.FolloweeId)
                .ToListAsync()).ToHashSet();

        return userIds
            .Where(id => users.ContainsKey(id))
            .Select(id => new UserChipDto
            {
                UserId = id,
                Username = users[id].Username,
                AvatarUrl = users[id].ProfilePhotoUrl,
                IsFollowedByMe = followedByViewer.Contains(id)
            })
            .ToList();
    }
}
