namespace PortfolioX.Core.DTOs;

public class PublicSiteSettingsDto
{
    public string WebsiteName { get; set; } = "PortFolioX";
    public string? FooterText { get; set; }
    public bool MaintenanceMode { get; set; }
    public string ActiveLogoKey { get; set; } = "classic";
    public bool AllowPortfolioDownloads { get; set; } = true;
    public Guid? DefaultTemplateId { get; set; }
    public int SessionTimeoutMinutes { get; set; } = 60;
    public bool AllowNewRegistrations { get; set; } = true;
    public bool EnableLikes { get; set; } = true;
    public bool EnableComments { get; set; } = true;
    public bool EnableFollowSystem { get; set; } = true;
}

public class AdminSiteSettingsDto
{
    public string WebsiteName { get; set; } = "PortFolioX";
    public string? FooterText { get; set; }
    public bool MaintenanceMode { get; set; }
    public string ActiveLogoKey { get; set; } = "classic";
    public string? SmtpHost { get; set; }
    public string? SmtpPort { get; set; }
    public string? SmtpUsername { get; set; }
    public string? SmtpFromEmail { get; set; }
    public string? SmtpFromName { get; set; }
    public bool SmtpPasswordSet { get; set; }

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
}

public class UpdateSiteSettingsRequest
{
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
}

public class EmailTemplateDto
{
    public Guid Id { get; set; }
    public string TemplateKey { get; set; } = null!;
    public string Subject { get; set; } = null!;
    public string HtmlBody { get; set; } = null!;
    public DateTime UpdatedAt { get; set; }
}

public class UpdateEmailTemplateRequest
{
    public string Subject { get; set; } = null!;
    public string HtmlBody { get; set; } = null!;
}

public class PreviewEmailTemplateRequest
{
    public string Subject { get; set; } = null!;
    public string HtmlBody { get; set; } = null!;
}

public class EmailTemplatePreviewDto
{
    public string Subject { get; set; } = null!;
    public string Html { get; set; } = null!;
}

public class AdminSubscriptionPlanDto
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
    public bool IsActive { get; set; }
    public int ActiveSubscriberCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateSubscriptionPlanRequest
{
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
}

public class UpdateSubscriptionPlanRequest
{
    public string Name { get; set; } = null!;
    public decimal PriceMonthly { get; set; }
    public decimal? PriceAnnually { get; set; }
    public int? MaxPortfolios { get; set; }
    public int? MaxProjects { get; set; }
    public bool CustomDomain { get; set; }
    public int AiCredits { get; set; }
    public string? Features { get; set; }
    public bool IsActive { get; set; }
}

public class AdminPaymentDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string UserEmail { get; set; } = null!;
    public string UserName { get; set; } = null!;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = null!;
    public string? PaymentMethod { get; set; }
    public string Status { get; set; } = null!;
    public string? TransactionId { get; set; }
    public string? RefundReason { get; set; }
    public DateTime? RefundedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class RefundPaymentRequest
{
    public string Reason { get; set; } = null!;
}

public class BanUserRequest
{
    public string Reason { get; set; } = null!;
}

public class StorageUsageDto
{
    public long TotalBytes { get; set; }
    public List<StorageBreakdownItemDto> Breakdown { get; set; } = [];
}

public class StorageBreakdownItemDto
{
    public string Folder { get; set; } = null!;
    public long Bytes { get; set; }
}

public class ErrorLogDto
{
    public Guid Id { get; set; }
    public string Message { get; set; } = null!;
    public string? StackTrace { get; set; }
    public string? Path { get; set; }
    public string? HttpMethod { get; set; }
    public int? StatusCode { get; set; }
    public DateTime CreatedAt { get; set; }
}
