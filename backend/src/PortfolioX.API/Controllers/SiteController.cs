using Microsoft.AspNetCore.Mvc;
using PortfolioX.Services;

namespace PortfolioX.API.Controllers;

[ApiController]
[Route("api/site-settings")]
public class SiteController : ControllerBase
{
    private readonly ISiteSettingsService _siteSettingsService;

    public SiteController(ISiteSettingsService siteSettingsService)
    {
        _siteSettingsService = siteSettingsService;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        return Ok(await _siteSettingsService.GetPublicAsync());
    }
}
