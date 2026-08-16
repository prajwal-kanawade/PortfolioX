using Microsoft.EntityFrameworkCore;
using PortfolioX.Core.DTOs;
using PortfolioX.Core.Entities;
using PortfolioX.Infrastructure;

namespace PortfolioX.Services;

public interface ISiteSettingsService
{
    Task<PublicSiteSettingsDto> GetPublicAsync();
    Task<AdminSiteSettingsDto> GetAdminAsync();
    Task<AdminSiteSettingsDto> UpdateAsync(UpdateSiteSettingsRequest request);
}

public class SiteSettingsService : ISiteSettingsService
{
    private readonly AppDbContext _context;

    public SiteSettingsService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PublicSiteSettingsDto> GetPublicAsync()
    {
        var s = await GetOrCreateAsync();
        return new PublicSiteSettingsDto
        {
            WebsiteName = s.WebsiteName,
            FooterText = s.FooterText,
            MaintenanceMode = s.MaintenanceMode,
            ActiveLogoKey = s.ActiveLogoKey,
            AllowPortfolioDownloads = s.AllowPortfolioDownloads,
            DefaultTemplateId = s.DefaultTemplateId,
            SessionTimeoutMinutes = s.SessionTimeoutMinutes,
            AllowNewRegistrations = s.AllowNewRegistrations,
            EnableLikes = s.EnableLikes,
            EnableComments = s.EnableComments,
            EnableFollowSystem = s.EnableFollowSystem
        };
    }

    public async Task<AdminSiteSettingsDto> GetAdminAsync()
    {
        var s = await GetOrCreateAsync();
        return ToAdminDto(s);
    }

    public async Task<AdminSiteSettingsDto> UpdateAsync(UpdateSiteSettingsRequest request)
    {
        var s = await GetOrCreateAsync();

        s.WebsiteName = request.WebsiteName;
        s.FooterText = request.FooterText;
        s.MaintenanceMode = request.MaintenanceMode;
        s.ActiveLogoKey = request.ActiveLogoKey;
        s.SmtpHost = request.SmtpHost;
        s.SmtpPort = request.SmtpPort;
        s.SmtpUsername = request.SmtpUsername;
        if (!string.IsNullOrWhiteSpace(request.SmtpPassword))
            s.SmtpPassword = request.SmtpPassword;
        s.SmtpFromEmail = request.SmtpFromEmail;
        s.SmtpFromName = request.SmtpFromName;

        s.JwtExpiryMinutes = request.JwtExpiryMinutes;
        s.RefreshTokenExpiryDays = request.RefreshTokenExpiryDays;
        s.SessionTimeoutMinutes = request.SessionTimeoutMinutes;
        s.PasswordMinLength = request.PasswordMinLength;
        s.PasswordRequireUppercase = request.PasswordRequireUppercase;
        s.PasswordRequireNumber = request.PasswordRequireNumber;
        s.PasswordRequireSpecial = request.PasswordRequireSpecial;
        s.MaxLoginAttempts = request.MaxLoginAttempts;
        s.LoginLockoutMinutes = request.LoginLockoutMinutes;

        s.AllowNewRegistrations = request.AllowNewRegistrations;
        s.RequireEmailVerification = request.RequireEmailVerification;
        s.RequiresApproval = request.RequiresApproval;

        s.AllowPublicPortfolios = request.AllowPublicPortfolios;
        s.AllowPortfolioDownloads = request.AllowPortfolioDownloads;
        s.MaxUploadSizeMb = request.MaxUploadSizeMb;
        s.AllowedImageTypes = request.AllowedImageTypes;
        s.DefaultTemplateId = request.DefaultTemplateId;

        s.EnableLikes = request.EnableLikes;
        s.EnableComments = request.EnableComments;
        s.EnableFollowSystem = request.EnableFollowSystem;

        s.AdminAlertEmail = request.AdminAlertEmail;
        s.NotifyAdminNewRegistration = request.NotifyAdminNewRegistration;
        s.NotifyAdminPaymentSuccess = request.NotifyAdminPaymentSuccess;

        s.ShowSignupsWidget = request.ShowSignupsWidget;
        s.ShowTemplatesWidget = request.ShowTemplatesWidget;
        s.ShowSubscriptionWidget = request.ShowSubscriptionWidget;

        s.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return ToAdminDto(s);
    }

    private async Task<SiteSettings> GetOrCreateAsync()
    {
        var s = await _context.SiteSettings.FirstOrDefaultAsync(x => x.Id == 1);
        if (s != null) return s;

        s = new SiteSettings { Id = 1 };
        _context.SiteSettings.Add(s);
        await _context.SaveChangesAsync();
        return s;
    }

    private static AdminSiteSettingsDto ToAdminDto(SiteSettings s) => new()
    {
        WebsiteName = s.WebsiteName,
        FooterText = s.FooterText,
        MaintenanceMode = s.MaintenanceMode,
        ActiveLogoKey = s.ActiveLogoKey,
        SmtpHost = s.SmtpHost,
        SmtpPort = s.SmtpPort,
        SmtpUsername = s.SmtpUsername,
        SmtpFromEmail = s.SmtpFromEmail,
        SmtpFromName = s.SmtpFromName,
        SmtpPasswordSet = !string.IsNullOrEmpty(s.SmtpPassword),

        JwtExpiryMinutes = s.JwtExpiryMinutes,
        RefreshTokenExpiryDays = s.RefreshTokenExpiryDays,
        SessionTimeoutMinutes = s.SessionTimeoutMinutes,
        PasswordMinLength = s.PasswordMinLength,
        PasswordRequireUppercase = s.PasswordRequireUppercase,
        PasswordRequireNumber = s.PasswordRequireNumber,
        PasswordRequireSpecial = s.PasswordRequireSpecial,
        MaxLoginAttempts = s.MaxLoginAttempts,
        LoginLockoutMinutes = s.LoginLockoutMinutes,

        AllowNewRegistrations = s.AllowNewRegistrations,
        RequireEmailVerification = s.RequireEmailVerification,
        RequiresApproval = s.RequiresApproval,

        AllowPublicPortfolios = s.AllowPublicPortfolios,
        AllowPortfolioDownloads = s.AllowPortfolioDownloads,
        MaxUploadSizeMb = s.MaxUploadSizeMb,
        AllowedImageTypes = s.AllowedImageTypes,
        DefaultTemplateId = s.DefaultTemplateId,

        EnableLikes = s.EnableLikes,
        EnableComments = s.EnableComments,
        EnableFollowSystem = s.EnableFollowSystem,

        AdminAlertEmail = s.AdminAlertEmail,
        NotifyAdminNewRegistration = s.NotifyAdminNewRegistration,
        NotifyAdminPaymentSuccess = s.NotifyAdminPaymentSuccess,

        ShowSignupsWidget = s.ShowSignupsWidget,
        ShowTemplatesWidget = s.ShowTemplatesWidget,
        ShowSubscriptionWidget = s.ShowSubscriptionWidget
    };
}
