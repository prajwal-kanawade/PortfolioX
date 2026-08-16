namespace PortfolioX.Core.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? ProfilePhotoUrl { get; set; }
    public string? Bio { get; set; }
    public string SubscriptionTier { get; set; } = "free";
    public bool IsActive { get; set; } = true;
    public bool IsBanned { get; set; }
    public DateTime? BannedAt { get; set; }
    public string? BanReason { get; set; }
    public bool IsApproved { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Portfolio> Portfolios { get; set; } = new List<Portfolio>();
    public ICollection<Resume> Resumes { get; set; } = new List<Resume>();
    public ICollection<CoverLetter> CoverLetters { get; set; } = new List<CoverLetter>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public UserSubscription? Subscription { get; set; }
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<TrustedDevice> TrustedDevices { get; set; } = new List<TrustedDevice>();
    public ICollection<LoginVerificationToken> LoginVerificationTokens { get; set; } = new List<LoginVerificationToken>();
    public UserSettings? Settings { get; set; }
    public ICollection<PortfolioLike> PortfolioLikes { get; set; } = new List<PortfolioLike>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<CommentLike> CommentLikes { get; set; } = new List<CommentLike>();
    public ICollection<UserFollow> Following { get; set; } = new List<UserFollow>();
    public ICollection<UserFollow> Followers { get; set; } = new List<UserFollow>();
}

public class Portfolio
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid TemplateId { get; set; }
    public string Title { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? Headline { get; set; }
    public string? AboutMe { get; set; }
    public string? PhotoUrl { get; set; }
    public bool IsPublished { get; set; }
    public string? CustomDomain { get; set; }
    public int PortfolioScore { get; set; }
    public int ViewCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public PortfolioTemplate? Template { get; set; }
    public ICollection<PortfolioProject> Projects { get; set; } = new List<PortfolioProject>();
    public ICollection<PortfolioSkill> Skills { get; set; } = new List<PortfolioSkill>();
    public ICollection<PortfolioExperience> Experiences { get; set; } = new List<PortfolioExperience>();
    public ICollection<PortfolioEducation> Educations { get; set; } = new List<PortfolioEducation>();
    public ICollection<PortfolioView> Views { get; set; } = new List<PortfolioView>();
    public ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<PortfolioGalleryPhoto> GalleryPhotos { get; set; } = new List<PortfolioGalleryPhoto>();
    public ICollection<PortfolioBook> Books { get; set; } = new List<PortfolioBook>();
    public ICollection<PortfolioLike> Likes { get; set; } = new List<PortfolioLike>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}

