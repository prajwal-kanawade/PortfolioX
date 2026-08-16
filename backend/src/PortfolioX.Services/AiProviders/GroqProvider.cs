using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using PortfolioX.Core.DTOs;

namespace PortfolioX.Services.AiProviders;

public class GroqProvider : IAiProvider
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<GroqProvider> _logger;

    public GroqProvider(HttpClient httpClient, ILogger<GroqProvider> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<string> CallAsync(string systemPrompt, List<AiChatMessageDto> history, string apiKey, string? model)
    {
        var resolvedModel = string.IsNullOrWhiteSpace(model) ? "llama-3.3-70b-versatile" : model;

        var messages = new List<object> { new { role = "system", content = systemPrompt } };
        messages.AddRange(history.Select(m => (object)new { role = m.Role == "assistant" ? "assistant" : "user", content = m.Content }));

        var payload = new { model = resolvedModel, messages };
        var json = JsonSerializer.Serialize(payload);

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.groq.com/openai/v1/chat/completions")
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

        using var response = await _httpClient.SendAsync(request);
        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Groq API call failed: {Status} {Body}", response.StatusCode, responseBody);
            return "";
        }

        using var doc = JsonDocument.Parse(responseBody);
        return doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? "";
    }
}
