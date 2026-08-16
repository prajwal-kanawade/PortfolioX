namespace PortfolioX.Core.DTOs;

public class PortfolioDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? Headline { get; set; }
    public string? AboutMe { get; set; }
    public string? PhotoUrl { get; set; }
    public bool IsPublished { get; set; }
    public bool SearchEngineVisible { get; set; } = true;
    public int PortfolioScore { get; set; }
    public int ViewCount { get; set; }
    public PortfolioTemplateDto? Template { get; set; }
    public List<PortfolioProjectDto> Projects { get; set; } = [];
    public List<PortfolioSkillDto> Skills { get; set; } = [];
    public List<PortfolioExperienceDto> Experiences { get; set; } = [];
    public List<PortfolioEducationDto> Educations { get; set; } = [];
    public List<PortfolioGalleryPhotoDto> GalleryPhotos { get; set; } = [];
    public List<PortfolioBookDto> Books { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int LikeCount { get; set; }
    public bool IsLikedByMe { get; set; }
}

public class CreatePortfolioRequest
{
    public Guid TemplateId { get; set; }
    public string Title { get; set; } = null!;
    public string? Headline { get; set; }
    public string? AboutMe { get; set; }
}

public class PortfolioCreationResult
{
    public PortfolioDto? Portfolio { get; set; }
    public string? Error { get; set; }
    public bool Success => Error == null;
}

public class UpdatePortfolioRequest
{
    public string? Title { get; set; }
    public string? Headline { get; set; }
    public string? AboutMe { get; set; }
    public bool? IsPublished { get; set; }
}

public class PortfolioExploreCardDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? Headline { get; set; }
    public string? PhotoUrl { get; set; }
    public int ViewCount { get; set; }
    public string? TemplateName { get; set; }
    public string? TemplateCategory { get; set; }
    public string? OwnerUsername { get; set; }
    public string? OwnerName { get; set; }
    public string? OwnerAvatarUrl { get; set; }
    public int LikeCount { get; set; }
    public bool IsLikedByMe { get; set; }
}

public class UserChipDto
{
    public Guid UserId { get; set; }
    public string Username { get; set; } = null!;
    public string? AvatarUrl { get; set; }
    public bool IsFollowedByMe { get; set; }
}

public class ContactPortfolioRequest
{
    public string VisitorName { get; set; } = null!;
    public string VisitorEmail { get; set; } = null!;
    public string Message { get; set; } = null!;
}

public class PortfolioTemplateDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string? ThumbnailUrl { get; set; }
}

public class PortfolioProjectDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string? ProjectUrl { get; set; }
    public string? GithubUrl { get; set; }
    public string? Technologies { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<ProjectLogEntryDto> LogEntries { get; set; } = [];
}

public class ProjectLogEntryDto
{
    public Guid Id { get; set; }
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}

public class CreateProjectLogEntryRequest
{
    public string Content { get; set; } = null!;
}

public class CreateProjectRequest
{
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string? ProjectUrl { get; set; }
    public string? GithubUrl { get; set; }
    public string? Technologies { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class PortfolioSkillDto
{
    public Guid Id { get; set; }
    public string SkillName { get; set; } = null!;
    public string ProficiencyLevel { get; set; } = null!;
    public int Endorsements { get; set; }
}

public class CreateSkillRequest
{
    public string SkillName { get; set; } = null!;
    public string ProficiencyLevel { get; set; } = "intermediate";
}

public class PortfolioExperienceDto
{
    public Guid Id { get; set; }
    public string JobTitle { get; set; } = null!;
    public string CompanyName { get; set; } = null!;
    public string? Location { get; set; }
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsCurrent { get; set; }
}

public class CreateExperienceRequest
{
    public string JobTitle { get; set; } = null!;
    public string CompanyName { get; set; } = null!;
    public string? Location { get; set; }
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsCurrent { get; set; }
}

public class PortfolioEducationDto
{
    public Guid Id { get; set; }
    public string InstitutionName { get; set; } = null!;
    public string? Degree { get; set; }
    public string? FieldOfStudy { get; set; }
    public DateTime? GraduationDate { get; set; }
    public string? Description { get; set; }
}

public class CreateEducationRequest
{
    public string InstitutionName { get; set; } = null!;
    public string? Degree { get; set; }
    public string? FieldOfStudy { get; set; }
    public DateTime? GraduationDate { get; set; }
    public string? Description { get; set; }
}

public class AppointmentDto
{
    public Guid Id { get; set; }
    public string VisitorName { get; set; } = null!;
    public string VisitorEmail { get; set; } = null!;
    public string? Note { get; set; }
    public DateTime AppointmentDate { get; set; }
    public string TimeSlot { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}

public class CreateAppointmentRequest
{
    public string VisitorName { get; set; } = null!;
    public string VisitorEmail { get; set; } = null!;
    public string? Note { get; set; }
    public DateTime AppointmentDate { get; set; }
    public string TimeSlot { get; set; } = null!;
}

public class AvailabilityResponse
{
    public DateTime Date { get; set; }
    public List<string> BookedSlots { get; set; } = [];
    public List<string> AllSlots { get; set; } = [];
}

public class PortfolioGalleryPhotoDto
{
    public Guid Id { get; set; }
    public string ImageUrl { get; set; } = null!;
    public string? Caption { get; set; }
}

public class PortfolioBookDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? Genre { get; set; }
    public int? PublishedYear { get; set; }
    public string? CoverImageUrl { get; set; }
}

public class CreateBookRequest
{
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? Genre { get; set; }
    public int? PublishedYear { get; set; }
}
