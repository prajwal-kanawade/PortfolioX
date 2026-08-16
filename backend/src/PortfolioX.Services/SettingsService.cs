using Microsoft.EntityFrameworkCore;
using PortfolioX.Core.DTOs;
using PortfolioX.Core.Entities;
using PortfolioX.Infrastructure;

namespace PortfolioX.Services;

public enum NotificationKind
{
    SecurityAlert,
    ContactMessage,
    SubscriptionReminder
}

public interface ISettingsService
{
    Task<UserSettingsDto> GetSettingsAsync(Guid userId);
    Task<UserSettingsDto> UpdateSettingsAsync(Guid userId, UpdateUserSettingsRequest request);
    Task<bool> ShouldSendNotificationAsync(Guid userId, NotificationKind kind);
}

public class SettingsService : ISettingsService
{
    private readonly AppDbContext _context;

    public SettingsService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<UserSettingsDto> GetSettingsAsync(Guid userId)
    {
        var settings = await GetOrCreateAsync(userId);
        return ToDto(settings);
    }

    public async Task<UserSettingsDto> UpdateSettingsAsync(Guid userId, UpdateUserSettingsRequest request)
    {
        var settings = await GetOrCreateAsync(userId);

        settings.IsProfilePublic = request.IsProfilePublic;
        settings.SearchEngineVisible = request.SearchEngineVisible;
        settings.EmailNotifications = request.EmailNotifications;
        settings.SecurityAlertEmails = request.SecurityAlertEmails;
        settings.ContactMessageNotifications = request.ContactMessageNotifications;
        settings.SubscriptionReminderEmails = request.SubscriptionReminderEmails;
        settings.AccentColor = request.AccentColor;
        settings.FontSize = request.FontSize;
        settings.ThemeName = request.ThemeName;
        settings.DefaultTemplateId = request.DefaultTemplateId;
        settings.AutoSaveEnabled = request.AutoSaveEnabled;
        settings.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return ToDto(settings);
    }

    public async Task<bool> ShouldSendNotificationAsync(Guid userId, NotificationKind kind)
    {
        var settings = await GetOrCreateAsync(userId);
        if (!settings.EmailNotifications) return false;

        return kind switch
        {
            NotificationKind.SecurityAlert => settings.SecurityAlertEmails,
            NotificationKind.ContactMessage => settings.ContactMessageNotifications,
            NotificationKind.SubscriptionReminder => settings.SubscriptionReminderEmails,
            _ => true
        };
    }

    private async Task<UserSettings> GetOrCreateAsync(Guid userId)
    {
        var settings = await _context.UserSettings.FirstOrDefaultAsync(s => s.UserId == userId);
        if (settings != null) return settings;

        await _context.Database.ExecuteSqlInterpolatedAsync(
            $"""
            INSERT IGNORE INTO user_settings
                (user_id, is_profile_public, search_engine_visible, email_notifications,
                 security_alert_emails, contact_message_notifications, subscription_reminder_emails,
                 accent_color, font_size, theme_name, auto_save_enabled, updated_at)
            VALUES
                ({userId}, 1, 1, 1, 1, 1, 1, 'indigo', 'medium', 'light', 1, UTC_TIMESTAMP(6))
            """);

        settings = await _context.UserSettings.FirstOrDefaultAsync(s => s.UserId == userId);
        return settings!;
    }

    private static UserSettingsDto ToDto(UserSettings s) => new()
    {
        IsProfilePublic = s.IsProfilePublic,
        SearchEngineVisible = s.SearchEngineVisible,
        EmailNotifications = s.EmailNotifications,
        SecurityAlertEmails = s.SecurityAlertEmails,
        ContactMessageNotifications = s.ContactMessageNotifications,
        SubscriptionReminderEmails = s.SubscriptionReminderEmails,
        AccentColor = s.AccentColor,
        FontSize = s.FontSize,
        ThemeName = s.ThemeName,
        DefaultTemplateId = s.DefaultTemplateId,
        AutoSaveEnabled = s.AutoSaveEnabled
    };
}
