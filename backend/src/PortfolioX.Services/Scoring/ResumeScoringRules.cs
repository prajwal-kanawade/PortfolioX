using PortfolioX.Core.DTOs;

namespace PortfolioX.Services.Scoring;

public class HasContactInfoRule : IResumeScoringRule
{
    private const int Max = 20;

    public (int, int, string) Evaluate(ResumeDto resume, string? jobDescription)
    {
        var present = new[] { resume.Phone, resume.Email, resume.LinkedInUrl }.Count(v => !string.IsNullOrWhiteSpace(v));
        var points = (int)Math.Round(Max * (present / 3.0));
        return (points, Max, "Add phone, email, and LinkedIn so recruiters can reach you.");
    }
}

public class HasSummaryRule : IResumeScoringRule
{
    private const int Max = 25;
    private const int TargetLength = 80;

    public (int, int, string) Evaluate(ResumeDto resume, string? jobDescription)
    {
        var length = resume.Summary?.Trim().Length ?? 0;
        var points = Math.Min(Max, (int)Math.Round(Max * Math.Min(1.0, (double)length / TargetLength)));
        return (points, Max, "Write a 2-3 sentence professional summary at the top of your resume.");
    }
}

public class MinExperienceBulletsRule : IResumeScoringRule
{
    private const int Max = 30;
    private const int TargetBullets = 6;

    public (int, int, string) Evaluate(ResumeDto resume, string? jobDescription)
    {
        var bulletCount = resume.Experiences.Sum(e => e.Bullets.Count(b => !string.IsNullOrWhiteSpace(b)));
        var points = Math.Min(Max, (int)Math.Round(Max * Math.Min(1.0, (double)bulletCount / TargetBullets)));
        return (points, Max, "Add achievement-oriented bullet points (with numbers where possible) to each role.");
    }
}

public class KeywordMatchRule : IResumeScoringRule
{
    private const int Max = 25;

    private static readonly HashSet<string> StopWords =
    [
        "a", "an", "the", "and", "or", "of", "to", "in", "for", "with", "on", "at", "by", "is",
        "are", "as", "be", "this", "that", "will", "you", "your", "we", "our", "job", "role"
    ];

    public (int, int, string) Evaluate(ResumeDto resume, string? jobDescription)
    {
        if (string.IsNullOrWhiteSpace(jobDescription))
            return (Max, Max, "Paste a job description to see how well your resume's keywords match it.");

        var resumeText = string.Join(' ', new[] { resume.Summary }
            .Concat(resume.Experiences.SelectMany(e => e.Bullets))
            .Concat(resume.SkillCategories.Select(s => s.Content))
            .Where(t => !string.IsNullOrWhiteSpace(t)));

        var resumeTokens = Tokenize(resumeText);
        var jobTokens = Tokenize(jobDescription);

        if (jobTokens.Count == 0)
            return (Max, Max, "Paste a job description to see how well your resume's keywords match it.");

        var overlap = jobTokens.Intersect(resumeTokens).Count();
        var ratio = (double)overlap / jobTokens.Count;
        var points = (int)Math.Round(Max * Math.Min(1.0, ratio));

        return (points, Max, "Work more of the job description's key terms into your resume (skills, tools, titles).");
    }

    private static HashSet<string> Tokenize(string text) =>
        text.ToLowerInvariant()
            .Split([' ', '\t', '\n', '\r', ',', '.', ';', ':', '(', ')', '/', '-'], StringSplitOptions.RemoveEmptyEntries)
            .Where(w => w.Length > 2 && !StopWords.Contains(w))
            .ToHashSet();
}
