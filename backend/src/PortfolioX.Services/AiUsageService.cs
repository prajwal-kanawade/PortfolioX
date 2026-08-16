using Microsoft.EntityFrameworkCore;
using PortfolioX.Core.Policies;
using PortfolioX.Infrastructure;

namespace PortfolioX.Services;

public interface IAiUsageService
{
    Task<(bool Allowed, int Remaining, int Limit, string? Error)> CheckAndConsumeAsync(Guid userId);
    Task<(int Used, int Limit, DateTime? ResetAt)> GetUsageAsync(Guid userId);
}

public class AiUsageService : IAiUsageService
{
    private const int CreditWindowDays = 30;

    private readonly AppDbContext _context;

    public AiUsageService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(bool Allowed, int Remaining, int Limit, string? Error)> CheckAndConsumeAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return (false, 0, 0, "User not found.");

        var policy = SubscriptionPlanPolicyFactory.ForTier(user.SubscriptionTier);
        if (!policy.CanUseAiBuilder)
            return (false, 0, policy.AiCreditsPerMonth, "AI features require a Pro subscription.");

        var subscription = await _context.UserSubscriptions.FirstOrDefaultAsync(s => s.UserId == userId);
        if (subscription == null)
            return (false, 0, policy.AiCreditsPerMonth, "No active subscription found.");

        if (subscription.AiCreditsResetAt == null || DateTime.UtcNow > subscription.AiCreditsResetAt)
        {
            subscription.AiCreditsUsed = 0;
            subscription.AiCreditsResetAt = DateTime.UtcNow.AddDays(CreditWindowDays);
        }

        if (subscription.AiCreditsUsed >= policy.AiCreditsPerMonth)
        {
            await _context.SaveChangesAsync();
            return (false, 0, policy.AiCreditsPerMonth,
                $"AI credit limit reached for this month. Resets on {subscription.AiCreditsResetAt:MMM d, yyyy}.");
        }

        subscription.AiCreditsUsed++;
        await _context.SaveChangesAsync();

        return (true, policy.AiCreditsPerMonth - subscription.AiCreditsUsed, policy.AiCreditsPerMonth, null);
    }

    public async Task<(int Used, int Limit, DateTime? ResetAt)> GetUsageAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        var policy = SubscriptionPlanPolicyFactory.ForTier(user?.SubscriptionTier);

        var subscription = await _context.UserSubscriptions.AsNoTracking().FirstOrDefaultAsync(s => s.UserId == userId);

        return (subscription?.AiCreditsUsed ?? 0, policy.AiCreditsPerMonth, subscription?.AiCreditsResetAt);
    }
}
