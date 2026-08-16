using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using PortfolioX.Infrastructure;

namespace PortfolioX.Services;

public interface IPasswordPolicyService
{
    Task<(bool Valid, string? Error)> ValidateAsync(string password);
}

public class PasswordPolicyService : IPasswordPolicyService
{
    private readonly AppDbContext _context;

    public PasswordPolicyService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(bool Valid, string? Error)> ValidateAsync(string password)
    {
        var s = await _context.SiteSettings.AsNoTracking().FirstOrDefaultAsync(x => x.Id == 1);

        var minLength = s?.PasswordMinLength ?? 6;
        var requireUppercase = s?.PasswordRequireUppercase ?? false;
        var requireNumber = s?.PasswordRequireNumber ?? false;
        var requireSpecial = s?.PasswordRequireSpecial ?? false;

        if (string.IsNullOrEmpty(password) || password.Length < minLength)
            return (false, $"Password must be at least {minLength} characters.");

        if (requireUppercase && !Regex.IsMatch(password, "[A-Z]"))
            return (false, "Password must contain at least one uppercase letter.");

        if (requireNumber && !Regex.IsMatch(password, "[0-9]"))
            return (false, "Password must contain at least one number.");

        if (requireSpecial && !Regex.IsMatch(password, @"[^A-Za-z0-9]"))
            return (false, "Password must contain at least one special character.");

        return (true, null);
    }
}
