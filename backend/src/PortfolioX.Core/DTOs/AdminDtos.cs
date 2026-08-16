namespace PortfolioX.Core.DTOs;

public class AdminStatsDto
{
    public int TotalUsers { get; set; }
    public int TotalPortfolios { get; set; }
    public int TotalViews { get; set; }
    public int ActiveSubscriptions { get; set; }
}

public class DayCountDto
{
    public DateTime Date { get; set; }
    public int Count { get; set; }
}

public class NameCountDto
{
    public string Name { get; set; } = null!;
    public int Count { get; set; }
}

public class SubscriptionBreakdownDto
{
    public int Free { get; set; }
    public int Pro { get; set; }
}

public class AdminAnalyticsDto
{
    public List<DayCountDto> SignupsByDay { get; set; } = [];
    public List<NameCountDto> TemplatePopularity { get; set; } = [];
    public SubscriptionBreakdownDto SubscriptionBreakdown { get; set; } = new();
}

public class AdminUserPortfolioDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string Slug { get; set; } = null!;
}

public class AdminUserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? ProfilePhotoUrl { get; set; }
    public bool IsAdmin { get; set; }
    public string SubscriptionTier { get; set; } = "free";
    public bool IsBanned { get; set; }
    public bool IsApproved { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public List<AdminUserPortfolioDto> Portfolios { get; set; } = [];
}

public class AdminComplaintDto
{
    public Guid Id { get; set; }
    public string UserName { get; set; } = null!;
    public string UserEmail { get; set; } = null!;
    public string Subject { get; set; } = null!;
    public string Message { get; set; } = null!;
    public string Status { get; set; } = "open";
    public DateTime CreatedAt { get; set; }
}

public class AdminBugReportDto
{
    public Guid Id { get; set; }
    public string UserName { get; set; } = null!;
    public string UserEmail { get; set; } = null!;
    public string Description { get; set; } = null!;
    public string? PageUrl { get; set; }
    public string Status { get; set; } = "open";
    public DateTime CreatedAt { get; set; }
}
