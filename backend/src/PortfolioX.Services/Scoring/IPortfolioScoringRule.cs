using PortfolioX.Core.DTOs;

namespace PortfolioX.Services.Scoring;

public interface IPortfolioScoringRule
{
    (int Points, int MaxPoints, string Suggestion) Evaluate(PortfolioDto portfolio);
}
