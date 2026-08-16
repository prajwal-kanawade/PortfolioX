using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using PortfolioX.Core.DTOs;

namespace PortfolioX.Services.AiProviders;

public class GeminiProvider : IAiProvider
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<GeminiProvider> _logger;

    public GeminiProvider(HttpClient httpClient, ILogger<GeminiProvider> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<string> CallAsync(string systemPrompt, List<AiChatMessageDto> history, string apiKey, string? model)
    {
        var resolvedModel = string.IsNullOrWhiteSpace(model) ? "gemini-2.0-flash" : model;

        var contents = history.Select(m => new
        {
            role = m.Role == "assistant" ? "model" : "user",
            parts = new[] { new { text = m.Content } }
        }).ToList();

        var payload = new
        {
            contents,
            systemInstruction = new { parts = new[] { new { text = systemPrompt } } }
        };

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{resolvedModel}:generateContent?key={apiKey}";
        var json = JsonSerializer.Serialize(payload);

        using var response = await _httpClient.PostAsync(url, new StringContent(json, Encoding.UTF8, "application/json"));
        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Gemini API call failed: {Status} {Body}", response.StatusCode, responseBody);
            return "";
        }

        using var doc = JsonDocument.Parse(responseBody);
        return doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString() ?? "";
    }
}
