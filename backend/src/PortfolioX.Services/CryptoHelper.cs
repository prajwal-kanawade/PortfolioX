using System.Security.Cryptography;
using System.Text;

namespace PortfolioX.Services;

public static class CryptoHelper
{
    public static string HashHex(string value)
    {
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}
