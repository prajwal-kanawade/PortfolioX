using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PortfolioX.Core.DTOs;
using PortfolioX.Infrastructure;
using PortfolioX.Services;

namespace PortfolioX.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminController : ControllerBase
{
    private const int AnalyticsWindowDays = 30;

    private readonly IUserService _userService;
    private readonly AppDbContext _context;

    public AdminController(IUserService userService, AppDbContext context)
    {
        _userService = userService;
        _context = context;
    }

    private bool IsAdmin()
    {
        return bool.TryParse(User.FindFirst("isadmin")?.Value, out var isAdmin) && isAdmin;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        if (!IsAdmin())
            return Forbid();

        var users = await _context.Users
            .AsNoTracking()
            .Include(u => u.Portfolios)
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new AdminUserDto
            {
                Id = u.Id,
                Email = u.Email,
                Username = u.Username,
                FirstName = u.FirstName,
                LastName = u.LastName,
                ProfilePhotoUrl = u.ProfilePhotoUrl,
                IsAdmin = false,
                SubscriptionTier = u.SubscriptionTier,
                IsBanned = u.IsBanned,
                IsApproved = u.IsApproved,
                CreatedAt = u.CreatedAt,
                Portfolios = u.Portfolios.Select(p => new AdminUserPortfolioDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Slug = p.Slug
                }).ToList()
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("users/{userId}")]
    public async Task<IActionResult> GetUser(Guid userId)
    {
        if (!IsAdmin())
            return Forbid();

        var user = await _userService.GetUserByIdAsync(userId);
        return user == null ? NotFound() : Ok(user);
    }

    [HttpDelete("users/{userId}")]
    public async Task<IActionResult> DeleteUser(Guid userId)
    {
        if (!IsAdmin())
            return Forbid();

        var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        if (userId == currentUserId)
            return BadRequest(new { message = "Cannot delete your own account" });

        var success = await _userService.DeleteUserAsync(userId);
        return success ? Ok(new { message = "User deleted" }) : NotFound();
    }

    [HttpPost("users/{userId}/ban")]
    public async Task<IActionResult> BanUser(Guid userId, [FromBody] BanUserRequest request)
    {
        if (!IsAdmin())
            return Forbid();

        var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        if (userId == currentUserId)
            return BadRequest(new { message = "Cannot ban your own account" });

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        user.IsBanned = true;
        user.BannedAt = DateTime.UtcNow;
        user.BanReason = request.Reason;
        await _context.SaveChangesAsync();

        return Ok(new { message = "User suspended" });
    }

    [HttpPost("users/{userId}/unban")]
    public async Task<IActionResult> UnbanUser(Guid userId)
    {
        if (!IsAdmin())
            return Forbid();

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        user.IsBanned = false;
        user.BannedAt = null;
        user.BanReason = null;
        await _context.SaveChangesAsync();

        return Ok(new { message = "User unsuspended" });
    }

    [HttpPost("users/{userId}/approve")]
    public async Task<IActionResult> ApproveUser(Guid userId)
    {
        if (!IsAdmin())
            return Forbid();

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        user.IsApproved = true;
        await _context.SaveChangesAsync();

        return Ok(new { message = "User approved" });
    }

