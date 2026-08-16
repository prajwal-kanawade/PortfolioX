import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { Menu, X, Palette, User } from 'lucide-react'
import { useState } from 'react'
import ProfileModal from './ProfileModal'
import NotificationsDropdown from './NotificationsDropdown'
import Logo from './logos/Logo'
import { resolveAssetUrl } from '../services/api'
import './Navbar.css'

const THEME_LABELS = {
  light: 'Light',
  dark: 'Dark',
  ocean: 'Ocean',
  sunset: 'Sunset',
  'midnight-purple': 'Midnight Purple',
}

export default function Navbar() {
  const { user, isAuthenticated, logout, isAdmin, isPro } = useAuth()
  const { theme, cycleTheme, THEMES } = useTheme()
  const { websiteName, activeLogoKey } = useSiteSettings()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="logo">
            <Logo variant={activeLogoKey} siteName={websiteName} />
          </Link>
        </div>

        <button className="nav-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-menu ${mobileOpen ? 'active' : ''}`}>
          <Link to="/marketplace" onClick={() => setMobileOpen(false)}>Marketplace</Link>
          <Link to="/explore" onClick={() => setMobileOpen(false)}>Explore</Link>

          <button
            className="btn btn-secondary nav-theme-toggle"
            onClick={cycleTheme}
            aria-label={`Theme: ${THEME_LABELS[theme] || theme}. Click to switch theme.`}
            title={`Theme: ${THEME_LABELS[theme] || theme} (click to cycle — ${THEMES.length} themes available)`}
          >
            <Palette size={18} />
          </button>

          {isAuthenticated ? (
            <>
              {!isAdmin && <Link to="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</Link>}
              <Link to="/security" onClick={() => setMobileOpen(false)}>Security</Link>
              {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)}>Admin</Link>}
              <span className="nav-user">
                {user?.username || 'User'}
                {isPro && <span className="nav-pro-badge">PRO</span>}
              </span>
              <NotificationsDropdown />
              <button
                className="nav-avatar-btn"
                onClick={() => setProfileOpen(true)}
                aria-label="Open your profile"
                title="Your profile"
              >
                {user?.profilePhotoUrl ? (
                  <img src={resolveAssetUrl(user.profilePhotoUrl)} alt="" className="nav-avatar-img" />
                ) : (
                  <User size={18} />
                )}
              </button>
              <button className="btn btn-secondary" onClick={() => { handleLogout(); setMobileOpen(false); }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn btn-secondary">Login</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
    </nav>
  )
}
