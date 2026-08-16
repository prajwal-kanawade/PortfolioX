using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace PortfolioX.Services;

public record RazorpayOrder(string OrderId, int AmountInPaise, string Currency, string KeyId);

public interface IRazorpayService
{
    Task<RazorpayOrder> CreateOrderAsync(decimal amountInRupees, string currency, string receipt);
    bool VerifyPaymentSignature(string orderId, string paymentId, string signature);
}

public class RazorpayService : IRazorpayService
{
    private readonly HttpClient _httpClient;
    private readonly string _keyId;
    private readonly string _keySecret;

    public RazorpayService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _keyId = configuration["Razorpay:KeyId"] ?? throw new InvalidOperationException("Razorpay:KeyId not configured");
        _keySecret = configuration["Razorpay:KeySecret"] ?? throw new InvalidOperationException("Razorpay:KeySecret not configured");

        _httpClient.BaseAddress = new Uri("https://api.razorpay.com/v1/");
        var authBytes = Encoding.ASCII.GetBytes($"{_keyId}:{_keySecret}");
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(authBytes));
    }

    public async Task<RazorpayOrder> CreateOrderAsync(decimal amountInRupees, string currency, string receipt)
    {
        var amountInPaise = (int)(amountInRupees * 100);

        var response = await _httpClient.PostAsJsonAsync("orders", new
        {
            amount = amountInPaise,
            currency,
            receipt,
            payment_capture = 1
        });

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"Razorpay order creation failed: {response.StatusCode} - {body}");
        }

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        var orderId = json.GetProperty("id").GetString()!;

        return new RazorpayOrder(orderId, amountInPaise, currency, _keyId);
    }

    public bool VerifyPaymentSignature(string orderId, string paymentId, string signature)
    {
        var payload = $"{orderId}|{paymentId}";
        var keyBytes = Encoding.UTF8.GetBytes(_keySecret);
        using var hmac = new HMACSHA256(keyBytes);
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        var computedSignature = Convert.ToHexString(hash).ToLowerInvariant();

        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(computedSignature),
            Encoding.UTF8.GetBytes(signature));
    }
}
