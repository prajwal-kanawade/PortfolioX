using System.Text.Json;
using PortfolioX.Core.Entities;
using PortfolioX.Infrastructure;

namespace PortfolioX.API.Middleware;

public class ExceptionLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionLoggingMiddleware> _logger;

    public ExceptionLoggingMiddleware(RequestDelegate next, ILogger<ExceptionLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception on {Method} {Path}", context.Request.Method, context.Request.Path);

            try
            {
                var dbContext = context.RequestServices.GetRequiredService<AppDbContext>();
                dbContext.ErrorLogs.Add(new ErrorLog
                {
                    Id = Guid.NewGuid(),
                    Message = ex.Message,
                    StackTrace = ex.StackTrace,
                    Path = context.Request.Path,
                    HttpMethod = context.Request.Method,
                    StatusCode = 500
                });
                await dbContext.SaveChangesAsync();
            }
            catch
            {
            }

            if (!context.Response.HasStarted)
            {
                context.Response.Clear();
                context.Response.StatusCode = 500;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync(JsonSerializer.Serialize(new { message = "An unexpected error occurred." }));
            }
        }
    }
}
