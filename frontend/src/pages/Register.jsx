import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { CheckCircle2 } from 'lucide-react'
import PasswordInput from '../components/PasswordInput'
import '../styles/Auth.css'

export default function Register() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { register, error } = useAuth()
  const redirect = searchParams.get('redirect')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: ''
  })

  const [emailVerified, setEmailVerified] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [otpMessage, setOtpMessage] = useState('')

  const handleEmailChange = (value) => {
    setFormData({ ...formData, email: value })
    if (emailVerified || otpSent) {
      setEmailVerified(false)
      setOtpSent(false)
      setOtp('')
      setOtpError('')
      setOtpMessage('')
    }
  }

  const handleSendOtp = async () => {
    if (!formData.email) return
    setOtpError('')
    setOtpMessage('')
    setSendingOtp(true)
    try {
      await authAPI.sendOtp(formData.email)
      setOtpSent(true)
      setOtpMessage('Code sent - check your email.')
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Could not send verification code.')
    } finally {
      setSendingOtp(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp) return
    setOtpError('')
    setVerifyingOtp(true)
    try {
      await authAPI.verifyOtp(formData.email, otp)
      setEmailVerified(true)
      setOtpSent(false)
      setOtpMessage('')
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Incorrect code.')
    } finally {
      setVerifyingOtp(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setLoading(true)

    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      })
      // After successful registration, redirect to login page
      navigate(redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login')
    } catch (err) {
      setFormError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <h1>Create Account</h1>
        {(formError || error) && <div className="error">{formError || error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                required
                style={{ flex: 1 }}
                value={formData.email}
                onChange={(e) => handleEmailChange(e.target.value)}
              />
              {emailVerified ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontSize: '14px', whiteSpace: 'nowrap' }}>
                  <CheckCircle2 size={18} /> Verified
                </span>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleSendOtp}
                  disabled={!formData.email || sendingOtp}
                >
                  {sendingOtp ? 'Sending...' : otpSent ? 'Resend' : 'Verify'}
                </button>
              )}
            </div>

            {otpSent && !emailVerified && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="6-digit code"
                  style={{ flex: 1 }}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleVerifyOtp}
                  disabled={!otp || verifyingOtp}
                >
                  {verifyingOtp ? 'Checking...' : 'Confirm Code'}
                </button>
              </div>
            )}

            {otpMessage && <small style={{ color: 'var(--accent)' }}>{otpMessage}</small>}
            {otpError && <div className="error" style={{ marginTop: '8px' }}>{otpError}</div>}
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <PasswordInput
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading || !emailVerified}>
            {loading ? 'Creating account...' : emailVerified ? 'Register' : 'Verify your email to continue'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'}>Login</Link>
        </p>
      </div>
    </div>
  )
}
