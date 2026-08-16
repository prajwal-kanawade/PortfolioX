using BC = BCrypt.Net.BCrypt;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using PortfolioX.Core.DTOs;
using PortfolioX.Core.Entities;
using PortfolioX.Core.Policies;
using PortfolioX.Infrastructure;
using PortfolioX.Services.Scoring;

namespace PortfolioX.Services;

public interface IUserService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, DeviceFingerprint fingerprint);
    Task<AuthResponse> LoginAsync(LoginRequest request, DeviceFingerprint fingerprint);
    Task<AuthResponse> VerifyLoginDeviceAsync(string token);
    Task<UserDto?> GetUserByIdAsync(Guid userId);
    Task<UserDto?> UpdateProfileAsync(Guid userId, UpdateProfileRequest request);
    Task<IEnumerable<UserDto>> GetAllUsersAsync();
    Task<bool> DeleteUserAsync(Guid userId);
}

public class UserService : IUserService
{
    private readonly AppDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IDeviceTrustService _deviceTrustService;
    private readonly IEmailVerificationService _emailVerificationService;
    private readonly IEmailService _emailService;
    private readonly IEmailTemplateService _templateService;
    private readonly IPasswordPolicyService _passwordPolicyService;
    private readonly IConfiguration _configuration;
    private const string InvalidCredentials = "Invalid email or password";

    public UserService(AppDbContext context, ITokenService tokenService, IDeviceTrustService deviceTrustService, IEmailVerificationService emailVerificationService, IEmailService emailService, IEmailTemplateService templateService, IPasswordPolicyService passwordPolicyService, IConfiguration configuration)
    {
        _context = context;
        _tokenService = tokenService;
        _deviceTrustService = deviceTrustService;
        _emailVerificationService = emailVerificationService;
        _emailService = emailService;
        _templateService = templateService;
        _passwordPolicyService = passwordPolicyService;
        _configuration = configuration;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, DeviceFingerprint fingerprint)
    {
        var siteSettings = await _context.SiteSettings.AsNoTracking().FirstOrDefaultAsync(s => s.Id == 1);

        if (siteSettings != null && !siteSettings.AllowNewRegistrations)
            return new AuthResponse { Success = false, Message = "Registration is currently closed." };

        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            return new AuthResponse { Success = false, Message = "Email already registered" };

        if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            return new AuthResponse { Success = false, Message = "Username already taken" };

        var requireEmailVerification = siteSettings?.RequireEmailVerification ?? true;
        if (requireEmailVerification && !await _emailVerificationService.IsEmailVerifiedAsync(request.Email))
            return new AuthResponse { Success = false, Message = "Please verify your email before registering." };

        var (passwordValid, passwordError) = await _passwordPolicyService.ValidateAsync(request.Password);
        if (!passwordValid)
            return new AuthResponse { Success = false, Message = passwordError };

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            Username = request.Username,
            PasswordHash = BC.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            IsApproved = !(siteSettings?.RequiresApproval ?? false),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);

