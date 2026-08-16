using PortfolioX.Core.DTOs;

namespace PortfolioX.Services.Scoring;

public class ResumeScoreCalculator
{
    private static readonly IResumeScoringRule[] Rules =
    [
        new HasContactInfoRule(),
        new HasSummaryRule(),
        new MinExperienceBulletsRule(),
        new KeywordMatchRule()
    ];

    public ScoreResultDto Calculate(ResumeDto resume, string? jobDescription)
    {
        var evaluations = Rules.Select(rule => rule.Evaluate(resume, jobDescription)).ToList();

        var score = evaluations.Sum(e => e.Points);

        var suggestions = evaluations
            .Where(e => e.Points < e.MaxPoints)
            .OrderByDescending(e => e.MaxPoints - e.Points)
            .Select(e => new ScoreSuggestionDto { Points = e.Points, MaxPoints = e.MaxPoints, Suggestion = e.Suggestion })
            .ToList();

        return new ScoreResultDto { Score = score, Suggestions = suggestions };
    }
}
