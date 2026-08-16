import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { adminAPI, resolveAssetUrl } from '../services/api'
import './Modal.css'

export default function AdminUserProfileModal({ userId, onClose }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    adminAPI.getUser(userId)
      .then((res) => { if (!cancelled) setDetail(res.data) })
      .catch(() => { if (!cancelled) setError('Could not load user profile.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [userId])

  const initials = detail
    ? `${detail.firstName?.[0] || ''}${detail.lastName?.[0] || detail.username?.[0] || ''}`.toUpperCase()
    : ''

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        <div className="modal-title">User Profile</div>

        {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>}
        {error && <div className="error">{error}</div>}

        {detail && (
          <>
            <div className="modal-avatar-row">
              {detail.profilePhotoUrl ? (
                <img className="modal-avatar" src={resolveAssetUrl(detail.profilePhotoUrl)} alt={detail.username} />
              ) : (
                <div className="modal-avatar">{initials || '?'}</div>
              )}
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>
                  {detail.firstName || detail.lastName ? `${detail.firstName || ''} ${detail.lastName || ''}`.trim() : detail.username}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>@{detail.username}</div>
              </div>
            </div>

            <div className="modal-field-row">
              <span className="modal-field-label">Email</span>
              <span className="modal-field-value">{detail.email}</span>
            </div>
            <div className="modal-field-row">
              <span className="modal-field-label">Plan</span>
              <span className="modal-field-value" style={{ textTransform: 'capitalize' }}>{detail.subscriptionTier}</span>
            </div>
            <div className="modal-field-row">
              <span className="modal-field-label">Joined</span>
              <span className="modal-field-value">{new Date(detail.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="modal-field-row" style={{ borderBottom: 'none' }}>
              <span className="modal-field-label">Role</span>
              <span className="modal-field-value">{detail.isAdmin ? 'Admin' : 'User'}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
