import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { usersAPI, resolveAssetUrl } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useSiteSettings } from '../context/SiteSettingsContext'
import './Modal.css'
import './UserListModal.css'

/**
 * Shared popup for any "list of users" view (followers, following, likers-with-follow-buttons
 * planned for reuse). fetcher: async () => UserChipDto[].
 */
export default function UserListModal({ title, fetcher, onClose, emptyText = 'Nobody here yet.' }) {
  const { user: currentUser, isAuthenticated } = useAuth()
  const { enableFollowSystem } = useSiteSettings()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetcher()
      .then(res => setUsers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleToggleFollow = async (userId) => {
    if (!isAuthenticated) return
    const target = users.find(u => u.userId === userId)
    if (!target) return
    setUsers(prev => prev.map(u => u.userId === userId ? { ...u, isFollowedByMe: !u.isFollowedByMe } : u))
    try {
      await usersAPI.follow(userId)
    } catch {
      setUsers(prev => prev.map(u => u.userId === userId ? { ...u, isFollowedByMe: target.isFollowedByMe } : u))
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box user-list-modal-box animate-in" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        <div className="modal-title">{title}</div>

        <div className="user-list-scroll">
          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : users.length === 0 ? (
            <p className="user-list-empty">{emptyText}</p>
          ) : (
            users.map(u => (
              <div key={u.userId} className="user-list-row">
                <Link to={`/user/${u.userId}`} className="user-list-identity" onClick={onClose}>
                  <span className="user-list-avatar">
                    {u.avatarUrl ? (
                      <img src={resolveAssetUrl(u.avatarUrl)} alt={u.username} />
                    ) : (
                      <span>{u.username?.[0]?.toUpperCase() || '?'}</span>
                    )}
                  </span>
                  <span>@{u.username}</span>
                </Link>
                {isAuthenticated && enableFollowSystem && currentUser?.id !== u.userId && (
                  <button
                    type="button"
                    className={`btn ${u.isFollowedByMe ? 'btn-secondary' : 'btn-primary'} user-list-follow-btn`}
                    onClick={() => handleToggleFollow(u.userId)}
                  >
                    {u.isFollowedByMe ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
