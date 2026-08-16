using System.Security.Cryptography;
using BC = BCrypt.Net.BCrypt;
using Microsoft.EntityFrameworkCore;
using PortfolioX.Core.Entities;
using PortfolioX.Infrastructure;

namespace PortfolioX.Services;

public interface IPasswordResetService
{
    Task RequestResetAsync(string email);
    Task<(bool Success, string? Error)> ResetPasswordAsync(string email, string otp, string newPassword);
}

public class PasswordResetService : IPasswordResetService
{
    private const int OtpExpiryMinutes = 10;
    private const int MaxAttempts = 5;

    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IEmailTemplateService _templateService;
    private readonly IPasswordPolicyService _passwordPolicyService;

    public PasswordResetService(AppDbContext context, IEmailService emailService, IEmailTemplateService templateService, IPasswordPolicyService passwordPolicyService)
    {
        _context = context;
        _emailService = emailService;
        _templateService = templateService;
        _passwordPolicyService = passwordPolicyService;
    }

    public async Task RequestResetAsync(string email)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return;

        var existing = await _context.PasswordResetTokens.Where(t => t.UserId == user.Id).ToListAsync();
        _context.PasswordResetTokens.RemoveRange(existing);

        var otp = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();

        _context.PasswordResetTokens.Add(new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            OtpHash = CryptoHelper.HashHex(otp),
            ExpiresAt = DateTime.UtcNow.AddMinutes(OtpExpiryMinutes)
        });

        await _context.SaveChangesAsync();

        var (subject, html) = await _templateService.RenderAsync("password_reset", new Dictionary<string, string>
        {
            ["otp"] = otp,
            ["expiryMinutes"] = OtpExpiryMinutes.ToString()
        });

        await _emailService.SendAsync(user.Email, subject, html, isHtml: true);
    }

    public async Task<(bool Success, string? Error)> ResetPasswordAsync(string email, string otp, string newPassword)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) return (false, "Invalid or expired code.");

        var record = await _context.PasswordResetTokens
            .Where(t => t.UserId == user.Id && !t.IsUsed && t.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(t => t.CreatedAt)
            .FirstOrDefaultAsync();

        if (record == null)
            return (false, "No pending reset request for this email - request a new code.");

        if (record.Attempts >= MaxAttempts)
            return (false, "Too many incorrect attempts - request a new code.");

        if (record.OtpHash != CryptoHelper.HashHex(otp))
        {
            record.Attempts++;
            await _context.SaveChangesAsync();
            return (false, "Incorrect code.");
        }

        var (passwordValid, passwordError) = await _passwordPolicyService.ValidateAsync(newPassword);
        if (!passwordValid)
            return (false, passwordError);

        record.IsUsed = true;
        user.PasswordHash = BC.HashPassword(newPassword);
        user.UpdatedAt = DateTime.UtcNow;

        var refreshTokens = await _context.RefreshTokens.Where(t => t.UserId == user.Id).ToListAsync();
        _context.RefreshTokens.RemoveRange(refreshTokens);

        await _context.SaveChangesAsync();

        return (true, null);
    }
}