        var freePlan = await _context.SubscriptionPlans.FirstOrDefaultAsync(p => p.Tier == "free");
        if (freePlan != null)
        {
            var subscription = new UserSubscription
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                PlanId = freePlan.Id,
                Status = "active",
                CreatedAt = DateTime.UtcNow
            };
            _context.UserSubscriptions.Add(subscription);
        }

        await _context.SaveChangesAsync();

        await _deviceTrustService.TrustNewDeviceAsync(user.Id, fingerprint);
        await _emailVerificationService.ConsumeVerificationAsync(request.Email);

        try
        {
            var baseUrl = _configuration["Frontend:BaseUrl"] ?? "http://localhost:3000";
            var (subject, html) = await _templateService.RenderAsync("welcome", new Dictionary<string, string>
            {
                ["firstName"] = user.FirstName ?? user.Username,
                ["loginUrl"] = $"{baseUrl}/login"
            });
            await _emailService.SendAsync(user.Email, subject, html, isHtml: true);
        }
        catch
        {
        }

        if (siteSettings?.NotifyAdminNewRegistration == true && !string.IsNullOrWhiteSpace(siteSettings.AdminAlertEmail))
        {
            try
            {
                var (subject, html) = await _templateService.RenderAsync("admin_new_registration", new Dictionary<string, string>
                {
                    ["websiteName"] = siteSettings.WebsiteName,
                    ["userEmail"] = user.Email,
                    ["username"] = user.Username
                });
                await _emailService.SendAsync(siteSettings.AdminAlertEmail, subject, html, isHtml: true);
            }
            catch
            {
            }
        }

        return await IssueAuthResponseAsync(user, "Registration successful");
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, DeviceFingerprint fingerprint)
    {
        var siteSettings = await _context.SiteSettings.AsNoTracking().FirstOrDefaultAsync(s => s.Id == 1);
        var maxAttempts = siteSettings?.MaxLoginAttempts ?? 5;
        var lockoutMinutes = siteSettings?.LoginLockoutMinutes ?? 15;

        var lockoutWindowStart = DateTime.UtcNow.AddMinutes(-lockoutMinutes);
        var recentFailures = await _context.LoginAuditLogs
            .CountAsync(l => l.Email == request.Email && !l.Success && l.CreatedAt >= lockoutWindowStart);
        if (recentFailures >= maxAttempts)
            return new AuthResponse { Success = false, Message = $"Too many failed login attempts. Try again in {lockoutMinutes} minutes." };

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
        {
            return await AdminLoginAsync(request, fingerprint);
        }

        if (!BC.Verify(request.Password, user.PasswordHash))
        {
            await _deviceTrustService.LogLoginAttemptAsync(user.Id, request.Email, false, "invalid_credentials", fingerprint, isNewDevice: false);
            return new AuthResponse { Success = false, Message = InvalidCredentials };
        }

        if (!user.IsActive)
        {
            await _deviceTrustService.LogLoginAttemptAsync(user.Id, request.Email, false, "account_inactive", fingerprint, isNewDevice: false);
            return new AuthResponse { Success = false, Message = "Account is inactive" };
        }

        if (user.IsBanned)
        {
            await _deviceTrustService.LogLoginAttemptAsync(user.Id, request.Email, false, "account_banned", fingerprint, isNewDevice: false);
            return new AuthResponse { Success = false, Message = "Your account has been suspended." };
        }

        if (!user.IsApproved)
        {
            await _deviceTrustService.LogLoginAttemptAsync(user.Id, request.Email, false, "pending_approval", fingerprint, isNewDevice: false);
            return new AuthResponse { Success = false, Message = "Your account is pending admin approval." };
        }

        var trustedDevice = await _deviceTrustService.FindTrustedDeviceAsync(user.Id, fingerprint.DeviceId);

        if (trustedDevice != null)
        {
            await _deviceTrustService.TouchTrustedDeviceAsync(trustedDevice);
            await _deviceTrustService.LogLoginAttemptAsync(user.Id, request.Email, true, null, fingerprint, isNewDevice: false);
            return await IssueAuthResponseAsync(user, "Login successful");
        }

        var rawToken = await _deviceTrustService.IssueVerificationTokenAsync(user.Id, fingerprint, request.RememberDevice);
        await _deviceTrustService.LogLoginAttemptAsync(user.Id, request.Email, false, "pending_verification", fingerprint, isNewDevice: true);
        await SendVerificationEmailAsync(user, rawToken);

        return new AuthResponse
        {
            Success = false,
            RequiresVerification = true,
            Message = "We don't recognize this device. Check your email for a verification link to finish logging in."
        };
    }

    public async Task<AuthResponse> VerifyLoginDeviceAsync(string token)
    {
        var verification = await _deviceTrustService.ConsumeVerificationTokenAsync(token);
        if (verification == null || verification.User == null)
            return new AuthResponse { Success = false, Message = "This verification link is invalid or has expired." };

        if (verification.RememberDevice)
            await _deviceTrustService.TrustDeviceAsync(verification);

        await _deviceTrustService.LogLoginAttemptAsync(verification.UserId, verification.User.Email, true, "verified", null, isNewDevice: true);

        return await IssueAuthResponseAsync(verification.User, "Device verified - login successful");
    }

    private async Task<AuthResponse> AdminLoginAsync(LoginRequest request, DeviceFingerprint fingerprint)
    {
        var admin = await _context.Admins.FirstOrDefaultAsync(a => a.Email == request.Email);

        if (admin == null || !BC.Verify(request.Password, admin.PasswordHash))
        {
            await _deviceTrustService.LogLoginAttemptAsync(null, request.Email, false, "invalid_credentials", fingerprint, isNewDevice: false);
            return new AuthResponse { Success = false, Message = InvalidCredentials };
        }

        if (!admin.IsActive)
        {
            await _deviceTrustService.LogLoginAttemptAsync(null, request.Email, false, "account_inactive", fingerprint, isNewDevice: false);
            return new AuthResponse { Success = false, Message = "Account is inactive" };
        }

        await _deviceTrustService.LogLoginAttemptAsync(null, request.Email, true, null, fingerprint, isNewDevice: false);
        return await IssueAdminAuthResponseAsync(admin, "Login successful");
    }

    private async Task<AuthResponse> IssueAdminAuthResponseAsync(Admin admin, string message)
    {
        var accessToken = await _tokenService.GenerateAdminAccessTokenAsync(admin);
        var refreshToken = _tokenService.GenerateRefreshToken();

        var refreshExpiryDays = (await _context.SiteSettings.AsNoTracking().FirstOrDefaultAsync(s => s.Id == 1))?.RefreshTokenExpiryDays ?? 7;

        _context.AdminRefreshTokens.Add(new AdminRefreshToken
        {
            Id = Guid.NewGuid(),
            AdminId = admin.Id,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(refreshExpiryDays)
        });

        await _context.SaveChangesAsync();

        return new AuthResponse
        {
            Success = true,
            Message = message,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            User = MapAdminToDto(admin)
        };
    }

    private static UserDto MapAdminToDto(Admin admin) => new()
    {
        Id = admin.Id,
        Email = admin.Email,
        Username = admin.Username,
        FirstName = admin.FirstName,
        LastName = admin.LastName,
        Bio = null,
        ProfilePhotoUrl = admin.ProfilePhotoUrl,
        IsAdmin = true,
        SubscriptionTier = "admin",
        CreatedAt = admin.CreatedAt
    };

    private async Task<AuthResponse> IssueAuthResponseAsync(User user, string message)
    {
        var accessToken = await _tokenService.GenerateAccessTokenAsync(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        var refreshExpiryDays = (await _context.SiteSettings.AsNoTracking().FirstOrDefaultAsync(s => s.Id == 1))?.RefreshTokenExpiryDays ?? 7;

        _context.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(refreshExpiryDays)
        });

        await _context.SaveChangesAsync();

        return new AuthResponse
        {
            Success = true,
            Message = message,
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            User = MapUserToDto(user)
        };
    }

    private async Task SendVerificationEmailAsync(User user, string rawToken)
    {
        var baseUrl = _configuration["Frontend:BaseUrl"] ?? "http://localhost:3000";
        var verifyUrl = $"{baseUrl}/verify-login?token={rawToken}";

        var (subject, html) = await _templateService.RenderAsync("new_device_login", new Dictionary<string, string>
        {
            ["verifyUrl"] = verifyUrl
        });

        await _emailService.SendAsync(user.Email, subject, html, isHtml: true);
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user != null) return MapUserToDto(user);

        var admin = await _context.Admins.FindAsync(userId);
        return admin == null ? null : MapAdminToDto(admin);
    }

    public async Task<UserDto?> UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            var admin = await _context.Admins.FindAsync(userId);
            if (admin == null) return null;

            admin.FirstName = request.FirstName ?? admin.FirstName;
            admin.LastName = request.LastName ?? admin.LastName;
            admin.UpdatedAt = DateTime.UtcNow;

            _context.Admins.Update(admin);
            await _context.SaveChangesAsync();

            return MapAdminToDto(admin);
        }

        user.FirstName = request.FirstName ?? user.FirstName;
        user.LastName = request.LastName ?? user.LastName;
        user.Bio = request.Bio ?? user.Bio;
        user.UpdatedAt = DateTime.UtcNow;

        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        return MapUserToDto(user);
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        return await _context.Users.AsNoTracking().Select(u => MapUserToDto(u)).ToListAsync();
    }

    public async Task<bool> DeleteUserAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return true;
    }

    private static UserDto MapUserToDto(User user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        Username = user.Username,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Bio = user.Bio,
        ProfilePhotoUrl = user.ProfilePhotoUrl,
        IsAdmin = false,
        SubscriptionTier = user.SubscriptionTier,
        CreatedAt = user.CreatedAt
    };
}

