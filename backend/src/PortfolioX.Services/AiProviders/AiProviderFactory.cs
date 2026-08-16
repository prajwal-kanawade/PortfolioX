namespace PortfolioX.Services.AiProviders;

public class AiProviderFactory
{
    private readonly GroqProvider _groq;
    private readonly GeminiProvider _gemini;

    public AiProviderFactory(GroqProvider groq, GeminiProvider gemini)
    {
        _groq = groq;
        _gemini = gemini;
    }

    public IAiProvider Resolve(string? providerName) => providerName switch
    {
        "gemini" => _gemini,
        _ => _groq
    };
}
