using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BC = BCrypt.Net.BCrypt;
using PortfolioX.Core.DTOs;
using PortfolioX.Infrastructure;
using PortfolioX.Services;

namespace PortfolioX.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private const string DeviceIdCookieName = "pfx_device_id";
    private const int DeviceIdCookieDays = 200;

    private readonly IUserService _userService;
    private readonly ITokenService _tokenService;
    private readonly IDeviceTrustService _deviceTrustService;
    private readonly IEmailVerificationService _emailVerificationService;
    private readonly IPasswordResetService _passwordResetService;
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;
    private readonly ISettingsService _settingsService;
    private readonly IEmailService _emailService;
    private readonly IEmailTemplateService _templateService;
    private readonly IPortfolioService _portfolioService;
    private readonly IResumeService _resumeService;
    private readonly IPasswordPolicyService _passwordPolicyService;

    public AuthController(IUserService userService, ITokenService tokenService, IDeviceTrustService deviceTrustService, IEmailVerificationService emailVerificationService, IPasswordResetService passwordResetService, AppDbContext context, IWebHostEnvironment env, ISettingsService settingsService, IEmailService emailService, IEmailTemplateService templateService, IPortfolioService portfolioService, IResumeService resumeService, IPasswordPolicyService passwordPolicyService)
    {
        _userService = userService;
        _tokenService = tokenService;
        _deviceTrustService = deviceTrustService;
        _emailVerificationService = emailVerificationService;
        _passwordResetService = passwordResetService;
        _context = context;
        _env = env;
        _settingsService = settingsService;
        _emailService = emailService;
        _templateService = templateService;
        _portfolioService = portfolioService;
        _resumeService = resumeService;
        _passwordPolicyService = passwordPolicyService;
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        await _passwordResetService.RequestResetAsync(request.Email);
        return Ok(new { message = "If that email is registered, a reset code was sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var (success, error) = await _passwordResetService.ResetPasswordAsync(request.Email, request.Otp, request.NewPassword);
        return success ? Ok(new { message = "Password reset successful." }) : BadRequest(new { message = error });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var fingerprint = BuildFingerprint();
        var result = await _userService.RegisterAsync(request, fingerprint);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("send-otp")]
    public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest request)
    {
        await _emailVerificationService.SendOtpAsync(request.Email);
        return Ok(new { message = "If that email is valid, a verification code was sent." });
    }

    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        var (success, error) = await _emailVerificationService.VerifyOtpAsync(request.Email, request.Otp);
        return success ? Ok(new { message = "Email verified." }) : BadRequest(new { message = error });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var fingerprint = BuildFingerprint();
        var result = await _userService.LoginAsync(request, fingerprint);
        return result.Success ? Ok(result) : Unauthorized(result);
    }

    [HttpPost("verify-login-device")]
    public async Task<IActionResult> VerifyLoginDevice([FromBody] VerifyLoginDeviceRequest request)
    {
        var result = await _userService.VerifyLoginDeviceAsync(request.Token);
        if (!result.Success) return BadRequest(result);

        SetDeviceIdCookie(GetOrCreateDeviceId(), DeviceIdCookieDays);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("trusted-devices")]
    public async Task<IActionResult> GetTrustedDevices()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var devices = await _deviceTrustService.GetTrustedDevicesAsync(userId);

        return Ok(devices.Select(d => new TrustedDeviceDto
        {
            Id = d.Id,
            Browser = d.Browser,
            OperatingSystem = d.OperatingSystem,
            IpAddress = d.IpAddress,
            TrustedAt = d.TrustedAt,
            ExpiresAt = d.ExpiresAt,
            LastLoginAt = d.LastLoginAt
        }));
    }

    [Authorize]
    [HttpDelete("trusted-devices/{id}")]
    public async Task<IActionResult> RevokeTrustedDevice(Guid id)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var removed = await _deviceTrustService.RevokeTrustedDeviceAsync(userId, id);

        return removed ? NoContent() : NotFound();
    }

    [Authorize]
    [HttpGet("login-history")]
    public async Task<IActionResult> GetLoginHistory()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var history = await _deviceTrustService.GetLoginHistoryAsync(userId);

        return Ok(history.Select(l => new LoginAuditLogDto
        {
            Id = l.Id,
            Success = l.Success,
            FailureReason = l.FailureReason,
            IpAddress = l.IpAddress,
            Browser = l.Browser,
            OperatingSystem = l.OperatingSystem,
            IsNewDevice = l.IsNewDevice,
            CreatedAt = l.CreatedAt
        }));
    }

    private DeviceFingerprint BuildFingerprint()
    {
        var hadCookie = Request.Cookies.TryGetValue(DeviceIdCookieName, out var existingDeviceId) && !string.IsNullOrWhiteSpace(existingDeviceId);
        var deviceId = hadCookie ? existingDeviceId! : Guid.NewGuid().ToString("N");

        if (!hadCookie)
            SetDeviceIdCookie(deviceId, 1);

        var userAgent = Request.Headers.UserAgent.ToString();
        var (browser, os) = UserAgentParser.Parse(userAgent);
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

        return new DeviceFingerprint(ip, userAgent, browser, os, deviceId);
    }

    private string GetOrCreateDeviceId()
    {
        return Request.Cookies.TryGetValue(DeviceIdCookieName, out var existing) && !string.IsNullOrWhiteSpace(existing)
            ? existing
            : Guid.NewGuid().ToString("N");
    }

    private void SetDeviceIdCookie(string deviceId, int days)
    {
        Response.Cookies.Append(DeviceIdCookieName, deviceId, new CookieOptions
        {
            HttpOnly = true,
            IsEssential = true,
            Expires = DateTimeOffset.UtcNow.AddDays(days),
            SameSite = SameSiteMode.Lax
        });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
    {
        try
        {
            var principal = _tokenService.GetPrincipalFromExpiredToken(request.RefreshToken);
            var id = Guid.Parse(principal.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
            var isAdminToken = bool.TryParse(principal.FindFirst("isadmin")?.Value, out var isAdminClaim) && isAdminClaim;
            var refreshExpiryDays = (await _context.SiteSettings.AsNoTracking().FirstOrDefaultAsync(s => s.Id == 1))?.RefreshTokenExpiryDays ?? 7;

            if (isAdminToken)
            {
                var adminRefreshToken = await _context.AdminRefreshTokens
                    .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken && rt.AdminId == id);

                if (adminRefreshToken == null || adminRefreshToken.ExpiresAt < DateTime.UtcNow)
                    return Unauthorized(new { message = "Invalid or expired refresh token" });

                var admin = await _context.Admins.FindAsync(id);
                if (admin == null || !admin.IsActive)
                    return Unauthorized(new { message = "Admin not found or inactive" });

                var newAdminAccessToken = await _tokenService.GenerateAdminAccessTokenAsync(admin);
                var newAdminRefreshToken = _tokenService.GenerateRefreshToken();

                _context.AdminRefreshTokens.Remove(adminRefreshToken);
                _context.AdminRefreshTokens.Add(new PortfolioX.Core.Entities.AdminRefreshToken
                {
                    Id = Guid.NewGuid(),
                    AdminId = id,
                    Token = newAdminRefreshToken,
                    ExpiresAt = DateTime.UtcNow.AddDays(refreshExpiryDays)
                });

                await _context.SaveChangesAsync();

                return Ok(new { accessToken = newAdminAccessToken, refreshToken = newAdminRefreshToken });
            }

            var refreshToken = await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken && rt.UserId == id);

            if (refreshToken == null || refreshToken.ExpiresAt < DateTime.UtcNow)
                return Unauthorized(new { message = "Invalid or expired refresh token" });

            var user = await _context.Users.FindAsync(id);
            if (user == null || !user.IsActive)
                return Unauthorized(new { message = "User not found or inactive" });

            var newAccessToken = await _tokenService.GenerateAccessTokenAsync(user);
            var newRefreshToken = _tokenService.GenerateRefreshToken();

            _context.RefreshTokens.Remove(refreshToken);
            _context.RefreshTokens.Add(new PortfolioX.Core.Entities.RefreshToken
            {
                Id = Guid.NewGuid(),
                UserId = id,
                Token = newRefreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(refreshExpiryDays)
            });

            await _context.SaveChangesAsync();

            return Ok(new { accessToken = newAccessToken, refreshToken = newRefreshToken });
        }
        catch
        {
            return Unauthorized(new { message = "Invalid token" });
        }
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var user = await _userService.GetUserByIdAsync(userId);

        return user == null ? NotFound() : Ok(user);
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var result = await _userService.UpdateProfileAsync(userId, request);

        return result == null ? NotFound() : Ok(result);
    }

    [Authorize]
    [HttpPost("profile/photo")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> UploadProfilePhoto(IFormFile file)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var user = await _context.Users.FindAsync(userId);
        var admin = user == null ? await _context.Admins.FindAsync(userId) : null;
        if (user == null && admin == null) return NotFound();

        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var isImage = extension is ".jpg" or ".jpeg" or ".png" or ".webp";
        if (!isImage)
            return BadRequest("Only JPG, PNG, or WEBP images are allowed");

        var uploadsDir = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "users");
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{userId}{extension}";
        var filePath = Path.Combine(uploadsDir, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var photoUrl = $"/uploads/users/{fileName}?v={DateTime.UtcNow.Ticks}";
        if (user != null)
        {
            user.ProfilePhotoUrl = photoUrl;
            user.UpdatedAt = DateTime.UtcNow;
            _context.Users.Update(user);
        }
        else
        {
            admin!.ProfilePhotoUrl = photoUrl;
            admin.UpdatedAt = DateTime.UtcNow;
            _context.Admins.Update(admin);
        }
        await _context.SaveChangesAsync();

        var updated = await _userService.GetUserByIdAsync(userId);
        return Ok(updated);
    }

    [Authorize]
    [HttpPost("request-email-change")]
    public async Task<IActionResult> RequestEmailChange([FromBody] RequestEmailChangeRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.NewEmail))
            return BadRequest(new { message = "That email is already in use." });

        await _emailVerificationService.SendOtpAsync(request.NewEmail);
        return Ok(new { message = "If that email can receive mail, a verification code was sent." });
    }

    [Authorize]
    [HttpPost("confirm-email-change")]
    public async Task<IActionResult> ConfirmEmailChange([FromBody] ConfirmEmailChangeRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        var (success, error) = await _emailVerificationService.VerifyOtpAsync(request.NewEmail, request.Otp);
        if (!success)
            return BadRequest(new { message = error });

        if (await _context.Users.AnyAsync(u => u.Email == request.NewEmail && u.Id != userId))
            return BadRequest(new { message = "That email is already in use." });

        user.Email = request.NewEmail;
        user.UpdatedAt = DateTime.UtcNow;
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
        await _emailVerificationService.ConsumeVerificationAsync(request.NewEmail);

        var updated = await _userService.GetUserByIdAsync(userId);
        return Ok(updated);
    }

    [Authorize]
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var isAdminToken = bool.TryParse(User.FindFirst("isadmin")?.Value, out var isAdminClaim) && isAdminClaim;

        if (isAdminToken)
            return await ChangeAdminPasswordAsync(userId, request);

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (!BC.Verify(request.CurrentPassword, user.PasswordHash))
            return BadRequest(new { message = "Current password is incorrect." });

        var (passwordValid, passwordError) = await _passwordPolicyService.ValidateAsync(request.NewPassword);
        if (!passwordValid)
            return BadRequest(new { message = passwordError });

        user.PasswordHash = BC.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        var tokens = await _context.RefreshTokens.Where(rt => rt.UserId == userId).ToListAsync();
        _context.RefreshTokens.RemoveRange(tokens);

        await _context.SaveChangesAsync();

        if (await _settingsService.ShouldSendNotificationAsync(userId, NotificationKind.SecurityAlert))
        {
            var (subject, html) = await _templateService.RenderAsync("password_changed", new Dictionary<string, string>());
            await _emailService.SendAsync(user.Email, subject, html, isHtml: true);
        }

        return Ok(new { message = "Password changed. Please log in again on your other devices." });
    }

    private async Task<IActionResult> ChangeAdminPasswordAsync(Guid adminId, ChangePasswordRequest request)
    {
        var admin = await _context.Admins.FindAsync(adminId);
        if (admin == null) return NotFound();

        if (!BC.Verify(request.CurrentPassword, admin.PasswordHash))
            return BadRequest(new { message = "Current password is incorrect." });

        var (passwordValid, passwordError) = await _passwordPolicyService.ValidateAsync(request.NewPassword);
        if (!passwordValid)
            return BadRequest(new { message = passwordError });

        admin.PasswordHash = BC.HashPassword(request.NewPassword);
        admin.UpdatedAt = DateTime.UtcNow;

        var adminTokens = await _context.AdminRefreshTokens.Where(rt => rt.AdminId == adminId).ToListAsync();
        _context.AdminRefreshTokens.RemoveRange(adminTokens);

        await _context.SaveChangesAsync();

        return Ok(new { message = "Password changed. Please log in again on your other devices." });
    }

    [Authorize]
    [HttpPost("logout-all")]
    public async Task<IActionResult> LogoutAll()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var isAdminToken = bool.TryParse(User.FindFirst("isadmin")?.Value, out var isAdminClaim) && isAdminClaim;

        if (isAdminToken)
        {
            var adminTokens = await _context.AdminRefreshTokens.Where(rt => rt.AdminId == userId).ToListAsync();
            _context.AdminRefreshTokens.RemoveRange(adminTokens);
        }
        else
        {
            var tokens = await _context.RefreshTokens.Where(rt => rt.UserId == userId).ToListAsync();
            _context.RefreshTokens.RemoveRange(tokens);
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Logged out of all devices." });
    }

    [Authorize]
    [HttpGet("export-data")]
    public async Task<IActionResult> ExportData()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var profile = await _userService.GetUserByIdAsync(userId);
        if (profile == null) return NotFound();

        var portfolios = await _portfolioService.GetUserPortfoliosAsync(userId);
        var resumes = await _resumeService.GetUserResumesAsync(userId);
        var payments = await _context.Payments
            .AsNoTracking()
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new PaymentHistoryDto
            {
                Id = p.Id,
                Amount = p.Amount,
                Currency = p.Currency,
                PaymentMethod = p.PaymentMethod,
                Status = p.Status,
                TransactionId = p.TransactionId,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync();

        var export = new AccountDataExportDto
        {
            Profile = profile,
            Portfolios = portfolios.ToList(),
            Resumes = resumes.ToList(),
            Payments = payments
        };

        var json = JsonSerializer.Serialize(export, new JsonSerializerOptions { WriteIndented = true });
        var bytes = Encoding.UTF8.GetBytes(json);
        return File(bytes, "application/json", "portfoliox-account-data.json");
    }

    [Authorize]
    [HttpDelete("account")]
    public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountRequest request)
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "");
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (!BC.Verify(request.Password, user.PasswordHash))
            return BadRequest(new { message = "Incorrect password." });

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Account deleted." });
    }

    [Authorize]
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        return Ok(new { message = "Logout successful" });
    }
}
