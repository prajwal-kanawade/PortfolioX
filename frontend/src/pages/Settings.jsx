import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useAppearance } from '../context/AppearanceContext'
import { authAPI, settingsAPI, billingAPI, supportAPI, portfolioAPI, resolveAssetUrl } from '../services/api'
import ProfileModal from '../components/ProfileModal'
import {
  ShieldCheck, User as UserIcon, Lock, CreditCard, Bell, Palette, LayoutTemplate,
  Database, LifeBuoy, CheckCircle2, ChevronDown, Check, Download, LogOut, Trash2
} from 'lucide-react'
import './Settings.css'

const TABS = [
  { key: 'security', label: 'Security', icon: Lock },
  { key: 'account', label: 'Account', icon: UserIcon },
  { key: 'privacy', label: 'Privacy', icon: ShieldCheck },
  { key: 'subscription', label: 'Subscription', icon: CreditCard },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'appearance', label: 'Appearance', icon: Palette },
  { key: 'portfolio', label: 'Portfolio Preferences', icon: LayoutTemplate },
  { key: 'data', label: 'Data Management', icon: Database },
  { key: 'support', label: 'Support', icon: LifeBuoy },
]

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="settings-toggle-row">
      <div>
        <div className="settings-toggle-label">{label}</div>
        {description && <div className="settings-toggle-desc">{description}</div>}
      </div>
      <span className={`settings-switch ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)}>
        <span className="settings-switch-knob" />
      </span>
    </label>
  )
}

export default function Settings() {
  const { user, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState('security')
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileModalOpen, setProfileModalOpen] = useState(false)

  useEffect(() => {
    settingsAPI.get().then(res => setSettings(res.data)).finally(() => setLoading(false))
  }, [])

  const saveSettings = async (patch) => {
    const merged = { ...settings, ...patch }
    setSettings(merged)
    const res = await settingsAPI.update(merged)
    setSettings(res.data)
  }

  if (loading || !settings) return <div className="loading"><div className="spinner"></div></div>

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <nav className="dashboard-sidebar-nav">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`dashboard-sidebar-link ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="dashboard-main">
        <h1 className="settings-page-title">Settings</h1>

        {activeTab === 'security' && <SecurityTab user={user} isAdmin={isAdmin} />}
        {activeTab === 'account' && (
          <AccountTab user={user} onEdit={() => setProfileModalOpen(true)} />
        )}
        {activeTab === 'privacy' && <PrivacyTab settings={settings} saveSettings={saveSettings} />}
        {activeTab === 'subscription' && <SubscriptionTab />}
        {activeTab === 'notifications' && <NotificationsTab settings={settings} saveSettings={saveSettings} />}
        {activeTab === 'appearance' && <AppearanceTab settings={settings} saveSettings={saveSettings} />}
        {activeTab === 'portfolio' && <PortfolioPrefsTab settings={settings} saveSettings={saveSettings} />}
        {activeTab === 'data' && <DataManagementTab />}
        {activeTab === 'support' && <SupportTab />}
      </main>

      {profileModalOpen && <ProfileModal onClose={() => setProfileModalOpen(false)} />}
    </div>
  )
}

function SecurityTab({ user, isAdmin }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }
    setBusy(true)
    try {
      await authAPI.changePassword(currentPassword, newPassword)
      setMessage('Password changed. You will need to log in again on your other devices.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not change password.')
    } finally {
      setBusy(false)
    }
  }

  const handleLogoutAll = async () => {
    if (!confirm('Log out of all devices? You will need to log in again everywhere, including here.')) return
    try {
      await authAPI.logoutAll()
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
    } catch {
      alert('Could not log out of all devices.')
    }
  }

  return (
    <div className="settings-panel">
      <div className="card settings-card">
        <h3 className="settings-section-title">Email verification</h3>
        {isAdmin ? (
          <p className="settings-muted">Admin account - not subject to email verification.</p>
        ) : (
          <div className="settings-verified-badge">
            <CheckCircle2 size={16} /> {user?.email} is verified
          </div>
        )}
      </div>

      <div className="card settings-card">
        <h3 className="settings-section-title">Change password</h3>
        <form onSubmit={handleChangePassword}>
          {error && <div className="error">{error}</div>}
          {message && <div className="success">{message}</div>}
          <div className="form-group">
            <label>Current password</label>
            <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
          </div>
          <div className="form-group">
            <label>New password</label>
            <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Confirm new password</label>
            <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving...' : 'Change password'}
          </button>
        </form>
      </div>

      <div className="card settings-card">
        <h3 className="settings-section-title">Active logins</h3>
        <p className="settings-muted">View trusted devices and login history, or log out everywhere.</p>
        <div className="settings-actions-row">
          <Link to="/security" className="btn btn-secondary">View devices & login history</Link>
          <button className="btn btn-secondary" onClick={handleLogoutAll}>
            <LogOut size={16} /> Log out of all devices
          </button>
        </div>
      </div>
    </div>
  )
}

