using PortfolioX.Core.DTOs;

namespace PortfolioX.Services.Scoring;

public class PortfolioScoreCalculator
{
    private static readonly IPortfolioScoringRule[] Rules =
    [
        new HasPhotoRule(),
        new BioLengthRule(),
        new MinSkillCountRule(),
        new HasExperienceOrProjectRule(),
        new ProjectDescriptionQualityRule()
    ];

    public ScoreResultDto Calculate(PortfolioDto portfolio)
    {
        var evaluations = Rules.Select(rule => rule.Evaluate(portfolio)).ToList();

        var score = evaluations.Sum(e => e.Points);

        var suggestions = evaluations
            .Where(e => e.Points < e.MaxPoints)
            .OrderByDescending(e => e.MaxPoints - e.Points)
            .Select(e => new ScoreSuggestionDto { Points = e.Points, MaxPoints = e.MaxPoints, Suggestion = e.Suggestion })
            .ToList();

        return new ScoreResultDto { Score = score, Suggestions = suggestions };
    }
}
