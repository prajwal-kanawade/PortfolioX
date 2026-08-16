import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import '../styles/Auth.css'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState('email') // 'email' | 'reset'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [sending, setSending] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSendCode = async (e) => {
    e.preventDefault()
    setError('')
    setSending(true)
    try {
      await authAPI.forgotPassword(email)
      setMessage('If that email is registered, a reset code was sent.')
      setStep('reset')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send reset code.')
    } finally {
      setSending(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    setResetting(true)
    try {
      await authAPI.resetPassword(email, otp, newPassword)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset password.')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <h1>Reset Password</h1>
        {error && <div className="error">{error}</div>}
        {message && step === 'reset' && <small style={{ color: 'var(--accent)', display: 'block', marginBottom: '16px' }}>{message}</small>}

        {step === 'email' ? (
          <form onSubmit={handleSendCode}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={sending}>
              {sending ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <div className="form-group">
              <label>6-digit code</label>
              <input
                type="text"
                inputMode="numeric"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={resetting}>
              {resetting ? 'Resetting...' : 'Reset Password'}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-full"
              style={{ marginTop: '10px' }}
              onClick={() => setStep('email')}
            >
              Use a different email
            </button>
          </form>
        )}

        <p className="auth-footer">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  )
}