public class PortfolioContactMessage
{
    public Guid Id { get; set; }
    public Guid PortfolioId { get; set; }
    public string VisitorName { get; set; } = null!;
    public string VisitorEmail { get; set; } = null!;
    public string Message { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Portfolio? Portfolio { get; set; }
}

public class PortfolioTemplate
{
    public Guid Id { get; set; }
    public string Code { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string? ThumbnailUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Portfolio> Portfolios { get; set; } = new List<Portfolio>();
}

public class PortfolioProject
{
    public Guid Id { get; set; }
    public Guid PortfolioId { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public string? ProjectUrl { get; set; }
    public string? GithubUrl { get; set; }
    public string? Technologies { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Portfolio? Portfolio { get; set; }
    public ICollection<ProjectLogEntry> LogEntries { get; set; } = new List<ProjectLogEntry>();
}

public class ProjectLogEntry
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public PortfolioProject? Project { get; set; }
}

public class PortfolioSkill
{
    public Guid Id { get; set; }
    public Guid PortfolioId { get; set; }
    public string SkillName { get; set; } = null!;
    public string ProficiencyLevel { get; set; } = "intermediate";
    public int Endorsements { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Portfolio? Portfolio { get; set; }
}

public class PortfolioExperience
{
    public Guid Id { get; set; }
    public Guid PortfolioId { get; set; }
    public string JobTitle { get; set; } = null!;
    public string CompanyName { get; set; } = null!;
    public string? Location { get; set; }
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Portfolio? Portfolio { get; set; }
}

public class PortfolioEducation
{
    public Guid Id { get; set; }
    public Guid PortfolioId { get; set; }
    public string InstitutionName { get; set; } = null!;
    public string? Degree { get; set; }
    public string? FieldOfStudy { get; set; }
    public DateTime? GraduationDate { get; set; }
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Portfolio? Portfolio { get; set; }
}

public class Resume
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = null!;
    public string? FileUrl { get; set; }
    public int AtsScore { get; set; }
    public bool IsPrimary { get; set; }
    public string TemplateCode { get; set; } = "modern";
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? Location { get; set; }
    public string? Summary { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public ICollection<ResumeExperience> Experiences { get; set; } = new List<ResumeExperience>();
    public ICollection<ResumeEducation> Educations { get; set; } = new List<ResumeEducation>();
    public ICollection<ResumeSkillCategory> SkillCategories { get; set; } = new List<ResumeSkillCategory>();
}

public class ResumeExperience
{
    public Guid Id { get; set; }
    public Guid ResumeId { get; set; }
    public string JobTitle { get; set; } = null!;
    public string CompanyName { get; set; } = null!;
    public string? Location { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public string? Bullets { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Resume? Resume { get; set; }
}

public class ResumeEducation
{
    public Guid Id { get; set; }
    public Guid ResumeId { get; set; }
    public string Degree { get; set; } = null!;
    public string University { get; set; } = null!;
    public DateTime? GraduationDate { get; set; }
    public string? Bullets { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Resume? Resume { get; set; }
}

public class ResumeSkillCategory
{
    public Guid Id { get; set; }
    public Guid ResumeId { get; set; }
    public string CategoryName { get; set; } = null!;
    public string Content { get; set; } = null!;
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Resume? Resume { get; set; }
}

public class CoverLetter
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string? TemplateName { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}

public class Notification
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = null!;
    public string? Message { get; set; }
    public string NotificationType { get; set; } = "system";
    public string? Link { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}

public class SubscriptionPlan
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Tier { get; set; } = null!;
    public decimal PriceMonthly { get; set; }
    public decimal? PriceAnnually { get; set; }
    public int? MaxPortfolios { get; set; }
    public int? MaxProjects { get; set; }
    public bool CustomDomain { get; set; }
    public int AiCredits { get; set; }
    public string? Features { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<UserSubscription> UserSubscriptions { get; set; } = new List<UserSubscription>();
}

public class UserSubscription
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid PlanId { get; set; }
    public string Status { get; set; } = "active";
    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime? EndDate { get; set; }
    public bool AutoRenew { get; set; } = true;
    public int AiCreditsUsed { get; set; }
    public DateTime? AiCreditsResetAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public SubscriptionPlan? Plan { get; set; }
}

public class Payment
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid? SubscriptionId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "INR";
    public string? PaymentMethod { get; set; }
    public string Status { get; set; } = "pending";
    public string? TransactionId { get; set; }
    public string? RefundReason { get; set; }
    public DateTime? RefundedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public UserSubscription? Subscription { get; set; }
}

public class PortfolioView
{
    public Guid Id { get; set; }
    public Guid PortfolioId { get; set; }
    public string? VisitorIp { get; set; }
    public string? Referrer { get; set; }
    public DateTime ViewedAt { get; set; } = DateTime.UtcNow;

