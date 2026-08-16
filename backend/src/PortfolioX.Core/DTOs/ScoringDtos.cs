namespace PortfolioX.Core.DTOs;

public class ScoreSuggestionDto
{
    public int Points { get; set; }
    public int MaxPoints { get; set; }
    public string Suggestion { get; set; } = null!;
}

public class ScoreResultDto
{
    public int Score { get; set; }
    public List<ScoreSuggestionDto> Suggestions { get; set; } = [];
}
