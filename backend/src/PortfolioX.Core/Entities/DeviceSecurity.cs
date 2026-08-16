namespace PortfolioX.Core.Entities;

public class TrustedDevice
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string DeviceId { get; set; } = null!;
    public string? Browser { get; set; }
    public string? OperatingSystem { get; set; }
    public string? UserAgent { get; set; }
    public string? IpAddress { get; set; }
    public DateTime TrustedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public DateTime LastLoginAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}

public class LoginVerificationToken
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string TokenHash { get; set; } = null!;
    public string DeviceId { get; set; } = null!;
    public string? Browser { get; set; }
    public string? OperatingSystem { get; set; }
    public string? UserAgent { get; set; }
    public string? IpAddress { get; set; }
    public bool RememberDevice { get; set; }
    public bool IsUsed { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}

public class EmailVerificationOtp
{
    public Guid Id { get; set; }
    public string Email { get; set; } = null!;
    public string OtpHash { get; set; } = null!;
    public int Attempts { get; set; }
    public bool IsVerified { get; set; }
    public DateTime? VerifiedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class PasswordResetToken
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string OtpHash { get; set; } = null!;
    public int Attempts { get; set; }
    public bool IsUsed { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}

public class LoginAuditLog
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string Email { get; set; } = null!;
    public bool Success { get; set; }
    public string? FailureReason { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? Browser { get; set; }
    public string? OperatingSystem { get; set; }
    public bool IsNewDevice { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}