public interface IPortfolioService
{
    Task<PortfolioCreationResult> CreatePortfolioAsync(Guid userId, CreatePortfolioRequest request);
    Task<PortfolioDto?> GetPortfolioByIdAsync(Guid portfolioId);
    Task<PortfolioDto?> GetPortfolioBySlugAsync(string slug, Guid? viewerId = null);
    Task<IEnumerable<PortfolioDto>> GetUserPortfoliosAsync(Guid userId);
    Task<PortfolioDto?> UpdatePortfolioAsync(Guid portfolioId, UpdatePortfolioRequest request);
    Task<bool> DeletePortfolioAsync(Guid portfolioId);
    Task<IEnumerable<PortfolioTemplateDto>> GetAllTemplatesAsync();
    Task RecordPortfolioViewAsync(Guid portfolioId, string? visitorIp);
    Task<int> GetPortfolioCountByUserAsync(Guid userId);
    Task<ScoreResultDto?> RecalculateScoreAsync(Guid portfolioId);
    Task<List<PortfolioExploreCardDto>> GetExploreAsync(string? category, string sort, Guid? viewerId);
}

public class PortfolioService : IPortfolioService
{
    private readonly AppDbContext _context;
    private readonly PortfolioScoreCalculator _scoreCalculator;

    public PortfolioService(AppDbContext context, PortfolioScoreCalculator scoreCalculator)
    {
        _context = context;
        _scoreCalculator = scoreCalculator;
    }

