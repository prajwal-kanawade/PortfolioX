using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PortfolioX.Core.DTOs;
using PortfolioX.Core.Entities;
using PortfolioX.Infrastructure;
using PortfolioX.Services;

namespace PortfolioX.API.Controllers;

[ApiController]
[Route("api/admin/settings")]
[Authorize]
public class AdminSettingsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ISiteSettingsService _siteSettingsService;
    private readonly IEmailTemplateService _templateService;
    private readonly IWebHostEnvironment _env;

    public AdminSettingsController(AppDbContext context, ISiteSettingsService siteSettingsService, IEmailTemplateService templateService, IWebHostEnvironment env)
    {
        _context = context;
        _siteSettingsService = siteSettingsService;
        _templateService = templateService;
        _env = env;
    }

    private bool IsAdmin()
    {
        return bool.TryParse(User.FindFirst("isadmin")?.Value, out var isAdmin) && isAdmin;
    }


    [HttpGet("general")]
    public async Task<IActionResult> GetGeneral()
    {
        if (!IsAdmin()) return Forbid();
        return Ok(await _siteSettingsService.GetAdminAsync());
    }

    [HttpPut("general")]
    public async Task<IActionResult> UpdateGeneral([FromBody] UpdateSiteSettingsRequest request)
    {
        if (!IsAdmin()) return Forbid();
        if (string.IsNullOrWhiteSpace(request.WebsiteName))
            return BadRequest(new { message = "Website name is required." });

        return Ok(await _siteSettingsService.UpdateAsync(request));
    }


    [HttpGet("plans")]
    public async Task<IActionResult> GetPlans()
    {
        if (!IsAdmin()) return Forbid();

        var plans = await _context.SubscriptionPlans
            .AsNoTracking()
            .Include(p => p.UserSubscriptions)
            .OrderBy(p => p.PriceMonthly)
            .ToListAsync();

        return Ok(plans.Select(ToPlanDto));
    }

    [HttpPost("plans")]
    public async Task<IActionResult> CreatePlan([FromBody] CreateSubscriptionPlanRequest request)
    {
        if (!IsAdmin()) return Forbid();
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Tier))
            return BadRequest(new { message = "Name and tier are required." });

        var plan = new SubscriptionPlan
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Tier = request.Tier,
            PriceMonthly = request.PriceMonthly,
            PriceAnnually = request.PriceAnnually,
            MaxPortfolios = request.MaxPortfolios,
            MaxProjects = request.MaxProjects,
            CustomDomain = request.CustomDomain,
            AiCredits = request.AiCredits,
            Features = string.IsNullOrWhiteSpace(request.Features) ? null : request.Features,
            IsActive = request.IsActive
        };

        _context.SubscriptionPlans.Add(plan);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Conflict(new { message = "A plan with that tier already exists." });
        }

        return CreatedAtAction(nameof(GetPlans), ToPlanDto(plan));
    }

    [HttpPut("plans/{id}")]
    public async Task<IActionResult> UpdatePlan(Guid id, [FromBody] UpdateSubscriptionPlanRequest request)
    {
        if (!IsAdmin()) return Forbid();

        var plan = await _context.SubscriptionPlans.FindAsync(id);
        if (plan == null) return NotFound();

        plan.Name = request.Name;
        plan.PriceMonthly = request.PriceMonthly;
        plan.PriceAnnually = request.PriceAnnually;
        plan.MaxPortfolios = request.MaxPortfolios;
        plan.MaxProjects = request.MaxProjects;
        plan.CustomDomain = request.CustomDomain;
        plan.AiCredits = request.AiCredits;
        plan.Features = string.IsNullOrWhiteSpace(request.Features) ? null : request.Features;
        plan.IsActive = request.IsActive;

        await _context.SaveChangesAsync();

        var reloaded = await _context.SubscriptionPlans.Include(p => p.UserSubscriptions).AsNoTracking().FirstAsync(p => p.Id == id);
        return Ok(ToPlanDto(reloaded));
    }

    [HttpDelete("plans/{id}")]
    public async Task<IActionResult> DeletePlan(Guid id)
    {
        if (!IsAdmin()) return Forbid();

        var plan = await _context.SubscriptionPlans.Include(p => p.UserSubscriptions).FirstOrDefaultAsync(p => p.Id == id);
        if (plan == null) return NotFound();

        if (plan.UserSubscriptions.Any())
            return BadRequest(new { message = "Cannot delete a plan with active subscribers. Deactivate it instead." });

        _context.SubscriptionPlans.Remove(plan);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static AdminSubscriptionPlanDto ToPlanDto(SubscriptionPlan p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Tier = p.Tier,
        PriceMonthly = p.PriceMonthly,
        PriceAnnually = p.PriceAnnually,
        MaxPortfolios = p.MaxPortfolios,
        MaxProjects = p.MaxProjects,
        CustomDomain = p.CustomDomain,
        AiCredits = p.AiCredits,
        Features = p.Features,
        IsActive = p.IsActive,
        ActiveSubscriberCount = p.UserSubscriptions?.Count(s => s.Status == "active") ?? 0,
        CreatedAt = p.CreatedAt
    };


    [HttpGet("payments")]
    public async Task<IActionResult> GetPayments()
    {
        if (!IsAdmin()) return Forbid();

        var payments = await _context.Payments
            .AsNoTracking()
            .Include(p => p.User)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new AdminPaymentDto
            {
                Id = p.Id,
                UserId = p.UserId,
                UserEmail = p.User!.Email,
                UserName = p.User.Username,
                Amount = p.Amount,
                Currency = p.Currency,
                PaymentMethod = p.PaymentMethod,
                Status = p.Status,
                TransactionId = p.TransactionId,
                RefundReason = p.RefundReason,
                RefundedAt = p.RefundedAt,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync();

        return Ok(payments);
    }

    [HttpPost("payments/{id}/refund")]
    public async Task<IActionResult> RefundPayment(Guid id, [FromBody] RefundPaymentRequest request)
    {
        if (!IsAdmin()) return Forbid();

        var payment = await _context.Payments.FindAsync(id);
        if (payment == null) return NotFound();

        if (payment.Status == "refunded")
            return BadRequest(new { message = "This payment has already been refunded." });

        payment.Status = "refunded";
        payment.RefundReason = request.Reason;
        payment.RefundedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Payment marked as refunded." });
    }


    [HttpGet("email-templates")]
    public async Task<IActionResult> GetEmailTemplates()
    {
        if (!IsAdmin()) return Forbid();
        return Ok(await _templateService.GetAllAsync());
    }

    [HttpGet("email-templates/{key}")]
    public async Task<IActionResult> GetEmailTemplate(string key)
    {
        if (!IsAdmin()) return Forbid();
        var template = await _templateService.GetByKeyAsync(key);
        return template == null ? NotFound() : Ok(template);
    }

    [HttpPut("email-templates/{key}")]
    public async Task<IActionResult> UpdateEmailTemplate(string key, [FromBody] UpdateEmailTemplateRequest request)
    {
        if (!IsAdmin()) return Forbid();
        if (string.IsNullOrWhiteSpace(request.Subject) || string.IsNullOrWhiteSpace(request.HtmlBody))
            return BadRequest(new { message = "Subject and body are required." });

        var updated = await _templateService.UpdateAsync(key, request.Subject, request.HtmlBody);
        return updated == null ? NotFound() : Ok(updated);
    }

    [HttpPost("email-templates/{key}/preview")]
    public IActionResult PreviewEmailTemplate(string key, [FromBody] PreviewEmailTemplateRequest request)
    {
        if (!IsAdmin()) return Forbid();

        var sample = SamplePlaceholders(key);
        var subject = ApplySample(request.Subject, sample);
        var html = ApplySample(request.HtmlBody, sample);

        return Ok(new EmailTemplatePreviewDto { Subject = subject, Html = html });
    }

    private static Dictionary<string, string> SamplePlaceholders(string key) => key switch
    {
        "registration_otp" or "password_reset" => new() { ["otp"] = "482913", ["expiryMinutes"] = "10" },
        "new_device_login" => new() { ["verifyUrl"] = "https://example.com/verify-login?token=sample" },
        "password_changed" => new(),
        "contact_message" => new() { ["visitorName"] = "Jamie Rivera", ["visitorEmail"] = "jamie@example.com", ["portfolioTitle"] = "Jamie's Portfolio", ["message"] = "I loved your work - let's talk!" },
        "appointment_confirmation" => new() { ["visitorName"] = "Jamie Rivera", ["portfolioTitle"] = "Dr. Smith's Practice", ["appointmentDate"] = "August 12, 2026", ["timeSlot"] = "10:30 AM", ["note"] = "<p>Note: First-time visit</p>" },
        "welcome" => new() { ["firstName"] = "Jamie", ["loginUrl"] = "https://example.com/login" },
        "subscription_reminder" => new() { ["firstName"] = "Jamie", ["expiryDate"] = "August 12, 2026", ["upgradeUrl"] = "https://example.com/upgrade" },
        "admin_new_registration" => new() { ["websiteName"] = "PortfolioX", ["userEmail"] = "jamie@example.com", ["username"] = "jamierivera" },
        "admin_payment_received" => new() { ["websiteName"] = "PortfolioX", ["userEmail"] = "jamie@example.com", ["currency"] = "INR", ["amount"] = "1500.00", ["planName"] = "Pro Plan" },
        _ => new()
    };

    private static string ApplySample(string text, Dictionary<string, string> sample)
    {
        foreach (var (k, v) in sample)
            text = text.Replace($"{{{{{k}}}}}", v);
        return text;
    }


    [HttpGet("system/storage")]
    public IActionResult GetStorageUsage()
    {
        if (!IsAdmin()) return Forbid();

        var uploadsRoot = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads");
        var breakdown = new List<StorageBreakdownItemDto>();
        long total = 0;

        if (Directory.Exists(uploadsRoot))
        {
            foreach (var dir in Directory.GetDirectories(uploadsRoot))
            {
                var bytes = new DirectoryInfo(dir).EnumerateFiles("*", SearchOption.AllDirectories).Sum(f => f.Length);
                breakdown.Add(new StorageBreakdownItemDto { Folder = Path.GetFileName(dir), Bytes = bytes });
                total += bytes;
            }

            var rootFiles = new DirectoryInfo(uploadsRoot).EnumerateFiles().Sum(f => f.Length);
            if (rootFiles > 0)
            {
                breakdown.Add(new StorageBreakdownItemDto { Folder = "(root)", Bytes = rootFiles });
                total += rootFiles;
            }
        }

        return Ok(new StorageUsageDto { TotalBytes = total, Breakdown = breakdown });
    }

    [HttpGet("system/backup")]
    public async Task<IActionResult> DownloadBackup()
    {
        if (!IsAdmin()) return Forbid();

        var backup = new
        {
            ExportedAt = DateTime.UtcNow,
            Users = await _context.Users.AsNoTracking().ToListAsync(),
            Portfolios = await _context.Portfolios.AsNoTracking().ToListAsync(),
            Subscriptions = await _context.UserSubscriptions.AsNoTracking().ToListAsync(),
            Plans = await _context.SubscriptionPlans.AsNoTracking().ToListAsync(),
            Payments = await _context.Payments.AsNoTracking().ToListAsync(),
            SiteSettings = await _context.SiteSettings.AsNoTracking().ToListAsync(),
            EmailTemplates = await _context.EmailTemplates.AsNoTracking().ToListAsync()
        };

        var json = System.Text.Json.JsonSerializer.Serialize(backup, new System.Text.Json.JsonSerializerOptions { WriteIndented = true });
        var bytes = System.Text.Encoding.UTF8.GetBytes(json);
        return File(bytes, "application/json", $"portfoliox-backup-{DateTime.UtcNow:yyyy-MM-dd}.json");
    }

    [HttpGet("system/error-logs")]
    public async Task<IActionResult> GetErrorLogs()
    {
        if (!IsAdmin()) return Forbid();

        var logs = await _context.ErrorLogs
            .AsNoTracking()
            .OrderByDescending(l => l.CreatedAt)
            .Take(200)
            .Select(l => new ErrorLogDto
            {
                Id = l.Id,
                Message = l.Message,
                StackTrace = l.StackTrace,
                Path = l.Path,
                HttpMethod = l.HttpMethod,
                StatusCode = l.StatusCode,
                CreatedAt = l.CreatedAt
            })
            .ToListAsync();

        return Ok(logs);
    }
}
