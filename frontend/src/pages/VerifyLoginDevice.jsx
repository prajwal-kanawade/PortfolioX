import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import '../styles/Auth.css'

export default function VerifyLoginDevice() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { completeVerifiedLogin } = useAuth()
  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('This verification link is missing its token.')
      return
    }

    authAPI.verifyLoginDevice(token)
      .then(res => {
        completeVerifiedLogin(res.data)
        setStatus('success')
        setTimeout(() => navigate('/dashboard'), 1000)
      })
      .catch(err => {
        setStatus('error')
        setMessage(err.response?.data?.message || 'This verification link is invalid or has expired.')
      })
  }, [searchParams, completeVerifiedLogin, navigate])

  return (
    <div className="auth-container">
      <div className="auth-card card">
        {status === 'verifying' && <h1>Verifying...</h1>}

        {status === 'success' && (
          <>
            <h1>Device verified!</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Logging you in...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <h1>Verification failed</h1>
            <div className="error">{message}</div>
            <p className="auth-footer">
              <Link to="/login">Back to login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
