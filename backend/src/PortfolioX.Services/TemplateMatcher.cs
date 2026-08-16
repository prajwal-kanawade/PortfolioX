using PortfolioX.Core.DTOs;

namespace PortfolioX.Services;

public static class TemplateMatcher
{
    private const string DefaultTemplateCode = "05_DEV";

    private static readonly Dictionary<string, string[]> KeywordsByTemplateCode = new()
    {
        ["01_MED"] = ["doctor", "physician", "medical", "medicine", "nurse", "surgeon", "clinical", "healthcare", "dentist", "therapist", "patient"],
        ["02_VIS"] = ["photographer", "photography", "photo", "videographer", "cinematography", "visual artist"],
        ["03_ART"] = ["designer", "graphic design", "ui designer", "ux designer", "illustrator", "brand designer", "product designer", "visual design"],
        ["04_ENG"] = ["lawyer", "attorney", "legal", "counsel", "paralegal", "advocate", "litigation", "law firm"],
        ["05_DEV"] = ["developer", "engineer", "programmer", "software", "full-stack", "full stack", "backend", "frontend", "devops", "coding", "web development"],
        ["06_WRIT"] = ["writer", "author", "copywriter", "journalist", "blogger", "editor", "content creator", "content writer"],
    };

    public static string Match(AiPortfolioDataDto data)
    {
        var text = BuildSearchText(data);

        var bestCode = DefaultTemplateCode;
        var bestScore = 0;

        foreach (var (code, keywords) in KeywordsByTemplateCode)
        {
            var score = keywords.Count(k => text.Contains(k, StringComparison.OrdinalIgnoreCase));
            if (score > bestScore)
            {
                bestScore = score;
                bestCode = code;
            }
        }

        return bestCode;
    }

    private static string BuildSearchText(AiPortfolioDataDto data)
    {
        var parts = new List<string?> { data.Title, data.Headline, data.AboutMe };
        parts.AddRange(data.Skills.Select(s => s.SkillName));
        parts.AddRange(data.Experiences.Select(e => e.JobTitle));
        parts.AddRange(data.Experiences.Select(e => e.CompanyName));
        parts.AddRange(data.Experiences.Select(e => e.Description));
        parts.AddRange(data.Projects.Select(p => p.Title));
        parts.AddRange(data.Projects.Select(p => p.Description));

        return string.Join(' ', parts.Where(p => !string.IsNullOrWhiteSpace(p)));
    }
}
