namespace PortfolioX.Core.Policies;

public abstract class SubscriptionPlanPolicy
{
    public abstract string TierName { get; }
    public abstract int MaxPortfolios { get; }
    public abstract int MaxProjectsPerPortfolio { get; }
    public abstract bool CanUseAiBuilder { get; }
    public abstract bool CanUseCustomDomain { get; }
    public abstract int AiCreditsPerMonth { get; }

    public virtual string PortfolioLimitMessage =>
        $"The {TierName} plan allows up to {MaxPortfolios} portfolio(s). Upgrade to Pro for more.";
}

public class FreePlanPolicy : SubscriptionPlanPolicy
{
    public override string TierName => "Free";
    public override int MaxPortfolios => 1;
    public override int MaxProjectsPerPortfolio => 5;
    public override bool CanUseAiBuilder => false;
    public override bool CanUseCustomDomain => false;
    public override int AiCreditsPerMonth => 0;
}

public class ProPlanPolicy : SubscriptionPlanPolicy
{
    public override string TierName => "Pro";
    public override int MaxPortfolios => 5;
    public override int MaxProjectsPerPortfolio => 50;
    public override bool CanUseAiBuilder => true;
    public override bool CanUseCustomDomain => true;
    public override int AiCreditsPerMonth => 100;
}
