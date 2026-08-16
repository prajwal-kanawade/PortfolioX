using Microsoft.EntityFrameworkCore;
using PortfolioX.Core.DTOs;
using PortfolioX.Infrastructure;

namespace PortfolioX.Services;

public interface IEmailTemplateService
{
    Task<(string Subject, string Html)> RenderAsync(string templateKey, Dictionary<string, string> placeholders);
    Task<List<EmailTemplateDto>> GetAllAsync();
    Task<EmailTemplateDto?> GetByKeyAsync(string templateKey);
    Task<EmailTemplateDto?> UpdateAsync(string templateKey, string subject, string htmlBody);
}

public class EmailTemplateService : IEmailTemplateService
{
    private readonly AppDbContext _context;

    public EmailTemplateService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(string Subject, string Html)> RenderAsync(string templateKey, Dictionary<string, string> placeholders)
    {
        var template = await _context.EmailTemplates.AsNoTracking().FirstOrDefaultAsync(t => t.TemplateKey == templateKey);
        if (template == null)
            throw new InvalidOperationException($"Email template '{templateKey}' is not seeded.");

        return (Apply(template.Subject, placeholders), Apply(template.HtmlBody, placeholders));
    }

    public async Task<List<EmailTemplateDto>> GetAllAsync()
    {
        return await _context.EmailTemplates
            .AsNoTracking()
            .OrderBy(t => t.TemplateKey)
            .Select(t => new EmailTemplateDto { Id = t.Id, TemplateKey = t.TemplateKey, Subject = t.Subject, HtmlBody = t.HtmlBody, UpdatedAt = t.UpdatedAt })
            .ToListAsync();
    }

    public async Task<EmailTemplateDto?> GetByKeyAsync(string templateKey)
    {
        var t = await _context.EmailTemplates.AsNoTracking().FirstOrDefaultAsync(x => x.TemplateKey == templateKey);
        return t == null ? null : new EmailTemplateDto { Id = t.Id, TemplateKey = t.TemplateKey, Subject = t.Subject, HtmlBody = t.HtmlBody, UpdatedAt = t.UpdatedAt };
    }

    public async Task<EmailTemplateDto?> UpdateAsync(string templateKey, string subject, string htmlBody)
    {
        var template = await _context.EmailTemplates.FirstOrDefaultAsync(t => t.TemplateKey == templateKey);
        if (template == null) return null;

        template.Subject = subject;
        template.HtmlBody = htmlBody;
        template.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return new EmailTemplateDto { Id = template.Id, TemplateKey = template.TemplateKey, Subject = template.Subject, HtmlBody = template.HtmlBody, UpdatedAt = template.UpdatedAt };
    }

    private static string Apply(string text, Dictionary<string, string> placeholders)
    {
        foreach (var (key, value) in placeholders)
            text = text.Replace($"{{{{{key}}}}}", value ?? "");
        return text;
    }
}
