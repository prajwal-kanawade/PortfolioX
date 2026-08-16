using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PortfolioX.Services;

namespace PortfolioX.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var result = await _notificationService.GetForUserAsync(userId);
        return Ok(result);
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkRead(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var success = await _notificationService.MarkReadAsync(id, userId);
        return success ? NoContent() : NotFound();
    }
}