    public async Task<PortfolioCreationResult> CreatePortfolioAsync(Guid userId, CreatePortfolioRequest request)
    {
        var user = await _context.Users.FindAsync(userId);

        if (user == null)
            return new PortfolioCreationResult { Error = "Admin accounts can't create portfolios." };

        var policy = SubscriptionPlanPolicyFactory.ForTier(user?.SubscriptionTier);

        var existingCount = await GetPortfolioCountByUserAsync(userId);
        if (existingCount >= policy.MaxPortfolios)
            return new PortfolioCreationResult { Error = policy.PortfolioLimitMessage };

        var portfolio = new Portfolio
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TemplateId = request.TemplateId,
            Title = request.Title,
            Slug = await GenerateUniqueSlugAsync(request.Title),
            Headline = request.Headline,
            AboutMe = request.AboutMe,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Portfolios.Add(portfolio);
        await _context.SaveChangesAsync();

        return new PortfolioCreationResult { Portfolio = await GetPortfolioByIdAsync(portfolio.Id) };
    }

    public async Task<PortfolioDto?> GetPortfolioByIdAsync(Guid portfolioId)
    {
        var portfolio = await _context.Portfolios
            .AsNoTracking()
            .Include(p => p.Template)
            .Include(p => p.Projects.OrderBy(x => x.SortOrder)).ThenInclude(pr => pr.LogEntries.OrderByDescending(l => l.CreatedAt))
            .Include(p => p.Skills.OrderBy(x => x.SortOrder))
            .Include(p => p.Experiences.OrderBy(x => x.SortOrder))
            .Include(p => p.Educations.OrderBy(x => x.SortOrder))
            .Include(p => p.GalleryPhotos.OrderBy(x => x.SortOrder))
            .Include(p => p.Books.OrderBy(x => x.SortOrder))
            .FirstOrDefaultAsync(p => p.Id == portfolioId);

        return portfolio == null ? null : MapPortfolioToDto(portfolio);
    }

