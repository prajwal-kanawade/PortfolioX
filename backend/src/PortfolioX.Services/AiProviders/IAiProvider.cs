using PortfolioX.Core.DTOs;

namespace PortfolioX.Services.AiProviders;

public interface IAiProvider
{
    Task<string> CallAsync(string systemPrompt, List<AiChatMessageDto> history, string apiKey, string? model);
}
