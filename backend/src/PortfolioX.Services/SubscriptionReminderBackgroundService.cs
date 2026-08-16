using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PortfolioX.Infrastructure;

namespace PortfolioX.Services;

public class SubscriptionReminderBackgroundService : BackgroundService
{
    private static readonly TimeSpan CheckInterval = TimeSpan.FromHours(6);
    private const int ReminderWindowDays = 3;

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SubscriptionReminderBackgroundService> _logger;

    public SubscriptionReminderBackgroundService(IServiceScopeFactory scopeFactory, ILogger<SubscriptionReminderBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(CheckInterval);
        do
        {
            try
            {
                await CheckAndSendRemindersAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Subscription reminder check failed");
            }
        } while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private async Task CheckAndSendRemindersAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var settingsService = scope.ServiceProvider.GetRequiredService<ISettingsService>();
        var templateService = scope.ServiceProvider.GetRequiredService<IEmailTemplateService>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

        var windowEnd = DateTime.UtcNow.AddDays(ReminderWindowDays);

        var expiring = await context.UserSubscriptions
            .Include(s => s.User)
            .Where(s => s.Status == "active" && s.EndDate != null && s.EndDate <= windowEnd && s.EndDate > DateTime.UtcNow)
            .ToListAsync(ct);

        foreach (var subscription in expiring)
        {
            if (subscription.User == null) continue;

            var shouldSend = await settingsService.ShouldSendNotificationAsync(subscription.User.Id, NotificationKind.SubscriptionReminder);
            if (!shouldSend) continue;

            var (subject, html) = await templateService.RenderAsync("subscription_reminder", new Dictionary<string, string>
            {
                ["firstName"] = subscription.User.FirstName ?? subscription.User.Username,
                ["expiryDate"] = subscription.EndDate!.Value.ToString("MMMM d, yyyy"),
                ["upgradeUrl"] = "/upgrade"
            });

            await emailService.SendAsync(subscription.User.Email, subject, html, isHtml: true);
        }
    }
}
