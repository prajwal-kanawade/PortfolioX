namespace PortfolioX.Core.DTOs;

public class NotificationDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Message { get; set; }
    public string NotificationType { get; set; } = "system";
    public string? Link { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class NotificationListDto
{
    public List<NotificationDto> Items { get; set; } = [];
    public int UnreadCount { get; set; }
}
