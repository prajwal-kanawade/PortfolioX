using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;
using PortfolioX.Infrastructure;

namespace PortfolioX.Services;

public interface IEmailService
{
    Task SendAsync(string toEmail, string subject, string body, bool isHtml = false);
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly AppDbContext _context;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger, AppDbContext context)
    {
        _configuration = configuration;
        _logger = logger;
        _context = context;
    }

    public async Task SendAsync(string toEmail, string subject, string body, bool isHtml = false)
    {
        var siteSettings = await _context.SiteSettings.AsNoTracking().FirstOrDefaultAsync(s => s.Id == 1);

        var host = FirstNonEmpty(siteSettings?.SmtpHost, _configuration["Email:Smtp:Host"]);
        if (string.IsNullOrWhiteSpace(host))
        {
            _logger.LogInformation(
                "[DEV EMAIL] To: {ToEmail} | Subject: {Subject}\n{Body}",
                toEmail, subject, body);
            return;
        }

        var port = int.Parse(FirstNonEmpty(siteSettings?.SmtpPort, _configuration["Email:Smtp:Port"]) ?? "587");
        var username = FirstNonEmpty(siteSettings?.SmtpUsername, _configuration["Email:Smtp:Username"]);
        var password = FirstNonEmpty(siteSettings?.SmtpPassword, _configuration["Email:Smtp:Password"]);
        var fromEmail = FirstNonEmpty(siteSettings?.SmtpFromEmail, _configuration["Email:Smtp:FromEmail"]) ?? username;
        var fromName = FirstNonEmpty(siteSettings?.SmtpFromName, _configuration["Email:Smtp:FromName"]) ?? "PortfolioX";

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(fromName, fromEmail));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;
        message.Body = new TextPart(isHtml ? "html" : "plain") { Text = body };

        using var client = new SmtpClient();
        await client.ConnectAsync(host, port, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(username, password);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }

    private static string? FirstNonEmpty(string? primary, string? fallback) =>
        string.IsNullOrWhiteSpace(primary) ? fallback : primary;
}
