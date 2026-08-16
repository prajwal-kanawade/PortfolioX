import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { billingAPI } from '../services/api'
import { Check, CreditCard, Sparkles } from 'lucide-react'
import './Upgrade.css'

export default function Upgrade() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isPro, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const redirect = searchParams.get('redirect')

  const handlePay = async () => {
    setError('')

    if (!window.Razorpay) {
      setError('Payment gateway failed to load. Check your connection and try again.')
      return
    }

    setLoading(true)
    try {
      const { data: order } = await billingAPI.createRazorpayOrder()

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amountInPaise,
        currency: order.currency,
        order_id: order.orderId,
        name: 'PortfolioX',
        description: 'Pro Plan - monthly subscription',
        prefill: {
          name: [user?.firstName, user?.lastName].filter(Boolean).join(' '),
          email: user?.email
        },
        theme: { color: '#6366f1' },
        handler: async (response) => {
          try {
            await billingAPI.verifyRazorpayPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            })
            await refreshUser()
            setDone(true)
          } catch (err) {
            setError(err.response?.data?.message || 'Payment succeeded but verification failed. Contact support.')
          } finally {
            setLoading(false)
          }
        },
        modal: {
          ondismiss: () => setLoading(false)
        }
      })

      razorpay.on('payment.failed', (response) => {
        setError(response.error?.description || 'Payment failed. Please try again.')
        setLoading(false)
      })

      razorpay.open()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start checkout. Please try again.')
      setLoading(false)
    }
  }

  if (isPro || done) {
    return (
      <div className="upgrade-container">
        <div className="card upgrade-success">
          <div className="upgrade-success-icon"><Check size={32} /></div>
          <h1>You're on Pro!</h1>
          <p>Unlimited portfolios, all templates, custom domain, and the AI portfolio builder are unlocked.</p>
          <div className="upgrade-success-actions">
            <button className="btn btn-primary" onClick={() => navigate(redirect || '/ai-builder')}>
              <Sparkles size={18} /> Try the AI Builder
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="upgrade-container">
      <div className="upgrade-grid">
        <div className="card upgrade-summary">
          <span className="upgrade-badge">Pro Plan</span>
          <h1>₹1500<small>/month</small></h1>
          <ul className="upgrade-features">
            <li><Check size={16} /> Unlimited portfolios</li>
            <li><Check size={16} /> All templates</li>
            <li><Check size={16} /> Custom domain</li>
            <li><Check size={16} /> AI portfolio builder</li>
          </ul>
          <p className="upgrade-note">
            Payments are handled by Razorpay in test mode - no real money moves.
          </p>
        </div>

        <div className="card upgrade-form-card">
          <h2><CreditCard size={20} /> Payment</h2>
          {error && <div className="error">{error}</div>}
          <p className="upgrade-note" style={{ marginBottom: '20px' }}>
            Click below to pay securely through Razorpay Checkout.
          </p>
          <button type="button" className="btn btn-primary btn-full" onClick={handlePay} disabled={loading}>
            {loading ? 'Processing...' : 'Pay ₹1500 with Razorpay'}
          </button>
        </div>
      </div>
    </div>
  )
}