    public Portfolio? Portfolio { get; set; }
}

public class Feedback
{
    public Guid Id { get; set; }
    public Guid? PortfolioId { get; set; }
    public Guid? UserId { get; set; }
    public int? Rating { get; set; }
    public string? Message { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Portfolio? Portfolio { get; set; }
    public User? User { get; set; }
}

public class Appointment
{
    public Guid Id { get; set; }
    public Guid PortfolioId { get; set; }
    public string VisitorName { get; set; } = null!;
    public string VisitorEmail { get; set; } = null!;
    public string? Note { get; set; }
    public DateTime AppointmentDate { get; set; }
    public string TimeSlot { get; set; } = null!;
    public string Status { get; set; } = "confirmed";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Portfolio? Portfolio { get; set; }
}

public class PortfolioGalleryPhoto
{
    public Guid Id { get; set; }
    public Guid PortfolioId { get; set; }
    public string ImageUrl { get; set; } = null!;
    public string? Caption { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Portfolio? Portfolio { get; set; }
}

public class PortfolioBook
{
    public Guid Id { get; set; }
    public Guid PortfolioId { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? Genre { get; set; }
    public int? PublishedYear { get; set; }
    public string? CoverImageUrl { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Portfolio? Portfolio { get; set; }
}

public class RefreshToken
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Token { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}

public class UserSettings
{
    public Guid UserId { get; set; }
    public bool IsProfilePublic { get; set; } = true;
    public bool SearchEngineVisible { get; set; } = true;
    public bool EmailNotifications { get; set; } = true;
    public bool SecurityAlertEmails { get; set; } = true;
    public bool ContactMessageNotifications { get; set; } = true;
    public bool SubscriptionReminderEmails { get; set; } = true;
    public string AccentColor { get; set; } = "indigo";
    public string FontSize { get; set; } = "medium";
    public string ThemeName { get; set; } = "light";
    public Guid? DefaultTemplateId { get; set; }
    public bool AutoSaveEnabled { get; set; } = true;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public PortfolioTemplate? DefaultTemplate { get; set; }
}

public class UserComplaint
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Subject { get; set; } = null!;
    public string Message { get; set; } = null!;
    public string Status { get; set; } = "open";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}

public class BugReport
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Description { get; set; } = null!;
    public string? PageUrl { get; set; }
    public string Status { get; set; } = "open";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}

public class SiteSettings
{
    public byte Id { get; set; } = 1;
    public string WebsiteName { get; set; } = "PortFolioX";
    public string? FooterText { get; set; }
    public bool MaintenanceMode { get; set; }
    public string ActiveLogoKey { get; set; } = "classic";
    public string? SmtpHost { get; set; }
    public string? SmtpPort { get; set; }
    public string? SmtpUsername { get; set; }
    public string? SmtpPassword { get; set; }
    public string? SmtpFromEmail { get; set; }
    public string? SmtpFromName { get; set; }

    public int JwtExpiryMinutes { get; set; } = 60;
    public int RefreshTokenExpiryDays { get; set; } = 7;
    public int SessionTimeoutMinutes { get; set; } = 60;
    public int PasswordMinLength { get; set; } = 6;
    public bool PasswordRequireUppercase { get; set; }
    public bool PasswordRequireNumber { get; set; }
    public bool PasswordRequireSpecial { get; set; }
    public int MaxLoginAttempts { get; set; } = 5;
    public int LoginLockoutMinutes { get; set; } = 15;

    public bool AllowNewRegistrations { get; set; } = true;
    public bool RequireEmailVerification { get; set; } = true;
    public bool RequiresApproval { get; set; }

    public bool AllowPublicPortfolios { get; set; } = true;
    public bool AllowPortfolioDownloads { get; set; } = true;
    public int MaxUploadSizeMb { get; set; } = 5;
    public string AllowedImageTypes { get; set; } = "jpg,jpeg,png,webp";
    public Guid? DefaultTemplateId { get; set; }

    public bool EnableLikes { get; set; } = true;
    public bool EnableComments { get; set; } = true;
    public bool EnableFollowSystem { get; set; } = true;

    public string? AdminAlertEmail { get; set; }
    public bool NotifyAdminNewRegistration { get; set; }
    public bool NotifyAdminPaymentSuccess { get; set; }

    public bool ShowSignupsWidget { get; set; } = true;
    public bool ShowTemplatesWidget { get; set; } = true;
    public bool ShowSubscriptionWidget { get; set; } = true;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public PortfolioTemplate? DefaultTemplate { get; set; }
}

public class ErrorLog
{
    public Guid Id { get; set; }
    public string Message { get; set; } = null!;
    public string? StackTrace { get; set; }
    public string? Path { get; set; }
    public string? HttpMethod { get; set; }
    public int? StatusCode { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class EmailTemplate
{
    public Guid Id { get; set; }
    public string TemplateKey { get; set; } = null!;
    public string Subject { get; set; } = null!;
    public string HtmlBody { get; set; } = null!;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
