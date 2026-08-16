using Microsoft.EntityFrameworkCore;
using PortfolioX.Core.DTOs;
using PortfolioX.Core.Entities;
using PortfolioX.Infrastructure;

namespace PortfolioX.Services;

public interface INotificationService
{
    Task CreateAsync(Guid userId, string title, string? message, string notificationType, string? link);
    Task<NotificationListDto> GetForUserAsync(Guid userId);
    Task<bool> MarkReadAsync(Guid notificationId, Guid userId);
    Task<int> GetUnreadCountAsync(Guid userId);
}

public class NotificationService : INotificationService
{
    private const int MaxRecent = 30;
    private readonly AppDbContext _context;

    public NotificationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task CreateAsync(Guid userId, string title, string? message, string notificationType, string? link)
    {
        _context.Notifications.Add(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = title,
            Message = message,
            NotificationType = notificationType,
            Link = link,
        });
        await _context.SaveChangesAsync();
    }

    public async Task<NotificationListDto> GetForUserAsync(Guid userId)
    {
        var items = await _context.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(MaxRecent)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                NotificationType = n.NotificationType,
                Link = n.Link,
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt,
            })
            .ToListAsync();

        var unreadCount = await _context.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);

        return new NotificationListDto { Items = items, UnreadCount = unreadCount };
    }

    public async Task<bool> MarkReadAsync(Guid notificationId, Guid userId)
    {
        var notification = await _context.Notifications.FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);
        if (notification == null) return false;

        notification.IsRead = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public Task<int> GetUnreadCountAsync(Guid userId) =>
        _context.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);
}
