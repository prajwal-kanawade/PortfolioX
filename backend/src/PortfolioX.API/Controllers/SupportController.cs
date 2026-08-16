using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PortfolioX.Core.DTOs;
using PortfolioX.Core.Entities;
using PortfolioX.Infrastructure;

namespace PortfolioX.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SupportController : ControllerBase
{
    private readonly AppDbContext _context;

    public SupportController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("complaints")]
    public async Task<IActionResult> SubmitComplaint([FromBody] SubmitComplaintRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Subject) || string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { message = "Subject and message are required." });

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");

        _context.UserComplaints.Add(new UserComplaint
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Subject = request.Subject,
            Message = request.Message
        });

        await _context.SaveChangesAsync();
        return Ok(new { message = "Your complaint has been submitted." });
    }

    [HttpPost("bug-reports")]
    public async Task<IActionResult> SubmitBugReport([FromBody] SubmitBugReportRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Description))
            return BadRequest(new { message = "Description is required." });

        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");

        _context.BugReports.Add(new BugReport
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Description = request.Description,
            PageUrl = request.PageUrl
        });

        await _context.SaveChangesAsync();
        return Ok(new { message = "Thanks - your bug report has been submitted." });
    }
}
