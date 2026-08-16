import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { notificationsAPI } from '../services/api'
import './NotificationsDropdown.css'

const POLL_INTERVAL_MS = 30000

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function NotificationsDropdown() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const containerRef = useRef(null)

  const load = () => {
    notificationsAPI.getAll()
      .then(res => {
        setItems(res.data.items || [])
        setUnreadCount(res.data.unreadCount || 0)
      })
      .catch(() => {})
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = () => {
    setOpen(o => {
      if (!o) load()
      return !o
    })
  }

  const handleClickNotification = async (n) => {
    if (!n.isRead) {
      try {
        await notificationsAPI.markRead(n.id)
        setItems(prev => prev.map(i => i.id === n.id ? { ...i, isRead: true } : i))
        setUnreadCount(c => Math.max(0, c - 1))
      } catch {
        // non-fatal - still navigate
      }
    }
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  return (
    <div className="notif-container" ref={containerRef}>
      <button
        type="button"
        className="btn btn-secondary notif-bell-btn"
        onClick={handleToggle}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-panel animate-in">
          <div className="notif-panel-header">Notifications</div>
          {items.length === 0 ? (
            <p className="notif-empty">No notifications yet.</p>
          ) : (
            <ul className="notif-list">
              {items.map(n => (
                <li key={n.id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}>
                  <button type="button" onClick={() => handleClickNotification(n)}>
                    <div className="notif-item-title">{n.title}</div>
                    {n.message && <div className="notif-item-message">{n.message}</div>}
                    <div className="notif-item-time">{timeAgo(n.createdAt)}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