    [HttpPost("users/delete-inactive")]
    public async Task<IActionResult> DeleteInactiveUsers([FromQuery] int days = 90)
    {
        if (!IsAdmin())
            return Forbid();

        var cutoff = DateTime.UtcNow.AddDays(-days);
        var everLoggedInUserIds = await _context.LoginAuditLogs
            .Where(l => l.Success && l.UserId != null)
            .Select(l => l.UserId!.Value)
            .Distinct()
            .ToListAsync();

        var candidates = await _context.Users
            .Where(u => u.CreatedAt < cutoff && !everLoggedInUserIds.Contains(u.Id))
            .ToListAsync();

        _context.Users.RemoveRange(candidates);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Deleted {candidates.Count} inactive user(s)", deletedCount = candidates.Count });
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        if (!IsAdmin())
            return Forbid();

        var stats = new AdminStatsDto
        {
            TotalUsers = await _context.Users.CountAsync(),
            TotalPortfolios = await _context.Portfolios.CountAsync(),
            TotalViews = await _context.Portfolios.SumAsync(p => p.ViewCount),
            ActiveSubscriptions = await _context.UserSubscriptions
                .Include(s => s.Plan)
                .CountAsync(s => s.Status == "active" && s.Plan!.Tier == "pro")
        };

        return Ok(stats);
    }

    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics()
    {
        if (!IsAdmin())
            return Forbid();

        var since = DateTime.UtcNow.Date.AddDays(-(AnalyticsWindowDays - 1));

        var rawSignups = await _context.Users
            .Where(u => u.CreatedAt >= since)
            .GroupBy(u => u.CreatedAt.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToListAsync();

        var signupsByDay = Enumerable.Range(0, AnalyticsWindowDays)
            .Select(offset => since.AddDays(offset))
            .Select(date => new DayCountDto
            {
                Date = date,
                Count = rawSignups.FirstOrDefault(s => s.Date == date)?.Count ?? 0
            })
            .ToList();

        var templatePopularity = await _context.Portfolios
            .Include(p => p.Template)
            .GroupBy(p => p.Template!.Name)
            .Select(g => new NameCountDto { Name = g.Key, Count = g.Count() })
            .OrderByDescending(t => t.Count)
            .ToListAsync();

        var analytics = new AdminAnalyticsDto
        {
            SignupsByDay = signupsByDay,
            TemplatePopularity = templatePopularity,
            SubscriptionBreakdown = new SubscriptionBreakdownDto
            {
                Free = await _context.Users.CountAsync(u => u.SubscriptionTier == "free"),
                Pro = await _context.Users.CountAsync(u => u.SubscriptionTier == "pro")
            }
        };

        return Ok(analytics);
    }

    [HttpGet("complaints")]
    public async Task<IActionResult> GetComplaints()
    {
        if (!IsAdmin())
            return Forbid();

        var complaints = await _context.UserComplaints
            .AsNoTracking()
            .Include(c => c.User)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new AdminComplaintDto
            {
                Id = c.Id,
                UserName = c.User!.Username,
                UserEmail = c.User.Email,
                Subject = c.Subject,
                Message = c.Message,
                Status = c.Status,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return Ok(complaints);
    }

    [HttpPut("complaints/{id}/resolve")]
    public async Task<IActionResult> ResolveComplaint(Guid id)
    {
        if (!IsAdmin())
            return Forbid();

        var complaint = await _context.UserComplaints.FindAsync(id);
        if (complaint == null) return NotFound();

        complaint.Status = "resolved";
        await _context.SaveChangesAsync();

        return Ok(new { message = "Complaint marked resolved" });
    }

    [HttpGet("bug-reports")]
    public async Task<IActionResult> GetBugReports()
    {
        if (!IsAdmin())
            return Forbid();

        var bugReports = await _context.BugReports
            .AsNoTracking()
            .Include(b => b.User)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new AdminBugReportDto
            {
                Id = b.Id,
                UserName = b.User!.Username,
                UserEmail = b.User.Email,
                Description = b.Description,
                PageUrl = b.PageUrl,
                Status = b.Status,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync();

        return Ok(bugReports);
    }

    [HttpPut("bug-reports/{id}/resolve")]
    public async Task<IActionResult> ResolveBugReport(Guid id)
    {
        if (!IsAdmin())
            return Forbid();

        var bugReport = await _context.BugReports.FindAsync(id);
        if (bugReport == null) return NotFound();

        bugReport.Status = "resolved";
        await _context.SaveChangesAsync();

        return Ok(new { message = "Bug report marked resolved" });
    }
}
