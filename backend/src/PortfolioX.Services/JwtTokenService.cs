using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using PortfolioX.Core.Entities;
using PortfolioX.Infrastructure;

namespace PortfolioX.Services;

public interface ITokenService
{
    Task<string> GenerateAccessTokenAsync(User user);
    Task<string> GenerateAdminAccessTokenAsync(Admin admin);
    string GenerateRefreshToken();
    ClaimsPrincipal GetPrincipalFromExpiredToken(string token);
}

public class JwtTokenService : ITokenService
{
    private readonly string _jwtSecret;
    private readonly string _jwtExpiryInMinutes;
    private readonly AppDbContext _context;

    public JwtTokenService(IConfiguration configuration, AppDbContext context)
    {
        _jwtSecret = configuration["Jwt:Secret"] ?? throw new ArgumentNullException("Jwt:Secret not configured");
        _jwtExpiryInMinutes = configuration["Jwt:ExpiryInMinutes"] ?? "60";
        _context = context;
    }

    public async Task<string> GenerateAccessTokenAsync(User user)
        => await BuildTokenAsync(user.Id, user.Email, user.Username, isAdmin: false, user.SubscriptionTier);

    public async Task<string> GenerateAdminAccessTokenAsync(Admin admin)
        => await BuildTokenAsync(admin.Id, admin.Email, admin.Username, isAdmin: true, "admin");

    private async Task<string> BuildTokenAsync(Guid id, string email, string username, bool isAdmin, string subscriptionTier)
    {
        var configuredMinutes = (await _context.SiteSettings.AsNoTracking().FirstOrDefaultAsync(s => s.Id == 1))?.JwtExpiryMinutes;
        var expiryMinutes = configuredMinutes ?? int.Parse(_jwtExpiryInMinutes);

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtSecret);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, id.ToString()),
            new(ClaimTypes.Email, email),
            new("username", username),
            new("isadmin", isAdmin.ToString()),
            new("subscription", subscriptionTier)
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(expiryMinutes),
            Issuer = "PortfolioX",
            Audience = "PortfolioXAPI",
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomNumber);
        }
        return Convert.ToBase64String(randomNumber);
    }

    public ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
    {
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = false,
            ValidateIssuer = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_jwtSecret)),
            ValidateLifetime = false
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);

        if (!(securityToken is JwtSecurityToken jwtSecurityToken) ||
            !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256Signature, StringComparison.InvariantCultureIgnoreCase))
        {
            throw new SecurityTokenException("Invalid token");
        }

        return principal;
    }
}
