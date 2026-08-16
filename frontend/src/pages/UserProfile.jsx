import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usersAPI, resolveAssetUrl } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { ArrowLeft } from 'lucide-react'
import UserListModal from '../components/UserListModal'
import './UserProfile.css'

function getInitials(name) {
  if (!name) return '?'
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  return words.slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

export default function UserProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: currentUser, isAuthenticated } = useAuth()
  const { enableFollowSystem } = useSiteSettings()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [followBusy, setFollowBusy] = useState(false)
  const [listModal, setListModal] = useState(null) // 'followers' | 'following' | null

  useEffect(() => {
    setLoading(true)
    setError('')
    usersAPI.getPublicProfile(id)
      .then(res => setProfile(res.data))
      .catch(() => setError('This profile is unavailable.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleBack = () => {
    // navigate(-1) restores wherever the visitor came from (e.g. Explore's scroll/filter
    // state) rather than resetting to a hardcoded route.
    if (window.history.length > 1) navigate(-1)
    else navigate('/explore')
  }

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setFollowBusy(true)
    const wasFollowing = profile.isFollowedByMe
    setProfile(p => ({ ...p, isFollowedByMe: !wasFollowing, followerCount: p.followerCount + (wasFollowing ? -1 : 1) }))
    try {
      const res = await usersAPI.follow(id)
      setProfile(p => ({ ...p, isFollowedByMe: res.data.following, followerCount: res.data.followerCount }))
    } catch {
      setProfile(p => ({ ...p, isFollowedByMe: wasFollowing, followerCount: p.followerCount + (wasFollowing ? 1 : -1) }))
    } finally {
      setFollowBusy(false)
    }
  }

  const isOwnProfile = isAuthenticated && currentUser?.id === id

  return (
    <div className="user-profile-page">
      <button type="button" className="user-profile-back" onClick={handleBack} aria-label="Go back">
        <ArrowLeft size={18} /> Back
      </button>

      {loading && <div className="loading"><div className="spinner"></div></div>}

      {!loading && error && (
        <div className="user-profile-empty">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && profile && (
        <div className="user-profile-card">
          <div className="user-profile-avatar">
            {profile.avatarUrl ? (
              <img src={resolveAssetUrl(profile.avatarUrl)} alt={profile.username} />
            ) : (
              <span>{getInitials(profile.fullName || profile.username)}</span>
            )}
          </div>
          <h1 className="user-profile-username">@{profile.username}</h1>
          {profile.fullName && <p className="user-profile-name">{profile.fullName}</p>}

          <div className="user-profile-follow-counts">
            <button type="button" className="user-profile-follow-count" onClick={() => setListModal('followers')}>
              <strong>{profile.followerCount}</strong> Followers
            </button>
            <button type="button" className="user-profile-follow-count" onClick={() => setListModal('following')}>
              <strong>{profile.followingCount}</strong> Following
            </button>
          </div>

          {!isOwnProfile && enableFollowSystem && (
            <button
              type="button"
              className={`btn ${profile.isFollowedByMe ? 'btn-secondary' : 'btn-primary'} user-profile-follow-btn`}
              onClick={handleToggleFollow}
              disabled={followBusy}
            >
              {profile.isFollowedByMe ? 'Following' : 'Follow'}
            </button>
          )}

          {profile.bio && <p className="user-profile-bio">{profile.bio}</p>}
        </div>
      )}

      {listModal === 'followers' && (
        <UserListModal
          title="Followers"
          fetcher={() => usersAPI.getFollowers(id)}
          onClose={() => setListModal(null)}
          emptyText="No followers yet."
        />
      )}
      {listModal === 'following' && (
        <UserListModal
          title="Following"
          fetcher={() => usersAPI.getFollowing(id)}
          onClose={() => setListModal(null)}
          emptyText="Not following anyone yet."
        />
      )}
    </div>
  )
}
