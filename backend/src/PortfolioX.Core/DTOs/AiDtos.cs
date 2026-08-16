namespace PortfolioX.Core.DTOs;

public class AiChatMessageDto
{
    public string Role { get; set; } = null!;
    public string Content { get; set; } = null!;
}

public class AiChatRequest
{
    public List<AiChatMessageDto> Messages { get; set; } = [];
}

public class AiChatResponse
{
    public string Reply { get; set; } = null!;
    public bool ReadyToGenerate { get; set; }
    public AiPortfolioDataDto? Data { get; set; }
}

public class AiPortfolioDataDto
{
    public string Title { get; set; } = null!;
    public string? Headline { get; set; }
    public string? AboutMe { get; set; }
    public List<AiSkillDto> Skills { get; set; } = [];
    public List<AiExperienceDto> Experiences { get; set; } = [];
    public List<AiEducationDto> Educations { get; set; } = [];
    public List<AiProjectDto> Projects { get; set; } = [];
}

public class AiSkillDto
{
    public string SkillName { get; set; } = null!;
    public string ProficiencyLevel { get; set; } = "intermediate";
}

public class AiExperienceDto
{
    public string JobTitle { get; set; } = null!;
    public string CompanyName { get; set; } = null!;
    public string? Location { get; set; }
    public string? Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsCurrent { get; set; }
}

public class AiEducationDto
{
    public string InstitutionName { get; set; } = null!;
    public string? Degree { get; set; }
    public string? FieldOfStudy { get; set; }
    public DateTime? GraduationDate { get; set; }
    public string? Description { get; set; }
}

public class AiProjectDto
{
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? Technologies { get; set; }
}

public class GeneratePortfolioRequest
{
    public Guid TemplateId { get; set; }
    public AiPortfolioDataDto Data { get; set; } = null!;
}

public class AiResumeChatResponse
{
    public string Reply { get; set; } = null!;
    public bool ReadyToGenerate { get; set; }
    public AiResumeDataDto? Data { get; set; }
}

public class AiResumeDataDto
{
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? Location { get; set; }
    public string? Summary { get; set; }
    public List<AiResumeExperienceDto> Experiences { get; set; } = [];
    public List<AiResumeEducationDto> Educations { get; set; } = [];
    public List<AiResumeSkillCategoryDto> SkillCategories { get; set; } = [];
}

public class AiResumeExperienceDto
{
    public string JobTitle { get; set; } = null!;
    public string CompanyName { get; set; } = null!;
    public string? Location { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public List<string> Bullets { get; set; } = [];
}

public class AiResumeEducationDto
{
    public string Degree { get; set; } = null!;
    public string University { get; set; } = null!;
    public DateTime? GraduationDate { get; set; }
    public List<string> Bullets { get; set; } = [];
}

public class AiResumeSkillCategoryDto
{
    public string CategoryName { get; set; } = null!;
    public string Content { get; set; } = null!;
}

public class GenerateResumeRequest
{
    public AiResumeDataDto Data { get; set; } = null!;
}

public class AiSuggestRequest
{
    public string Category { get; set; } = null!;
    public string Field { get; set; } = null!;
    public string? Context { get; set; }
}

public class AiSuggestResponse
{
    public List<string> Suggestions { get; set; } = [];
}