    public async Task<PortfolioDto?> GetPortfolioBySlugAsync(string slug, Guid? viewerId = null)
    {
        var portfolio = await _context.Portfolios
            .AsNoTracking()
            .Include(p => p.Template)
            .Include(p => p.User).ThenInclude(u => u!.Settings)
            .Include(p => p.Projects.OrderBy(x => x.SortOrder)).ThenInclude(pr => pr.LogEntries.OrderByDescending(l => l.CreatedAt))
            .Include(p => p.Skills.OrderBy(x => x.SortOrder))
            .Include(p => p.Experiences.OrderBy(x => x.SortOrder))
            .Include(p => p.Educations.OrderBy(x => x.SortOrder))
            .Include(p => p.GalleryPhotos.OrderBy(x => x.SortOrder))
            .Include(p => p.Books.OrderBy(x => x.SortOrder))
            .FirstOrDefaultAsync(p => p.Slug == slug);

        if (portfolio == null) return null;

        var dto = MapPortfolioToDto(portfolio);
        dto.LikeCount = await _context.PortfolioLikes.CountAsync(l => l.PortfolioId == portfolio.Id);
        dto.IsLikedByMe = viewerId != null && await _context.PortfolioLikes.AnyAsync(l => l.PortfolioId == portfolio.Id && l.UserId == viewerId);
        return dto;
    }

    public async Task<IEnumerable<PortfolioDto>> GetUserPortfoliosAsync(Guid userId)
    {
        var portfolios = await _context.Portfolios
            .AsNoTracking()
            .Where(p => p.UserId == userId)
            .Include(p => p.Template)
            .Include(p => p.Projects).ThenInclude(pr => pr.LogEntries.OrderByDescending(l => l.CreatedAt))
            .Include(p => p.Skills)
            .Include(p => p.Experiences)
            .Include(p => p.Educations)
            .Include(p => p.GalleryPhotos)
            .Include(p => p.Books)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return portfolios.Select(MapPortfolioToDto).ToList();
    }

    public async Task<PortfolioDto?> UpdatePortfolioAsync(Guid portfolioId, UpdatePortfolioRequest request)
    {
        var portfolio = await _context.Portfolios.FindAsync(portfolioId);
        if (portfolio == null) return null;

        if (!string.IsNullOrWhiteSpace(request.Title))
        {
            portfolio.Title = request.Title;
            portfolio.Slug = await GenerateUniqueSlugAsync(request.Title, portfolio.Id);
        }

        portfolio.Headline = request.Headline ?? portfolio.Headline;
        portfolio.AboutMe = request.AboutMe ?? portfolio.AboutMe;
        if (request.IsPublished.HasValue)
            portfolio.IsPublished = request.IsPublished.Value;

        portfolio.UpdatedAt = DateTime.UtcNow;

        _context.Portfolios.Update(portfolio);
        await _context.SaveChangesAsync();

        await RecalculateScoreAsync(portfolioId);
        return await GetPortfolioByIdAsync(portfolioId);
    }

    public async Task<ScoreResultDto?> RecalculateScoreAsync(Guid portfolioId)
    {
        var dto = await GetPortfolioByIdAsync(portfolioId);
        if (dto == null) return null;

        var result = _scoreCalculator.Calculate(dto);

        var entity = await _context.Portfolios.FindAsync(portfolioId);
        if (entity != null)
        {
            entity.PortfolioScore = result.Score;
            await _context.SaveChangesAsync();
        }

        return result;
    }

