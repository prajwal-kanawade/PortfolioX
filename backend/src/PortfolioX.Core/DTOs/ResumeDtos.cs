namespace PortfolioX.Core.DTOs;

public class ResumeDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public bool IsPrimary { get; set; }
    public int AtsScore { get; set; }
    public string TemplateCode { get; set; } = "modern";
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? Location { get; set; }
    public string? Summary { get; set; }
    public List<ResumeExperienceDto> Experiences { get; set; } = [];
    public List<ResumeEducationDto> Educations { get; set; } = [];
    public List<ResumeSkillCategoryDto> SkillCategories { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateResumeRequest
{
    public string Title { get; set; } = null!;
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? Location { get; set; }
    public string? Summary { get; set; }
}

public class UpdateResumeRequest
{
    public string? Title { get; set; }
    public string? TemplateCode { get; set; }
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? Location { get; set; }
    public string? Summary { get; set; }
}

public class ResumeExperienceDto
{
    public Guid Id { get; set; }
    public string JobTitle { get; set; } = null!;
    public string CompanyName { get; set; } = null!;
    public string? Location { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public List<string> Bullets { get; set; } = [];
}

public class CreateResumeExperienceRequest
{
    public string JobTitle { get; set; } = null!;
    public string CompanyName { get; set; } = null!;
    public string? Location { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public List<string> Bullets { get; set; } = [];
}

public class ResumeEducationDto
{
    public Guid Id { get; set; }
    public string Degree { get; set; } = null!;
    public string University { get; set; } = null!;
    public DateTime? GraduationDate { get; set; }
    public List<string> Bullets { get; set; } = [];
}

public class CreateResumeEducationRequest
{
    public string Degree { get; set; } = null!;
    public string University { get; set; } = null!;
    public DateTime? GraduationDate { get; set; }
    public List<string> Bullets { get; set; } = [];
}

public class ResumeSkillCategoryDto
{
    public Guid Id { get; set; }
    public string CategoryName { get; set; } = null!;
    public string Content { get; set; } = null!;
}

public class CreateResumeSkillCategoryRequest
{
    public string CategoryName { get; set; } = null!;
    public string Content { get; set; } = null!;
}