function AccountTab({ user, onEdit }) {
  return (
    <div className="settings-panel">
      <div className="card settings-card">
        <h3 className="settings-section-title">Profile</h3>
        <div className="settings-profile-row">
          {user?.profilePhotoUrl ? (
            <img className="modal-avatar" src={resolveAssetUrl(user.profilePhotoUrl)} alt="" />
          ) : (
            <div className="modal-avatar">{(user?.firstName?.[0] || user?.username?.[0] || '?').toUpperCase()}</div>
          )}
          <div>
            <div style={{ fontWeight: 600 }}>{user?.firstName || user?.lastName ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : user?.username}</div>
            <div className="settings-muted">@{user?.username}</div>
            <div className="settings-muted">{user?.email}</div>
          </div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={onEdit}>
          Edit photo, name & email
        </button>
      </div>
    </div>
  )
}

function PrivacyTab({ settings, saveSettings }) {
  return (
    <div className="settings-panel">
      <div className="card settings-card">
        <h3 className="settings-section-title">Profile visibility</h3>
        <Toggle
          checked={settings.isProfilePublic}
          onChange={(v) => saveSettings({ isProfilePublic: v })}
          label="Public profile"
          description="When off, your portfolios are hidden from the Explore/discovery feed. Direct links still work."
        />
        <Toggle
          checked={settings.searchEngineVisible}
          onChange={(v) => saveSettings({ searchEngineVisible: v })}
          label="Search engine visibility"
          description="When off, your public portfolio pages ask search engines not to index them."
        />
      </div>
    </div>
  )
}

function NotificationsTab({ settings, saveSettings }) {
  return (
    <div className="settings-panel">
      <div className="card settings-card">
        <h3 className="settings-section-title">Email notifications</h3>
        <Toggle
          checked={settings.emailNotifications}
          onChange={(v) => saveSettings({ emailNotifications: v })}
          label="Email notifications"
          description="Master switch - turning this off silences all notification emails below."
        />
        <Toggle
          checked={settings.securityAlertEmails}
          onChange={(v) => saveSettings({ securityAlertEmails: v })}
          label="Security alerts"
          description="Get emailed when your password is changed."
        />
        <Toggle
          checked={settings.contactMessageNotifications}
          onChange={(v) => saveSettings({ contactMessageNotifications: v })}
          label="Portfolio message notifications"
          description="Get emailed when a visitor contacts you through your portfolio."
        />
        <Toggle
          checked={settings.subscriptionReminderEmails}
          onChange={(v) => saveSettings({ subscriptionReminderEmails: v })}
          label="Subscription reminders"
          description="Not yet active - renewal reminder emails are coming in a later update."
        />
      </div>
    </div>
  )
}

const ACCENT_SWATCHES = {
  indigo: '#4F6FE0',
  teal: '#0D9488',
  rose: '#C2417A',
  amber: '#B8720B',
}

const THEME_SWATCHES = {
  light: { label: 'Light', color: '#F5F6FA' },
  dark: { label: 'Dark', color: '#0A0D14' },
  ocean: { label: 'Ocean', color: '#123340' },
  sunset: { label: 'Sunset', color: '#3E1C24' },
  'midnight-purple': { label: 'Midnight Purple', color: '#221537' },
}

