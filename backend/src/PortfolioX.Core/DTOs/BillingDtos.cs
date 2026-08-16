namespace PortfolioX.Core.DTOs;

public class CreateRazorpayOrderResponse
{
    public string OrderId { get; set; } = null!;
    public int AmountInPaise { get; set; }
    public string Currency { get; set; } = null!;
    public string KeyId { get; set; } = null!;
}

public class VerifyRazorpayPaymentRequest
{
    public string RazorpayOrderId { get; set; } = null!;
    public string RazorpayPaymentId { get; set; } = null!;
    public string RazorpaySignature { get; set; } = null!;
}
