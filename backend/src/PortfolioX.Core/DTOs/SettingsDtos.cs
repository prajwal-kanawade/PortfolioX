namespace PortfolioX.Core.DTOs;

public class UserSettingsDto
{
    public bool IsProfilePublic { get; set; }
    public bool SearchEngineVisible { get; set; }
    public bool EmailNotifications { get; set; }
    public bool SecurityAlertEmails { get; set; }
    public bool ContactMessageNotifications { get; set; }
    public bool SubscriptionReminderEmails { get; set; }
    public string AccentColor { get; set; } = "indigo";
    public string FontSize { get; set; } = "medium";
    public string ThemeName { get; set; } = "light";
    public Guid? DefaultTemplateId { get; set; }
    public bool AutoSaveEnabled { get; set; }
}

public class UpdateUserSettingsRequest
{
    public bool IsProfilePublic { get; set; }
    public bool SearchEngineVisible { get; set; }
    public bool EmailNotifications { get; set; }
    public bool SecurityAlertEmails { get; set; }
    public bool ContactMessageNotifications { get; set; }
    public bool SubscriptionReminderEmails { get; set; }
    public string AccentColor { get; set; } = "indigo";
    public string FontSize { get; set; } = "medium";
    public string ThemeName { get; set; } = "light";
    public Guid? DefaultTemplateId { get; set; }
    public bool AutoSaveEnabled { get; set; }
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = null!;
    public string NewPassword { get; set; } = null!;
}

public class DeleteAccountRequest
{
    public string Password { get; set; } = null!;
}

public class SubmitComplaintRequest
{
    public string Subject { get; set; } = null!;
    public string Message { get; set; } = null!;
}

public class SubmitBugReportRequest
{
    public string Description { get; set; } = null!;
    public string? PageUrl { get; set; }
}

public class MySubscriptionDto
{
    public string Tier { get; set; } = "free";
    public string? Status { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool AutoRenew { get; set; }
}

public class PaymentHistoryDto
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = null!;
    public string? PaymentMethod { get; set; }
    public string Status { get; set; } = null!;
    public string? TransactionId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AccountDataExportDto
{
    public UserDto Profile { get; set; } = null!;
    public List<PortfolioDto> Portfolios { get; set; } = [];
    public List<ResumeDto> Resumes { get; set; } = [];
    public List<PaymentHistoryDto> Payments { get; set; } = [];
    public DateTime ExportedAt { get; set; } = DateTime.UtcNow;
}