function AppearanceTab({ settings, saveSettings }) {
  const { theme, setTheme, THEMES } = useTheme()
  const { accentColor, fontSize, setAccentColor, setFontSize, ACCENT_OPTIONS, FONT_SIZE_OPTIONS } = useAppearance()

  const applyTheme = (name) => {
    setTheme(name)
    saveSettings({ themeName: name })
  }

  const applyAccent = (color) => {
    setAccentColor(color)
    saveSettings({ accentColor: color })
  }

  const applyFontSize = (size) => {
    setFontSize(size)
    saveSettings({ fontSize: size })
  }

  return (
    <div className="settings-panel">
      <div className="card settings-card">
        <h3 className="settings-section-title">Theme</h3>
        <p className="settings-muted" style={{ marginBottom: '10px' }}>Currently: {THEME_SWATCHES[theme]?.label || theme}</p>
        <div className="settings-swatch-row">
          {THEMES.map(name => (
            <button
              key={name}
              className={`settings-swatch ${theme === name ? 'active' : ''}`}
              style={{ background: THEME_SWATCHES[name]?.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => applyTheme(name)}
              title={THEME_SWATCHES[name]?.label || name}
              aria-label={`Use ${THEME_SWATCHES[name]?.label || name} theme`}
            >
              {theme === name && <Check size={14} color={name === 'light' ? '#14161C' : '#fff'} />}
            </button>
          ))}
        </div>
      </div>

      <div className="card settings-card">
        <h3 className="settings-section-title">Accent color</h3>
        <div className="settings-swatch-row">
          {ACCENT_OPTIONS.map(color => (
            <button
              key={color}
              className={`settings-swatch ${accentColor === color ? 'active' : ''}`}
              style={{ background: ACCENT_SWATCHES[color] }}
              onClick={() => applyAccent(color)}
              title={color}
              aria-label={`Use ${color} accent`}
            />
          ))}
        </div>
      </div>

      <div className="card settings-card">
        <h3 className="settings-section-title">Font size</h3>
        <p className="settings-muted" style={{ marginBottom: '10px' }}>Adjusts text size in forms, buttons, and alerts across the app.</p>
        <div className="settings-actions-row">
          {FONT_SIZE_OPTIONS.map(size => (
            <button
              key={size}
              className={`btn ${fontSize === size ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => applyFontSize(size)}
              style={{ textTransform: 'capitalize' }}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function SubscriptionTab() {
  const [sub, setSub] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([billingAPI.getMySubscription(), billingAPI.getPayments()])
      .then(([subRes, payRes]) => {
        setSub(subRes.data)
        setPayments(payRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async () => {
    if (!confirm('Cancel your Pro subscription? You will be moved to the Free plan.')) return
    await billingAPI.downgrade()
    const res = await billingAPI.getMySubscription()
    setSub(res.data)
  }

  if (loading) return <div className="loading"><div className="spinner"></div></div>

  return (
    <div className="settings-panel">
      <div className="card settings-card">
        <h3 className="settings-section-title">Current plan</h3>
        <div className="settings-plan-row">
          <span className={`security-badge`} style={{ textTransform: 'capitalize' }}>{sub?.tier}</span>
          {sub?.status && <span className="settings-muted">Status: {sub.status}</span>}
        </div>
        {sub?.endDate && <p className="settings-muted">Renews / expires: {new Date(sub.endDate).toLocaleDateString()}</p>}
        <div className="settings-actions-row" style={{ marginTop: '14px' }}>
          {sub?.tier !== 'pro' ? (
            <Link to="/upgrade" className="btn btn-primary">Upgrade to Pro</Link>
          ) : (
            <button className="btn btn-secondary" onClick={handleCancel}>Cancel subscription</button>
          )}
        </div>
      </div>

      <div className="card settings-card">
        <h3 className="settings-section-title">Payment history</h3>
        {payments.length === 0 ? (
          <p className="settings-muted">No payments yet.</p>
        ) : (
          <div className="security-table-scroll" style={{ maxHeight: 320 }}>
            <table className="security-table">
              <thead>
                <tr><th>Date</th><th>Amount</th><th>Method</th><th>Status</th></tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>{p.currency} {p.amount}</td>
                    <td>{p.paymentMethod || '—'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function PortfolioPrefsTab({ settings, saveSettings }) {
  const [templates, setTemplates] = useState([])

  useEffect(() => {
    portfolioAPI.getTemplates().then(res => setTemplates(res.data)).catch(() => {})
  }, [])

  return (
    <div className="settings-panel">
      <div className="card settings-card">
        <h3 className="settings-section-title">Default template</h3>
        <p className="settings-muted" style={{ marginBottom: '10px' }}>Pre-selected when you create a new portfolio.</p>
        <select
          className="settings-select"
          value={settings.defaultTemplateId || ''}
          onChange={(e) => saveSettings({ defaultTemplateId: e.target.value || null })}
        >
          <option value="">No default</option>
          {templates.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="card settings-card">
        <h3 className="settings-section-title">Editor</h3>
        <Toggle
          checked={settings.autoSaveEnabled}
          onChange={(v) => saveSettings({ autoSaveEnabled: v })}
          label="Auto-save"
          description="Automatically save changes while editing a portfolio, a couple seconds after you stop typing."
        />
      </div>
    </div>
  )
}

function DataManagementTab() {
  const [confirmText, setConfirmText] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleExport = async () => {
    const res = await authAPI.exportData()
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'portfoliox-account-data.json')
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const handleDelete = async () => {
    setError('')
    setBusy(true)
    try {
      await authAPI.deleteAccount(password)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/'
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete account.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="settings-panel">
      <div className="card settings-card">
        <h3 className="settings-section-title">Your data</h3>
        <div className="settings-actions-row">
          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={16} /> Download account data
          </button>
          <Link to="/dashboard" className="btn btn-secondary">Export or delete a portfolio</Link>
        </div>
      </div>

      <div className="card settings-card settings-danger-card">
        <h3 className="settings-section-title">Delete account</h3>
        <p className="settings-muted">This permanently deletes your account, portfolios, and resumes. This cannot be undone.</p>
        {error && <div className="error">{error}</div>}
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Type DELETE to confirm</label>
          <input type="text" value={confirmText} onChange={e => setConfirmText(e.target.value)} />
        </div>
        <button
          className="btn btn-secondary settings-danger-btn"
          disabled={confirmText !== 'DELETE' || !password || busy}
          onClick={handleDelete}
        >
          <Trash2 size={16} /> {busy ? 'Deleting...' : 'Permanently delete my account'}
        </button>
      </div>
    </div>
  )
}

const FAQ_ITEMS = [
  { q: 'How do I publish my portfolio?', a: 'Open your portfolio in the editor and toggle "Published" - it will then appear at its public URL and, if your profile is public, in Explore.' },
  { q: 'Can I change my email address?', a: 'Yes - go to Settings > Account, click "Edit photo, name & email", and use the email change flow. You will need to verify the new address with a code.' },
  { q: 'How do I cancel my Pro subscription?', a: 'Go to Settings > Subscription and click "Cancel subscription". You will be moved to the Free plan.' },
  { q: 'How do I delete my account?', a: 'Go to Settings > Data Management and use the "Delete account" section. This is permanent.' },
]

function SupportTab() {
  const [complaintSubject, setComplaintSubject] = useState('')
  const [complaintMessage, setComplaintMessage] = useState('')
  const [complaintSent, setComplaintSent] = useState(false)
  const [bugDescription, setBugDescription] = useState('')
  const [bugSent, setBugSent] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  const submitComplaint = async (e) => {
    e.preventDefault()
    await supportAPI.submitComplaint(complaintSubject, complaintMessage)
    setComplaintSent(true)
    setComplaintSubject('')
    setComplaintMessage('')
  }

  const submitBug = async (e) => {
    e.preventDefault()
    await supportAPI.submitBugReport(bugDescription, window.location.href)
    setBugSent(true)
    setBugDescription('')
  }

  return (
    <div className="settings-panel">
      <div className="card settings-card">
        <h3 className="settings-section-title">Submit a complaint</h3>
        {complaintSent ? (
          <div className="success">Your complaint has been submitted. Our team will review it.</div>
        ) : (
          <form onSubmit={submitComplaint}>
            <div className="form-group">
              <label>Subject</label>
              <input type="text" required value={complaintSubject} onChange={e => setComplaintSubject(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea required rows={4} value={complaintMessage} onChange={e => setComplaintMessage(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary">Submit complaint</button>
          </form>
        )}
      </div>

      <div className="card settings-card">
        <h3 className="settings-section-title">Report a bug</h3>
        {bugSent ? (
          <div className="success">Thanks - your bug report has been submitted.</div>
        ) : (
          <form onSubmit={submitBug}>
            <div className="form-group">
              <label>What went wrong?</label>
              <textarea required rows={4} value={bugDescription} onChange={e => setBugDescription(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary">Report bug</button>
          </form>
        )}
      </div>

      <div className="card settings-card">
        <h3 className="settings-section-title">FAQ</h3>
        <div className="settings-faq-list">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="settings-faq-item">
              <button className="settings-faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {item.q}
                <ChevronDown size={16} className={openFaq === i ? 'settings-faq-chevron open' : 'settings-faq-chevron'} />
              </button>
              {openFaq === i && <div className="settings-faq-answer">{item.a}</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="card settings-card">
        <h3 className="settings-section-title">Legal</h3>
        <div className="settings-actions-row">
          <Link to="/terms" className="btn btn-secondary">Terms & Conditions</Link>
          <Link to="/privacy" className="btn btn-secondary">Privacy Policy</Link>
        </div>
      </div>
    </div>
  )
}
