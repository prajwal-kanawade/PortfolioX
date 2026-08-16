namespace PortfolioX.Core.DTOs;

public class RegisterRequest
{
    public string Email { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
}

public class LoginRequest
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public bool RememberDevice { get; set; }
}

public class AuthResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = null!;
    public bool RequiresVerification { get; set; }
    public string? AccessToken { get; set; }
    public string? RefreshToken { get; set; }
    public UserDto? User { get; set; }
}

public class VerifyLoginDeviceRequest
{
    public string Token { get; set; } = null!;
}

public class SendOtpRequest
{
    public string Email { get; set; } = null!;
}

public class VerifyOtpRequest
{
    public string Email { get; set; } = null!;
    public string Otp { get; set; } = null!;
}

public class ForgotPasswordRequest
{
    public string Email { get; set; } = null!;
}

public class ResetPasswordRequest
{
    public string Email { get; set; } = null!;
    public string Otp { get; set; } = null!;
    public string NewPassword { get; set; } = null!;
}

public class TrustedDeviceDto
{
    public Guid Id { get; set; }
    public string? Browser { get; set; }
    public string? OperatingSystem { get; set; }
    public string? IpAddress { get; set; }
    public DateTime TrustedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime LastLoginAt { get; set; }
}

public class LoginAuditLogDto
{
    public Guid Id { get; set; }
    public bool Success { get; set; }
    public string? FailureReason { get; set; }
    public string? IpAddress { get; set; }
    public string? Browser { get; set; }
    public string? OperatingSystem { get; set; }
    public bool IsNewDevice { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class RefreshTokenRequest
{
    public string RefreshToken { get; set; } = null!;
}

public class UserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Bio { get; set; }
    public string? ProfilePhotoUrl { get; set; }
    public bool IsAdmin { get; set; }
    public string SubscriptionTier { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
}

public class UpdateProfileRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Bio { get; set; }
}

public class RequestEmailChangeRequest
{
    public string NewEmail { get; set; } = null!;
}

public class ConfirmEmailChangeRequest
{
    public string NewEmail { get; set; } = null!;
    public string Otp { get; set; } = null!;
}
