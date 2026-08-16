using PortfolioX.Core.DTOs;

namespace PortfolioX.Services.Scoring;

public class HasPhotoRule : IPortfolioScoringRule
{
    private const int Max = 10;

    public (int, int, string) Evaluate(PortfolioDto portfolio) =>
        !string.IsNullOrWhiteSpace(portfolio.PhotoUrl)
            ? (Max, Max, "")
            : (0, Max, "Add a profile photo — portfolios with a photo get more views.");
}

public class BioLengthRule : IPortfolioScoringRule
{
    private const int Max = 20;
    private const int TargetLength = 100;

    public (int, int, string) Evaluate(PortfolioDto portfolio)
    {
        var length = portfolio.AboutMe?.Trim().Length ?? 0;
        var points = Math.Min(Max, (int)Math.Round(Max * Math.Min(1.0, (double)length / TargetLength)));
        return (points, Max, "Write a fuller \"About Me\" (aim for at least 2-3 sentences).");
    }
}

public class MinSkillCountRule : IPortfolioScoringRule
{
    private const int Max = 15;
    private const int TargetCount = 5;

    public (int, int, string) Evaluate(PortfolioDto portfolio)
    {
        var count = portfolio.Skills.Count;
        var points = Math.Min(Max, (int)Math.Round(Max * Math.Min(1.0, (double)count / TargetCount)));
        return (points, Max, $"List at least {TargetCount} skills (you have {count}).");
    }
}

public class HasExperienceOrProjectRule : IPortfolioScoringRule
{
    private const int Max = 25;

    public (int, int, string) Evaluate(PortfolioDto portfolio) =>
        portfolio.Experiences.Count > 0 || portfolio.Projects.Count > 0
            ? (Max, Max, "")
            : (0, Max, "Add at least one work experience or project.");
}

public class ProjectDescriptionQualityRule : IPortfolioScoringRule
{
    private const int Max = 30;
    private const int MinDescriptionLength = 40;

    public (int, int, string) Evaluate(PortfolioDto portfolio)
    {
        if (portfolio.Projects.Count == 0)
            return (0, Max, "Add a project with a detailed description of what you built.");

        var qualityCount = portfolio.Projects.Count(p => (p.Description?.Trim().Length ?? 0) >= MinDescriptionLength);
        var points = (int)Math.Round(Max * ((double)qualityCount / portfolio.Projects.Count));
        return (points, Max, "Write richer descriptions for your projects (what you built, tools used, impact).");
    }
}
