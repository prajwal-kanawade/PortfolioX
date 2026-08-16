import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { X, Camera, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authAPI, resolveAssetUrl } from '../services/api'
import './Modal.css'

export default function ProfileModal({ onClose }) {
  const { user, refreshUser, updateProfile } = useAuth()
  const fileInputRef = useRef(null)

  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [savingName, setSavingName] = useState(false)
  const [nameMessage, setNameMessage] = useState('')

  const [uploading, setUploading] = useState(false)
  const [photoError, setPhotoError] = useState('')

  const [changingEmail, setChangingEmail] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [emailBusy, setEmailBusy] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailMessage, setEmailMessage] = useState('')

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || user?.username?.[0] || ''}`.toUpperCase()

  const handlePhotoPick = () => fileInputRef.current?.click()

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoError('')
    setUploading(true)
    try {
      await authAPI.uploadProfilePhoto(file)
      await refreshUser()
    } catch (err) {
      setPhotoError(err.response?.data?.message || 'Could not upload photo.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleSaveName = async (e) => {
    e.preventDefault()
    setNameMessage('')
    setSavingName(true)
    try {
      await updateProfile({ firstName, lastName })
      setNameMessage('Saved.')
    } catch {
      // updateProfile already sets AuthContext error
    } finally {
      setSavingName(false)
    }
  }

  const startEmailChange = () => {
    setChangingEmail(true)
    setNewEmail('')
    setOtpSent(false)
    setOtp('')
    setEmailError('')
    setEmailMessage('')
  }

  const handleSendEmailOtp = async () => {
    if (!newEmail) return
    setEmailError('')
    setEmailBusy(true)
    try {
      await authAPI.requestEmailChange(newEmail)
      setOtpSent(true)
      setEmailMessage('Code sent to the new address - check its inbox.')
    } catch (err) {
      setEmailError(err.response?.data?.message || 'Could not send verification code.')
    } finally {
      setEmailBusy(false)
    }
  }

  const handleConfirmEmailChange = async () => {
    if (!otp) return
    setEmailError('')
    setEmailBusy(true)
    try {
      await authAPI.confirmEmailChange(newEmail, otp)
      await refreshUser()
      setChangingEmail(false)
      setEmailMessage('')
    } catch (err) {
      setEmailError(err.response?.data?.message || 'Incorrect code.')
    } finally {
      setEmailBusy(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        <div className="modal-title">Your Profile</div>

        <div className="modal-avatar-row">
          {user?.profilePhotoUrl ? (
            <img className="modal-avatar" src={resolveAssetUrl(user.profilePhotoUrl)} alt="Profile" />
          ) : (
            <div className="modal-avatar">{initials || '?'}</div>
          )}
          <div className="modal-avatar-upload">
            <button type="button" className="btn btn-secondary" onClick={handlePhotoPick} disabled={uploading}>
              <Camera size={16} /> {uploading ? 'Uploading...' : 'Change photo'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handlePhotoChange} />
            {photoError && <small style={{ color: '#ff6b6b' }}>{photoError}</small>}
          </div>
        </div>

        <form onSubmit={handleSaveName}>
          <div className="form-group">
            <label>First Name</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button type="submit" className="btn btn-primary" disabled={savingName}>
              {savingName ? 'Saving...' : 'Save Name'}
            </button>
            {nameMessage && <small style={{ color: 'var(--accent)' }}>{nameMessage}</small>}
          </div>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <div className="modal-field-row" style={{ border: 'none', padding: 0 }}>
            <div>
              <div className="modal-field-label">Email</div>
              <div className="modal-field-value">{user?.email}</div>
            </div>
            {!changingEmail && (
              <button type="button" className="btn btn-secondary" onClick={startEmailChange}>Change email</button>
            )}
          </div>

          {changingEmail && (
            <div style={{ marginTop: '14px' }}>
              <div className="form-group">
                <label>New email address</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="email"
                    style={{ flex: 1 }}
                    value={newEmail}
                    onChange={(e) => { setNewEmail(e.target.value); setOtpSent(false); setOtp('') }}
                    disabled={otpSent}
                  />
                  <button type="button" className="btn btn-secondary" onClick={handleSendEmailOtp} disabled={!newEmail || emailBusy}>
                    {emailBusy && !otpSent ? 'Sending...' : otpSent ? 'Resend' : 'Send code'}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div className="form-group">
                  <label>6-digit code</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      style={{ flex: 1 }}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <button type="button" className="btn btn-primary" onClick={handleConfirmEmailChange} disabled={!otp || emailBusy}>
                      {emailBusy ? 'Confirming...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              )}

              {emailMessage && (
                <small style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} /> {emailMessage}
                </small>
              )}
              {emailError && <div className="error" style={{ marginTop: '8px' }}>{emailError}</div>}

              <button type="button" className="btn btn-secondary" style={{ marginTop: '10px' }} onClick={() => setChangingEmail(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
          <Link to="/settings" className="btn btn-secondary" onClick={onClose}>
            All settings →
          </Link>
        </div>
      </div>
    </div>
  )
}
