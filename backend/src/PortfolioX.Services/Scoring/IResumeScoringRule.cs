using PortfolioX.Core.DTOs;

namespace PortfolioX.Services.Scoring;

public interface IResumeScoringRule
{
    (int Points, int MaxPoints, string Suggestion) Evaluate(ResumeDto resume, string? jobDescription);
}
