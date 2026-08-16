using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using PortfolioX.Core.Entities;
using PortfolioX.Infrastructure;

namespace PortfolioX.Services;

public interface IEmailVerificationService
{
    Task SendOtpAsync(string email);
    Task<(bool Success, string? Error)> VerifyOtpAsync(string email, string otp);
    Task<bool> IsEmailVerifiedAsync(string email);
    Task ConsumeVerificationAsync(string email);
}

public class EmailVerificationService : IEmailVerificationService
{
    private const int OtpExpiryMinutes = 10;
    private const int MaxAttempts = 5;

    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IEmailTemplateService _templateService;

    public EmailVerificationService(AppDbContext context, IEmailService emailService, IEmailTemplateService templateService)
    {
        _context = context;
        _emailService = emailService;
        _templateService = templateService;
    }

    public async Task SendOtpAsync(string email)
    {
        var existing = await _context.EmailVerificationOtps.Where(o => o.Email == email).ToListAsync();
        _context.EmailVerificationOtps.RemoveRange(existing);

        var otp = RandomNumberGenerator.GetInt32(100000, 1000000).ToString();

        _context.EmailVerificationOtps.Add(new EmailVerificationOtp
        {
            Id = Guid.NewGuid(),
            Email = email,
            OtpHash = CryptoHelper.HashHex(otp),
            ExpiresAt = DateTime.UtcNow.AddMinutes(OtpExpiryMinutes)
        });

        await _context.SaveChangesAsync();

        var (subject, html) = await _templateService.RenderAsync("registration_otp", new Dictionary<string, string>
        {
            ["otp"] = otp,
            ["expiryMinutes"] = OtpExpiryMinutes.ToString()
        });

        await _emailService.SendAsync(email, subject, html, isHtml: true);
    }

    public async Task<(bool Success, string? Error)> VerifyOtpAsync(string email, string otp)
    {
        var record = await _context.EmailVerificationOtps
            .Where(o => o.Email == email && !o.IsVerified && o.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (record == null)
            return (false, "No pending verification for this email - request a new code.");

        if (record.Attempts >= MaxAttempts)
            return (false, "Too many incorrect attempts - request a new code.");

        if (record.OtpHash != CryptoHelper.HashHex(otp))
        {
            record.Attempts++;
            await _context.SaveChangesAsync();
            return (false, "Incorrect code.");
        }

        record.IsVerified = true;
        record.VerifiedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return (true, null);
    }

    public async Task<bool> IsEmailVerifiedAsync(string email)
    {
        return await _context.EmailVerificationOtps.AnyAsync(o => o.Email == email && o.IsVerified);
    }

    public async Task ConsumeVerificationAsync(string email)
    {
        var records = await _context.EmailVerificationOtps.Where(o => o.Email == email).ToListAsync();
        _context.EmailVerificationOtps.RemoveRange(records);
        await _context.SaveChangesAsync();
    }
}
