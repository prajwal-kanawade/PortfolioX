using System.Text.RegularExpressions;

namespace PortfolioX.Services;

public static class UserAgentParser
{
    private static readonly (string Label, Regex Pattern)[] BrowserPatterns =
    [
        ("Edge", new Regex("Edg/", RegexOptions.Compiled)),
        ("Chrome", new Regex("Chrome/", RegexOptions.Compiled)),
        ("Firefox", new Regex("Firefox/", RegexOptions.Compiled)),
        ("Safari", new Regex("Version/.*Safari/", RegexOptions.Compiled)),
        ("Opera", new Regex("OPR/", RegexOptions.Compiled)),
    ];

    private static readonly (string Label, Regex Pattern)[] OsPatterns =
    [
        ("Windows", new Regex("Windows NT", RegexOptions.Compiled)),
        ("macOS", new Regex("Mac OS X", RegexOptions.Compiled)),
        ("iOS", new Regex("iPhone|iPad", RegexOptions.Compiled)),
        ("Android", new Regex("Android", RegexOptions.Compiled)),
        ("Linux", new Regex("Linux", RegexOptions.Compiled)),
    ];

    public static (string Browser, string OperatingSystem) Parse(string? userAgent)
    {
        if (string.IsNullOrWhiteSpace(userAgent))
            return ("Unknown", "Unknown");

        var browser = BrowserPatterns.FirstOrDefault(p => p.Pattern.IsMatch(userAgent)).Label ?? "Unknown";
        var os = OsPatterns.FirstOrDefault(p => p.Pattern.IsMatch(userAgent)).Label ?? "Unknown";

        return (browser, os);
    }
}
