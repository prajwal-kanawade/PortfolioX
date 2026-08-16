using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PortfolioX.Core.DTOs;
using PortfolioX.Services;

namespace PortfolioX.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _settingsService;

    public SettingsController(ISettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    [HttpGet]
    public async Task<IActionResult> GetSettings()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var settings = await _settingsService.GetSettingsAsync(userId);
        return Ok(settings);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateUserSettingsRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var settings = await _settingsService.UpdateSettingsAsync(userId, request);
        return Ok(settings);
    }
}
