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
[Route("api/[controller]")]
[Authorize]
public class BillingController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IUserService _userService;
    private readonly IEmailService _emailService;
    private readonly IEmailTemplateService _templateService;
    private readonly IRazorpayService _razorpayService;

    public BillingController(AppDbContext context, IUserService userService, IEmailService emailService, IEmailTemplateService templateService, IRazorpayService razorpayService)
    {
        _context = context;
        _userService = userService;
        _emailService = emailService;
        _templateService = templateService;
        _razorpayService = razorpayService;
    }

    [HttpPost("razorpay/create-order")]
    public async Task<IActionResult> CreateRazorpayOrder()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");

        var plan = await _context.SubscriptionPlans.FirstOrDefaultAsync(p => p.Tier == "pro");
        if (plan == null) return BadRequest("Pro plan is not configured");

        var order = await _razorpayService.CreateOrderAsync(plan.PriceMonthly, "INR", $"pro-{userId:N}"[..12] + $"-{DateTime.UtcNow.Ticks}");

        return Ok(new CreateRazorpayOrderResponse
        {
            OrderId = order.OrderId,
            AmountInPaise = order.AmountInPaise,
            Currency = order.Currency,
            KeyId = order.KeyId
        });
    }

    [HttpPost("razorpay/verify")]
    public async Task<IActionResult> VerifyRazorpayPayment([FromBody] VerifyRazorpayPaymentRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (!_razorpayService.VerifyPaymentSignature(request.RazorpayOrderId, request.RazorpayPaymentId, request.RazorpaySignature))
            return BadRequest(new { message = "Payment verification failed - signature mismatch." });

        var plan = await _context.SubscriptionPlans.FirstOrDefaultAsync(p => p.Tier == "pro");
        if (plan == null) return BadRequest("Pro plan is not configured");

        var subscription = await _context.UserSubscriptions.FirstOrDefaultAsync(s => s.UserId == userId);
        if (subscription == null)
        {
            subscription = new UserSubscription
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                PlanId = plan.Id,
                Status = "active",
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(30),
                AutoRenew = true
            };
            _context.UserSubscriptions.Add(subscription);
        }
        else
        {
            subscription.PlanId = plan.Id;
            subscription.Status = "active";
            subscription.StartDate = DateTime.UtcNow;
            subscription.EndDate = DateTime.UtcNow.AddDays(30);
            subscription.AutoRenew = true;
            subscription.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        _context.Payments.Add(new Payment
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            SubscriptionId = subscription.Id,
            Amount = plan.PriceMonthly,
            Currency = "INR",
            PaymentMethod = "razorpay",
            Status = "completed",
            TransactionId = request.RazorpayPaymentId
        });

        user.SubscriptionTier = "pro";
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var siteSettings = await _context.SiteSettings.AsNoTracking().FirstOrDefaultAsync(s => s.Id == 1);
        if (siteSettings?.NotifyAdminPaymentSuccess == true && !string.IsNullOrWhiteSpace(siteSettings.AdminAlertEmail))
        {
            try
            {
                var (subject, html) = await _templateService.RenderAsync("admin_payment_received", new Dictionary<string, string>
                {
                    ["websiteName"] = siteSettings.WebsiteName,
                    ["userEmail"] = user.Email,
                    ["currency"] = "INR",
                    ["amount"] = plan.PriceMonthly.ToString("0.00"),
                    ["planName"] = plan.Name
                });
                await _emailService.SendAsync(siteSettings.AdminAlertEmail, subject, html, isHtml: true);
            }
            catch
            {
            }
        }

        var updated = await _userService.GetUserByIdAsync(userId);
        return Ok(updated);
    }

    [HttpPost("downgrade")]
    public async Task<IActionResult> Downgrade()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        var subscription = await _context.UserSubscriptions.FirstOrDefaultAsync(s => s.UserId == userId);
        if (subscription != null)
        {
            subscription.Status = "cancelled";
            subscription.UpdatedAt = DateTime.UtcNow;
        }

        user.SubscriptionTier = "free";
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var updated = await _userService.GetUserByIdAsync(userId);
        return Ok(updated);
    }

    [HttpGet("my-subscription")]
    public async Task<IActionResult> GetMySubscription()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        var subscription = await _context.UserSubscriptions.AsNoTracking().FirstOrDefaultAsync(s => s.UserId == userId);

        return Ok(new MySubscriptionDto
        {
            Tier = user.SubscriptionTier,
            Status = subscription?.Status,
            StartDate = subscription?.StartDate,
            EndDate = subscription?.EndDate,
            AutoRenew = subscription?.AutoRenew ?? false
        });
    }

    [HttpGet("payments")]
    public async Task<IActionResult> GetPayments()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");

        var payments = await _context.Payments
            .AsNoTracking()
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new PaymentHistoryDto
            {
                Id = p.Id,
                Amount = p.Amount,
                Currency = p.Currency,
                PaymentMethod = p.PaymentMethod,
                Status = p.Status,
                TransactionId = p.TransactionId,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync();

        return Ok(payments);
    }
}
