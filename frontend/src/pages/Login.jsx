import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PasswordInput from '../components/PasswordInput'
import '../styles/Auth.css'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, error } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '', rememberDevice: false })
  const [formError, setFormError] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)

  const redirect = searchParams.get('redirect')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setLoading(true)

    try {
      const result = await login(formData)
      if (result.requiresVerification) {
        setPendingVerification(true)
      } else {
        navigate(redirect || '/dashboard')
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  if (pendingVerification) {
    return (
      <div className="auth-container">
        <div className="auth-card card">
          <h1>Check your email</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            We don't recognize this device, so we sent a verification link to <strong>{formData.email}</strong>.
            Open it to finish logging in.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <h1>Login</h1>
        {(formError || error) && <div className="error">{formError || error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <PasswordInput
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <Link to="/forgot-password" style={{ fontSize: '13px', alignSelf: 'flex-end', color: 'var(--accent)' }}>Forgot password?</Link>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={formData.rememberDevice}
                onChange={(e) => setFormData({ ...formData, rememberDevice: e.target.checked })}
              />
              Remember this device
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register'}>Register</Link>
        </p>
      </div>
    </div>
  )
}
