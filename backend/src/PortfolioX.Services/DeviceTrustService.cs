using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using PortfolioX.Core.Entities;
using PortfolioX.Infrastructure;

namespace PortfolioX.Services;

public record DeviceFingerprint(string? IpAddress, string? UserAgent, string Browser, string OperatingSystem, string DeviceId);

public interface IDeviceTrustService
{
    Task<TrustedDevice?> FindTrustedDeviceAsync(Guid userId, string deviceId);
    Task TouchTrustedDeviceAsync(TrustedDevice device);
    Task<string> IssueVerificationTokenAsync(Guid userId, DeviceFingerprint fingerprint, bool rememberDevice);
    Task<LoginVerificationToken?> ConsumeVerificationTokenAsync(string rawToken);
    Task<TrustedDevice> TrustDeviceAsync(LoginVerificationToken verification);
    Task<TrustedDevice> TrustNewDeviceAsync(Guid userId, DeviceFingerprint fingerprint);
    Task LogLoginAttemptAsync(Guid? userId, string email, bool success, string? failureReason, DeviceFingerprint? fingerprint, bool isNewDevice);
    Task<List<TrustedDevice>> GetTrustedDevicesAsync(Guid userId);
    Task<bool> RevokeTrustedDeviceAsync(Guid userId, Guid trustedDeviceId);
    Task<List<LoginAuditLog>> GetLoginHistoryAsync(Guid userId, int take = 20);
}

public class DeviceTrustService : IDeviceTrustService
{
    private const int VerificationTokenExpiryMinutes = 15;
    private const int DefaultTrustDays = 30;
    private const int RememberedTrustDays = 180;

    private readonly AppDbContext _context;

    public DeviceTrustService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<TrustedDevice?> FindTrustedDeviceAsync(Guid userId, string deviceId)
    {
        return await _context.TrustedDevices.FirstOrDefaultAsync(d =>
            d.UserId == userId && d.DeviceId == deviceId && d.ExpiresAt > DateTime.UtcNow);
    }

    public async Task TouchTrustedDeviceAsync(TrustedDevice device)
    {
        device.LastLoginAt = DateTime.UtcNow;
        _context.TrustedDevices.Update(device);
        await _context.SaveChangesAsync();
    }

    public async Task<string> IssueVerificationTokenAsync(Guid userId, DeviceFingerprint fingerprint, bool rememberDevice)
    {
        var rawToken = GenerateSecureToken();

        var verification = new LoginVerificationToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TokenHash = CryptoHelper.HashHex(rawToken),
            DeviceId = fingerprint.DeviceId,
            Browser = fingerprint.Browser,
            OperatingSystem = fingerprint.OperatingSystem,
            UserAgent = fingerprint.UserAgent,
            IpAddress = fingerprint.IpAddress,
            RememberDevice = rememberDevice,
            ExpiresAt = DateTime.UtcNow.AddMinutes(VerificationTokenExpiryMinutes)
        };

        _context.LoginVerificationTokens.Add(verification);
        await _context.SaveChangesAsync();

        return rawToken;
    }

    public async Task<LoginVerificationToken?> ConsumeVerificationTokenAsync(string rawToken)
    {
        var tokenHash = CryptoHelper.HashHex(rawToken);

        var verification = await _context.LoginVerificationTokens
            .Include(v => v.User)
            .FirstOrDefaultAsync(v => v.TokenHash == tokenHash && !v.IsUsed && v.ExpiresAt > DateTime.UtcNow);

        if (verification == null) return null;

        verification.IsUsed = true;
        await _context.SaveChangesAsync();

        return verification;
    }

    public Task<TrustedDevice> TrustDeviceAsync(LoginVerificationToken verification)
    {
        var expiresAt = DateTime.UtcNow.AddDays(verification.RememberDevice ? RememberedTrustDays : DefaultTrustDays);
        var fingerprint = new DeviceFingerprint(verification.IpAddress, verification.UserAgent, verification.Browser ?? "Unknown", verification.OperatingSystem ?? "Unknown", verification.DeviceId);

        return UpsertTrustedDeviceAsync(verification.UserId, fingerprint, expiresAt);
    }

    public Task<TrustedDevice> TrustNewDeviceAsync(Guid userId, DeviceFingerprint fingerprint)
    {
        var expiresAt = DateTime.UtcNow.AddDays(DefaultTrustDays);
        return UpsertTrustedDeviceAsync(userId, fingerprint, expiresAt);
    }

    private async Task<TrustedDevice> UpsertTrustedDeviceAsync(Guid userId, DeviceFingerprint fingerprint, DateTime expiresAt)
    {
        var existing = await _context.TrustedDevices.FirstOrDefaultAsync(d =>
            d.UserId == userId && d.DeviceId == fingerprint.DeviceId);

        if (existing != null)
        {
            existing.Browser = fingerprint.Browser;
            existing.OperatingSystem = fingerprint.OperatingSystem;
            existing.UserAgent = fingerprint.UserAgent;
            existing.IpAddress = fingerprint.IpAddress;
            existing.ExpiresAt = expiresAt;
            existing.LastLoginAt = DateTime.UtcNow;
            _context.TrustedDevices.Update(existing);
            await _context.SaveChangesAsync();
            return existing;
        }

        var device = new TrustedDevice
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            DeviceId = fingerprint.DeviceId,
            Browser = fingerprint.Browser,
            OperatingSystem = fingerprint.OperatingSystem,
            UserAgent = fingerprint.UserAgent,
            IpAddress = fingerprint.IpAddress,
            ExpiresAt = expiresAt
        };

        _context.TrustedDevices.Add(device);
        await _context.SaveChangesAsync();

        return device;
    }

    public async Task LogLoginAttemptAsync(Guid? userId, string email, bool success, string? failureReason, DeviceFingerprint? fingerprint, bool isNewDevice)
    {
        _context.LoginAuditLogs.Add(new LoginAuditLog
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Email = email,
            Success = success,
            FailureReason = failureReason,
            IpAddress = fingerprint?.IpAddress,
            UserAgent = fingerprint?.UserAgent,
            Browser = fingerprint?.Browser,
            OperatingSystem = fingerprint?.OperatingSystem,
            IsNewDevice = isNewDevice
        });

        await _context.SaveChangesAsync();
    }

    public async Task<List<TrustedDevice>> GetTrustedDevicesAsync(Guid userId)
    {
        return await _context.TrustedDevices
            .AsNoTracking()
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.LastLoginAt)
            .ToListAsync();
    }

    public async Task<bool> RevokeTrustedDeviceAsync(Guid userId, Guid trustedDeviceId)
    {
        var device = await _context.TrustedDevices.FirstOrDefaultAsync(d => d.Id == trustedDeviceId && d.UserId == userId);
        if (device == null) return false;

        _context.TrustedDevices.Remove(device);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<LoginAuditLog>> GetLoginHistoryAsync(Guid userId, int take = 20)
    {
        return await _context.LoginAuditLogs
            .AsNoTracking()
            .Where(l => l.UserId == userId)
            .OrderByDescending(l => l.CreatedAt)
            .Take(take)
            .ToListAsync();
    }

    private static string GenerateSecureToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes).Replace('+', '-').Replace('/', '_').TrimEnd('=');
    }
}