    public async Task<bool> DeletePortfolioAsync(Guid portfolioId)
    {
        var portfolio = await _context.Portfolios.FindAsync(portfolioId);
        if (portfolio == null) return false;

        _context.Portfolios.Remove(portfolio);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<PortfolioTemplateDto>> GetAllTemplatesAsync()
    {
        return await _context.PortfolioTemplates
            .AsNoTracking()
            .Where(t => t.IsActive)
            .Select(t => new PortfolioTemplateDto
            {
                Id = t.Id,
                Code = t.Code,
                Name = t.Name,
                Description = t.Description,
                Category = t.Category,
                ThumbnailUrl = t.ThumbnailUrl
            })
            .ToListAsync();
    }

    public async Task RecordPortfolioViewAsync(Guid portfolioId, string? visitorIp)
    {
        var portfolio = await _context.Portfolios.FindAsync(portfolioId);
        if (portfolio == null) return;

        portfolio.ViewCount++;
        _context.Portfolios.Update(portfolio);

        var view = new PortfolioView
        {
            Id = Guid.NewGuid(),
            PortfolioId = portfolioId,
            VisitorIp = visitorIp,
            ViewedAt = DateTime.UtcNow
        };

        _context.PortfolioViews.Add(view);
        await _context.SaveChangesAsync();
    }

    public async Task<int> GetPortfolioCountByUserAsync(Guid userId)
    {
        return await _context.Portfolios.CountAsync(p => p.UserId == userId);
    }

    private const int ExploreCandidateWindow = 200;
    private const int ExploreTopK = 24;

    public async Task<List<PortfolioExploreCardDto>> GetExploreAsync(string? category, string sort, Guid? viewerId)
    {
        var query = _context.Portfolios.AsNoTracking().Include(p => p.Template).Include(p => p.User)
            .Where(p => p.IsPublished)
            .Where(p => p.User!.Settings == null || p.User.Settings.IsProfilePublic);

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(p => p.Template!.Category == category);

        var candidates = await query
            .OrderByDescending(p => p.UpdatedAt)
            .Take(ExploreCandidateWindow)
            .ToListAsync();

        var candidateIds = candidates.Select(p => p.Id).ToList();
        var likeCounts = await _context.PortfolioLikes
            .AsNoTracking()
            .Where(l => candidateIds.Contains(l.PortfolioId))
            .GroupBy(l => l.PortfolioId)
            .Select(g => new { PortfolioId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.PortfolioId, x => x.Count);
        var likedByViewer = viewerId == null
            ? new HashSet<Guid>()
            : (await _context.PortfolioLikes.AsNoTracking()
                .Where(l => candidateIds.Contains(l.PortfolioId) && l.UserId == viewerId)
                .Select(l => l.PortfolioId)
                .ToListAsync()).ToHashSet();

        PortfolioExploreCardDto ToCard(Portfolio p) => ToExploreCard(p, likeCounts, likedByViewer);

        if (sort == "newest")
            return candidates.OrderByDescending(p => p.CreatedAt).Select(ToCard).ToList();

        var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
        var recentViewCounts = await _context.PortfolioViews
            .AsNoTracking()
            .Where(v => candidateIds.Contains(v.PortfolioId) && v.ViewedAt >= sevenDaysAgo)
            .GroupBy(v => v.PortfolioId)
            .Select(g => new { PortfolioId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.PortfolioId, x => x.Count);

        var heap = new PriorityQueue<Portfolio, int>();
        foreach (var portfolio in candidates)
        {
            var recentViews = recentViewCounts.GetValueOrDefault(portfolio.Id, 0);
            heap.Enqueue(portfolio, recentViews);
            if (heap.Count > ExploreTopK)
                heap.Dequeue();
        }

        var ranked = new List<Portfolio>();
        while (heap.TryDequeue(out var portfolio, out _))
            ranked.Add(portfolio);
        ranked.Reverse();

        return ranked.Select(ToCard).ToList();
    }

    private static PortfolioExploreCardDto ToExploreCard(Portfolio p, Dictionary<Guid, int> likeCounts, HashSet<Guid> likedByViewer) => new()
    {
        Id = p.Id,
        UserId = p.UserId,
        Title = p.Title,
        Slug = p.Slug,
        Headline = p.Headline,
        PhotoUrl = p.PhotoUrl,
        ViewCount = p.ViewCount,
        TemplateName = p.Template?.Name,
        TemplateCategory = p.Template?.Category,
        OwnerUsername = p.User?.Username,
        OwnerName = string.Join(" ", new[] { p.User?.FirstName, p.User?.LastName }.Where(s => !string.IsNullOrWhiteSpace(s))) is { Length: > 0 } name ? name : null,
        OwnerAvatarUrl = p.User?.ProfilePhotoUrl,
        LikeCount = likeCounts.GetValueOrDefault(p.Id, 0),
        IsLikedByMe = likedByViewer.Contains(p.Id)
    };

    private static PortfolioDto MapPortfolioToDto(Portfolio portfolio) => new()
    {
        Id = portfolio.Id,
        UserId = portfolio.UserId,
        Title = portfolio.Title,
        Slug = portfolio.Slug,
        Headline = portfolio.Headline,
        AboutMe = portfolio.AboutMe,
        PhotoUrl = portfolio.PhotoUrl,
        IsPublished = portfolio.IsPublished,
        SearchEngineVisible = portfolio.User?.Settings?.SearchEngineVisible ?? true,
        PortfolioScore = portfolio.PortfolioScore,
        ViewCount = portfolio.ViewCount,
        Template = portfolio.Template == null ? null : new PortfolioTemplateDto
        {
            Id = portfolio.Template.Id,
            Code = portfolio.Template.Code,
            Name = portfolio.Template.Name,
            Description = portfolio.Template.Description,
            Category = portfolio.Template.Category,
            ThumbnailUrl = portfolio.Template.ThumbnailUrl
        },
        Projects = portfolio.Projects.Select(p => new PortfolioProjectDto
        {
            Id = p.Id,
            Title = p.Title,
            Description = p.Description,
            ImageUrl = p.ImageUrl,
            ProjectUrl = p.ProjectUrl,
            GithubUrl = p.GithubUrl,
            Technologies = p.Technologies,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            LogEntries = p.LogEntries.Select(l => new ProjectLogEntryDto
            {
                Id = l.Id,
                Content = l.Content,
                CreatedAt = l.CreatedAt
            }).ToList()
        }).ToList(),
        Skills = portfolio.Skills.Select(s => new PortfolioSkillDto
        {
            Id = s.Id,
            SkillName = s.SkillName,
            ProficiencyLevel = s.ProficiencyLevel,
            Endorsements = s.Endorsements
        }).ToList(),
        Experiences = portfolio.Experiences.Select(e => new PortfolioExperienceDto
        {
            Id = e.Id,
            JobTitle = e.JobTitle,
            CompanyName = e.CompanyName,
            Location = e.Location,
            Description = e.Description,
            StartDate = e.StartDate,
            EndDate = e.EndDate,
            IsCurrent = e.IsCurrent
        }).ToList(),
        Educations = portfolio.Educations.Select(ed => new PortfolioEducationDto
        {
            Id = ed.Id,
            InstitutionName = ed.InstitutionName,
            Degree = ed.Degree,
            FieldOfStudy = ed.FieldOfStudy,
            GraduationDate = ed.GraduationDate,
            Description = ed.Description
        }).ToList(),
        GalleryPhotos = portfolio.GalleryPhotos.Select(g => new PortfolioGalleryPhotoDto
        {
            Id = g.Id,
            ImageUrl = g.ImageUrl,
            Caption = g.Caption
        }).ToList(),
        Books = portfolio.Books.Select(b => new PortfolioBookDto
        {
            Id = b.Id,
            Title = b.Title,
            Description = b.Description,
            Genre = b.Genre,
            PublishedYear = b.PublishedYear,
            CoverImageUrl = b.CoverImageUrl
        }).ToList(),
        CreatedAt = portfolio.CreatedAt,
        UpdatedAt = portfolio.UpdatedAt
    };

    private static string GenerateSlug(string title)
    {
        return title.ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("--", "-")
            .Trim('-');
    }

    private async Task<string> GenerateUniqueSlugAsync(string title, Guid? excludePortfolioId = null)
    {
        var baseSlug = GenerateSlug(title);
        if (string.IsNullOrWhiteSpace(baseSlug)) baseSlug = "portfolio";

        var slug = baseSlug;
        var suffix = 2;
        while (await _context.Portfolios.AnyAsync(p => p.Slug == slug && p.Id != excludePortfolioId))
        {
            slug = $"{baseSlug}-{suffix}";
            suffix++;
        }
        return slug;
    }
}
