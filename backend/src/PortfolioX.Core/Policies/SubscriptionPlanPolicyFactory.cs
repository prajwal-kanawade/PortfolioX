namespace PortfolioX.Core.Policies;

public static class SubscriptionPlanPolicyFactory
{
    public static SubscriptionPlanPolicy ForTier(string? tier) => tier switch
    {
        "pro" => new ProPlanPolicy(),
        _ => new FreePlanPolicy()
    };
}
