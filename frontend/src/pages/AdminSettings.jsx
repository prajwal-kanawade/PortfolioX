import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminSettingsAPI, adminAPI, portfolioAPI } from '../services/api'
import { useSiteSettings } from '../context/SiteSettingsContext'
import Logo from '../components/logos/Logo'
import { LOGO_KEYS } from '../components/logos/logoVariants'
import {
  User, Globe2, CreditCard, Receipt, Mail, Plus, Trash2, Save, RotateCcw,
  Lock, Users, LayoutTemplate, Bell, BarChart3, Server, Download,
  LayoutDashboard, MessageSquare
} from 'lucide-react'
import './Settings.css'
import './AdminSettings.css'

const TABS = [
  { key: 'profile', label: 'Admin Profile', icon: User },
  { key: 'general', label: 'General', icon: Globe2 },
  { key: 'security', label: 'Security', icon: Lock },
  { key: 'user-management', label: 'User Management', icon: Users },
  { key: 'plans', label: 'Subscription Plans', icon: CreditCard },
  { key: 'payments', label: 'Payments', icon: Receipt },
  { key: 'portfolio', label: 'Portfolio', icon: LayoutTemplate },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'templates', label: 'Email Templates', icon: Mail },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'system', label: 'System', icon: Server },
]

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <nav className="dashboard-sidebar-nav">
          <Link to="/admin" className="dashboard-sidebar-link">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/admin/complaints" className="dashboard-sidebar-link">
            <MessageSquare size={18} /> Complaints
          </Link>
          <div style={{ height: '1px', background: 'var(--border)', margin: '6px 4px' }} />
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
        <h1 className="settings-page-title">Admin Settings</h1>

        {activeTab === 'profile' && <AdminProfileTab />}
        {activeTab === 'general' && <GeneralTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'user-management' && <UserManagementTab />}
        {activeTab === 'plans' && <PlansTab />}
        {activeTab === 'payments' && <PaymentsTab />}
        {activeTab === 'portfolio' && <PortfolioSettingsTab />}
        {activeTab === 'notifications' && <AdminNotificationsTab />}
        {activeTab === 'templates' && <TemplatesTab />}
        {activeTab === 'analytics' && <AnalyticsSettingsTab />}
        {activeTab === 'system' && <SystemTab />}
      </main>
    </div>
  )
}

/// Shared fetch/save cycle for the many tabs that all edit the same site_settings row.
function useAdminSettingsForm() {
  const { refresh } = useSiteSettings()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    adminSettingsAPI.getGeneral().then(res => setForm(res.data)).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const res = await adminSettingsAPI.updateGeneral(form)
      setForm(res.data)
      setMessage('Saved.')
      // Several tabs sharing this hook (Portfolio's social toggles, etc.) affect the public
      // SiteSettingsContext other pages read live - refresh it so those pages don't need a
      // full reload to pick up the change.
      refresh()
    } finally {
      setSaving(false)
    }
  }

  return { form, setForm, loading, saving, message, handleSave }
}

function SaveBar({ saving, message, onSave }) {
  return (
    <div className="settings-actions-row" style={{ alignItems: 'center' }}>
      <button type="button" className="btn btn-primary" onClick={onSave} disabled={saving}>
        <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
      </button>
      {message && <small style={{ color: 'var(--accent)' }}>{message}</small>}
    </div>
  )
}

function AdminProfileTab() {
  return (
    <div className="settings-panel">
      <div className="card settings-card">
        <h3 className="settings-section-title">Admin Profile</h3>
        <p className="settings-muted" style={{ marginBottom: '16px' }}>
          Your name, email, photo, and password are managed the same way as any account -
          use the regular Settings page.
        </p>
        <Link to="/settings" className="btn btn-primary">Go to Account &amp; Security Settings</Link>
      </div>
    </div>
  )
}

function GeneralTab() {
  const { refresh } = useSiteSettings()
  const [form, setForm] = useState(null)
  const [smtpPassword, setSmtpPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    adminSettingsAPI.getGeneral().then(res => setForm(res.data)).finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const res = await adminSettingsAPI.updateGeneral({ ...form, smtpPassword: smtpPassword || undefined })
      setForm(res.data)
      setSmtpPassword('')
      refresh()
      setMessage('Saved.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !form) return <div className="loading"><div className="spinner"></div></div>

  return (
    <form className="settings-panel" onSubmit={handleSave}>
      <div className="card settings-card">
        <h3 className="settings-section-title">Site identity</h3>
        <div className="form-group">
          <label>Website name</label>
          <input type="text" required value={form.websiteName} onChange={e => setForm({ ...form, websiteName: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Footer text</label>
          <input type="text" value={form.footerText || ''} onChange={e => setForm({ ...form, footerText: e.target.value })} placeholder="Optional line shown next to the copyright in the footer" />
        </div>
      </div>

      <div className="card settings-card">
        <h3 className="settings-section-title">Logo</h3>
        <div className="admin-logo-grid">
          {LOGO_KEYS.map(key => (
            <button
              type="button"
              key={key}
              className={`admin-logo-option ${form.activeLogoKey === key ? 'active' : ''}`}
              onClick={() => setForm({ ...form, activeLogoKey: key })}
            >
              <Logo variant={key} siteName={form.websiteName} />
            </button>
          ))}
        </div>
      </div>

      <div className="card settings-card">
        <h3 className="settings-section-title">Maintenance mode</h3>
        <label className="settings-toggle-row">
          <div>
            <div className="settings-toggle-label">Enable maintenance mode</div>
            <div className="settings-toggle-desc">Shows a maintenance screen to everyone except signed-in admins. The login page always stays reachable.</div>
          </div>
          <span
            className={`settings-switch ${form.maintenanceMode ? 'on' : ''}`}
            onClick={() => setForm({ ...form, maintenanceMode: !form.maintenanceMode })}
          >
            <span className="settings-switch-knob" />
          </span>
        </label>
      </div>

      <div className="card settings-card">
        <h3 className="settings-section-title">SMTP configuration</h3>
        <p className="settings-muted" style={{ marginBottom: '12px' }}>
          Overrides the server's default SMTP settings. Leave any field blank to keep using the server default for that field.
        </p>
        <div className="form-group">
          <label>Host</label>
          <input type="text" value={form.smtpHost || ''} onChange={e => setForm({ ...form, smtpHost: e.target.value })} placeholder="smtp.gmail.com" />
        </div>
        <div className="form-group">
          <label>Port</label>
          <input type="text" value={form.smtpPort || ''} onChange={e => setForm({ ...form, smtpPort: e.target.value })} placeholder="587" />
        </div>
        <div className="form-group">
          <label>Username</label>
          <input type="text" value={form.smtpUsername || ''} onChange={e => setForm({ ...form, smtpUsername: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Password {form.smtpPasswordSet && <span className="settings-muted">(a password is currently set - leave blank to keep it)</span>}</label>
          <input type="password" value={smtpPassword} onChange={e => setSmtpPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <div className="form-group">
          <label>From email</label>
          <input type="email" value={form.smtpFromEmail || ''} onChange={e => setForm({ ...form, smtpFromEmail: e.target.value })} />
        </div>
        <div className="form-group">
          <label>From name</label>
          <input type="text" value={form.smtpFromName || ''} onChange={e => setForm({ ...form, smtpFromName: e.target.value })} />
        </div>
      </div>

      <div className="settings-actions-row" style={{ alignItems: 'center' }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          <Save size={16} /> {saving ? 'Saving...' : 'Save General Settings'}
        </button>
        {message && <small style={{ color: 'var(--accent)' }}>{message}</small>}
      </div>
    </form>
  )
}

function SecurityTab() {
  const { form, setForm, loading, saving, message, handleSave } = useAdminSettingsForm()
  if (loading || !form) return <div className="loading"><div className="spinner"></div></div>

  return (
    <div className="settings-panel">
      <div className="card settings-card">
        <h3 className="settings-section-title">JWT &amp; sessions</h3>
        <p className="settings-muted" style={{ marginBottom: '12px' }}>Takes effect on the next token issued - no server restart needed.</p>
        <div className="form-group">
          <label>Access token expiry (minutes)</label>
          <input type="number" min="1" value={form.jwtExpiryMinutes} onChange={e => setForm({ ...form, jwtExpiryMinutes: Number(e.target.value) })} />
        </div>
        <div className="form-group">
          <label>Refresh token expiry (days)</label>
          <input type="number" min="1" value={form.refreshTokenExpiryDays} onChange={e => setForm({ ...form, refreshTokenExpiryDays: Number(e.target.value) })} />
        </div>
        <div className="form-group">
          <label>Session idle timeout (minutes)</label>
          <input type="number" min="1" value={form.sessionTimeoutMinutes} onChange={e => setForm({ ...form, sessionTimeoutMinutes: Number(e.target.value) })} />
        </div>
      </div>

      <div className="card settings-card">
        <h3 className="settings-section-title">Password policy</h3>
        <div className="form-group">
          <label>Minimum length</label>
          <input type="number" min="1" value={form.passwordMinLength} onChange={e => setForm({ ...form, passwordMinLength: Number(e.target.value) })} />
        </div>
        <Toggle checked={form.passwordRequireUppercase} onChange={v => setForm({ ...form, passwordRequireUppercase: v })} label="Require an uppercase letter" />
        <Toggle checked={form.passwordRequireNumber} onChange={v => setForm({ ...form, passwordRequireNumber: v })} label="Require a number" />
        <Toggle checked={form.passwordRequireSpecial} onChange={v => setForm({ ...form, passwordRequireSpecial: v })} label="Require a special character" />
      </div>

      <div className="card settings-card">
        <h3 className="settings-section-title">Login lockout</h3>
        <p className="settings-muted" style={{ marginBottom: '12px' }}>Applies to every account, including admin.</p>
        <div className="form-group">
          <label>Max failed attempts</label>
          <input type="number" min="1" value={form.maxLoginAttempts} onChange={e => setForm({ ...form, maxLoginAttempts: Number(e.target.value) })} />
        </div>
        <div className="form-group">
          <label>Lockout duration (minutes)</label>
          <input type="number" min="1" value={form.loginLockoutMinutes} onChange={e => setForm({ ...form, loginLockoutMinutes: Number(e.target.value) })} />
        </div>
      </div>

      <SaveBar saving={saving} message={message} onSave={handleSave} />
    </div>
  )
}

function UserManagementTab() {
  const { form, setForm, loading, saving, message, handleSave } = useAdminSettingsForm()
  const [days, setDays] = useState(90)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteResult, setDeleteResult] = useState('')

  const handleDeleteInactive = async () => {
    if (!confirm(`Delete all non-admin users who registered more than ${days} days ago and have never logged in?`)) return
    setDeleteBusy(true)
    setDeleteResult('')
    try {
      const res = await adminAPI.deleteInactiveUsers(days)
      setDeleteResult(res.data.message)
    } finally {
      setDeleteBusy(false)
    }
  }

  if (loading || !form) return <div className="loading"><div className="spinner"></div></div>

  return (
    <div className="settings-panel">
      <div className="card settings-card">
        <h3 className="settings-section-title">Registration</h3>
        <Toggle checked={form.allowNewRegistrations} onChange={v => setForm({ ...form, allowNewRegistrations: v })} label="Allow new registrations" />
        <Toggle checked={form.requireEmailVerification} onChange={v => setForm({ ...form, requireEmailVerification: v })} label="Require email verification" />
        <Toggle checked={form.requiresApproval} onChange={v => setForm({ ...form, requiresApproval: v })} label="Require admin approval for new accounts" />
      </div>

      <div className="card settings-card settings-danger-card">
        <h3 className="settings-section-title">Delete inactive users</h3>
        <p className="settings-muted" style={{ marginBottom: '12px' }}>
          Permanently removes non-admin users who registered more than the threshold and have never had a successful login.
        </p>
        <div className="form-group">
          <label>Inactive threshold (days)</label>
          <input type="number" min="1" value={days} onChange={e => setDays(Number(e.target.value))} />
        </div>
        <button className="btn btn-secondary settings-danger-btn" onClick={handleDeleteInactive} disabled={deleteBusy}>
          <Trash2 size={16} /> {deleteBusy ? 'Deleting...' : 'Delete inactive users'}
        </button>
        {deleteResult && <p className="settings-muted" style={{ marginTop: '10px' }}>{deleteResult}</p>}
      </div>

      <SaveBar saving={saving} message={message} onSave={handleSave} />
    </div>
  )
}

function PortfolioSettingsTab() {
  const { form, setForm, loading, saving, message, handleSave } = useAdminSettingsForm()
  const [templates, setTemplates] = useState([])

  useEffect(() => {
    portfolioAPI.getTemplates().then(res => setTemplates(res.data)).catch(() => {})
  }, [])

  if (loading || !form) return <div className="loading"><div className="spinner"></div></div>

  return (
    <div className="settings-panel">
      <div className="card settings-card">
        <h3 className="settings-section-title">Publishing</h3>
        <Toggle
          checked={form.allowPublicPortfolios}
          onChange={v => setForm({ ...form, allowPublicPortfolios: v })}
          label="Allow publishing portfolios"
          description="When off, users can't newly publish a draft - already-published portfolios stay visible."
        />
        <Toggle
          checked={form.allowPortfolioDownloads}
          onChange={v => setForm({ ...form, allowPortfolioDownloads: v })}
          label="Allow portfolio downloads"
          description='Controls whether the "Export as ZIP" button appears in the portfolio editor.'
        />
      </div>

      <div className="card settings-card">
        <h3 className="settings-section-title">Social features</h3>
        <Toggle
          checked={form.enableLikes}
          onChange={v => setForm({ ...form, enableLikes: v })}
          label="Enable likes"
          description="Turns the like button on Explore portfolio cards on or off site-wide. Existing likes are kept either way."
        />
        <Toggle
          checked={form.enableComments}
          onChange={v => setForm({ ...form, enableComments: v })}
          label="Enable comments"
          description="Turns the comment button and comment threads on or off site-wide. Existing comments are kept either way."
        />
        <Toggle
          checked={form.enableFollowSystem}
          onChange={v => setForm({ ...form, enableFollowSystem: v })}
          label="Enable follow system"
          description="Turns the Follow button on user profiles on or off site-wide. Existing follows are kept either way."
        />
      </div>

      <div className="card settings-card">
        <h3 className="settings-section-title">Uploads</h3>
        <div className="form-group">
          <label>Max upload size (MB)</label>
          <input type="number" min="1" value={form.maxUploadSizeMb} onChange={e => setForm({ ...form, maxUploadSizeMb: Number(e.target.value) })} />
        </div>
        <div className="form-group">
          <label>Allowed image types (comma-separated)</label>
          <input type="text" value={form.allowedImageTypes} onChange={e => setForm({ ...form, allowedImageTypes: e.target.value })} placeholder="jpg,jpeg,png,webp" />
        </div>
      </div>

      <div className="card settings-card">
        <h3 className="settings-section-title">Default template</h3>
        <p className="settings-muted" style={{ marginBottom: '10px' }}>Used when a user hasn't set their own default template preference.</p>
        <select className="settings-select" value={form.defaultTemplateId || ''} onChange={e => setForm({ ...form, defaultTemplateId: e.target.value || null })}>
          <option value="">No default</option>
          {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <SaveBar saving={saving} message={message} onSave={handleSave} />
    </div>
  )
}

function AdminNotificationsTab() {
  const { form, setForm, loading, saving, message, handleSave } = useAdminSettingsForm()
  if (loading || !form) return <div className="loading"><div className="spinner"></div></div>

  return (
    <div className="settings-panel">
      <div className="card settings-card">
        <h3 className="settings-section-title">Admin alerts</h3>
        <div className="form-group">
          <label>Alert email</label>
          <input type="email" value={form.adminAlertEmail || ''} onChange={e => setForm({ ...form, adminAlertEmail: e.target.value })} placeholder="you@example.com" />
        </div>
        <Toggle checked={form.notifyAdminNewRegistration} onChange={v => setForm({ ...form, notifyAdminNewRegistration: v })} label="Email me when a new user registers" />
        <Toggle checked={form.notifyAdminPaymentSuccess} onChange={v => setForm({ ...form, notifyAdminPaymentSuccess: v })} label="Email me on successful payments" />
        <p className="settings-muted" style={{ marginTop: '10px' }}>
          Payment-failure alerts aren't available yet - checkout is a dummy flow that always succeeds.
        </p>
      </div>

      <SaveBar saving={saving} message={message} onSave={handleSave} />
    </div>
  )
}

function AnalyticsSettingsTab() {
  const { form, setForm, loading, saving, message, handleSave } = useAdminSettingsForm()
  if (loading || !form) return <div className="loading"><div className="spinner"></div></div>

  return (
    <div className="settings-panel">
      <div className="card settings-card">
        <h3 className="settings-section-title">Dashboard widgets</h3>
        <Toggle checked={form.showSignupsWidget} onChange={v => setForm({ ...form, showSignupsWidget: v })} label="Show signups chart" />
        <Toggle checked={form.showTemplatesWidget} onChange={v => setForm({ ...form, showTemplatesWidget: v })} label="Show template popularity chart" />
        <Toggle checked={form.showSubscriptionWidget} onChange={v => setForm({ ...form, showSubscriptionWidget: v })} label="Show subscription split chart" />
      </div>

      <SaveBar saving={saving} message={message} onSave={handleSave} />
    </div>
  )
}

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let val = bytes
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024
    i++
  }
  return `${val.toFixed(1)} ${units[i]}`
}

function SystemTab() {
  const [storage, setStorage] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    Promise.all([adminSettingsAPI.getStorageUsage(), adminSettingsAPI.getErrorLogs()])
      .then(([storageRes, logsRes]) => {
        setStorage(storageRes.data)
        setLogs(logsRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleBackup = async () => {
    setDownloading(true)
    try {
      const res = await adminSettingsAPI.downloadBackup()
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `portfoliox-backup-${new Date().toISOString().slice(0, 10)}.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } finally {
      setDownloading(false)
    }
  }

  if (loading) return <div className="loading"><div className="spinner"></div></div>

  return (
    <div className="settings-panel" style={{ maxWidth: '900px' }}>
      <div className="card settings-card">
        <h3 className="settings-section-title">Storage usage</h3>
        <p style={{ fontSize: '26px', fontWeight: 700, marginBottom: '12px' }}>{formatBytes(storage?.totalBytes)}</p>
        {storage?.breakdown?.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {storage.breakdown.map(b => (
              <div key={b.folder} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span className="settings-muted">{b.folder}</span>
                <span>{formatBytes(b.bytes)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card settings-card">
        <h3 className="settings-section-title">Backup</h3>
        <p className="settings-muted" style={{ marginBottom: '12px' }}>
          Downloads a JSON snapshot of users, portfolios, subscriptions, payments, and settings. There's no restore-via-UI -
          re-importing arbitrary data as a live mutation is a data-loss/injection risk not worth taking on for this app.
        </p>
        <button className="btn btn-primary" onClick={handleBackup} disabled={downloading}>
          <Download size={16} /> {downloading ? 'Preparing...' : 'Download Backup'}
        </button>
      </div>

      <div className="card settings-card">
        <h3 className="settings-section-title">Error logs</h3>
        {logs.length === 0 ? (
          <p className="settings-muted">No errors logged yet.</p>
        ) : (
          <div className="security-table-scroll" style={{ maxHeight: 400 }}>
            <table className="security-table">
              <thead>
                <tr><th>Date</th><th>Method</th><th>Path</th><th>Message</th></tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td>{new Date(l.createdAt).toLocaleString()}</td>
                    <td>{l.httpMethod}</td>
                    <td>{l.path}</td>
                    <td>{l.message}</td>
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

const emptyPlanForm = { name: '', tier: '', priceMonthly: 0, priceAnnually: '', maxPortfolios: '', maxProjects: '', customDomain: false, aiCredits: 0, features: '', isActive: true }

function PlansTab() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(emptyPlanForm)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState(emptyPlanForm)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    adminSettingsAPI.getPlans().then(res => setPlans(res.data)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const startEdit = (plan) => {
    setEditingId(plan.id)
    setEditForm({
      name: plan.name,
      priceMonthly: plan.priceMonthly,
      priceAnnually: plan.priceAnnually ?? '',
      maxPortfolios: plan.maxPortfolios ?? '',
      maxProjects: plan.maxProjects ?? '',
      customDomain: plan.customDomain,
      aiCredits: plan.aiCredits,
      features: plan.features || '',
      isActive: plan.isActive,
    })
  }

  const saveEdit = async (id) => {
    setError('')
    try {
      await adminSettingsAPI.updatePlan(id, {
        ...editForm,
        priceAnnually: editForm.priceAnnually === '' ? null : Number(editForm.priceAnnually),
        maxPortfolios: editForm.maxPortfolios === '' ? null : Number(editForm.maxPortfolios),
        maxProjects: editForm.maxProjects === '' ? null : Number(editForm.maxProjects),
        priceMonthly: Number(editForm.priceMonthly),
        aiCredits: Number(editForm.aiCredits),
      })
      setEditingId(null)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update plan.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this plan?')) return
    setError('')
    try {
      await adminSettingsAPI.deletePlan(id)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete plan.')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await adminSettingsAPI.createPlan({
        ...createForm,
        priceAnnually: createForm.priceAnnually === '' ? null : Number(createForm.priceAnnually),
        maxPortfolios: createForm.maxPortfolios === '' ? null : Number(createForm.maxPortfolios),
        maxProjects: createForm.maxProjects === '' ? null : Number(createForm.maxProjects),
        priceMonthly: Number(createForm.priceMonthly),
        aiCredits: Number(createForm.aiCredits),
      })
      setCreating(false)
      setCreateForm(emptyPlanForm)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create plan.')
    }
  }

  if (loading) return <div className="loading"><div className="spinner"></div></div>

  return (
    <div className="settings-panel" style={{ maxWidth: '760px' }}>
      {error && <div className="error">{error}</div>}
      <p className="settings-muted">
        Checkout on the Upgrade page always offers the single active "pro" tier plan - newly created plans are
        manageable here but not yet purchasable until a future checkout rework.
      </p>

      {plans.map(plan => (
        <div key={plan.id} className="card settings-card">
          {editingId === plan.id ? (
            <>
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Monthly price</label>
                  <input type="number" value={editForm.priceMonthly} onChange={e => setEditForm({ ...editForm, priceMonthly: e.target.value })} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Annual price</label>
                  <input type="number" value={editForm.priceAnnually} onChange={e => setEditForm({ ...editForm, priceAnnually: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Max portfolios</label>
                  <input type="number" value={editForm.maxPortfolios} onChange={e => setEditForm({ ...editForm, maxPortfolios: e.target.value })} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Max projects</label>
                  <input type="number" value={editForm.maxProjects} onChange={e => setEditForm({ ...editForm, maxProjects: e.target.value })} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>AI credits</label>
                  <input type="number" value={editForm.aiCredits} onChange={e => setEditForm({ ...editForm, aiCredits: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Features (JSON)</label>
                <textarea rows={3} value={editForm.features} onChange={e => setEditForm({ ...editForm, features: e.target.value })} />
              </div>
              <Toggle checked={editForm.customDomain} onChange={v => setEditForm({ ...editForm, customDomain: v })} label="Custom domain" />
              <Toggle checked={editForm.isActive} onChange={v => setEditForm({ ...editForm, isActive: v })} label="Active" />
              <div className="settings-actions-row" style={{ marginTop: '12px' }}>
                <button className="btn btn-primary" onClick={() => saveEdit(plan.id)}>Save</button>
                <button className="btn btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {plan.name}
                    {!plan.isActive && <span className="security-badge">Inactive</span>}
                  </h3>
                  <p className="settings-muted">
                    Tier: {plan.tier} &middot; {plan.currency || 'INR'} {plan.priceMonthly}/mo{plan.priceAnnually ? ` or ${plan.priceAnnually}/yr` : ''}
                  </p>
                  <p className="settings-muted">
                    {plan.maxPortfolios ?? '∞'} portfolios &middot; {plan.maxProjects ?? '∞'} projects &middot; {plan.aiCredits} AI credits
                    {plan.customDomain ? ' · custom domain' : ''}
                  </p>
                  <p className="settings-muted">{plan.activeSubscriberCount} active subscriber(s)</p>
                </div>
                <div className="settings-actions-row">
                  <button className="btn btn-secondary" onClick={() => startEdit(plan)}>Edit</button>
                  <button className="btn btn-secondary settings-danger-btn" onClick={() => handleDelete(plan.id)} title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ))}

      {creating ? (
        <form className="card settings-card" onSubmit={handleCreate}>
          <h3 className="settings-section-title">New plan</h3>
          <div className="form-group">
            <label>Name</label>
            <input type="text" required value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Tier (unique key, e.g. "business")</label>
            <input type="text" required value={createForm.tier} onChange={e => setCreateForm({ ...createForm, tier: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Monthly price</label>
              <input type="number" required value={createForm.priceMonthly} onChange={e => setCreateForm({ ...createForm, priceMonthly: e.target.value })} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Annual price</label>
              <input type="number" value={createForm.priceAnnually} onChange={e => setCreateForm({ ...createForm, priceAnnually: e.target.value })} />
            </div>
          </div>
          <div className="settings-actions-row">
            <button type="submit" className="btn btn-primary"><Plus size={16} /> Create plan</button>
            <button type="button" className="btn btn-secondary" onClick={() => setCreating(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <button className="btn btn-secondary" onClick={() => setCreating(true)}><Plus size={16} /> New plan</button>
      )}
    </div>
  )
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="settings-toggle-row" style={{ padding: '8px 0' }}>
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

function PaymentsTab() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    adminSettingsAPI.getPayments().then(res => setPayments(res.data)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleRefund = async (id) => {
    const reason = prompt('Reason for refund:')
    if (!reason) return
    await adminSettingsAPI.refundPayment(id, reason)
    load()
  }

  if (loading) return <div className="loading"><div className="spinner"></div></div>

  return (
    <div className="card settings-card" style={{ maxWidth: '900px' }}>
      <h3 className="settings-section-title">All payments</h3>
      {payments.length === 0 ? (
        <p className="settings-muted">No payments yet.</p>
      ) : (
        <div className="security-table-scroll" style={{ maxHeight: 480 }}>
          <table className="security-table">
            <thead>
              <tr><th>User</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}>
                  <td>{p.userName} <span className="settings-muted">({p.userEmail})</span></td>
                  <td>{p.currency} {p.amount}</td>
                  <td>{p.paymentMethod || '—'}</td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {p.status}
                    {p.refundReason && <div className="settings-muted">Reason: {p.refundReason}</div>}
                  </td>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>
                    {p.status !== 'refunded' && (
                      <button className="btn btn-secondary" onClick={() => handleRefund(p.id)} title="Refund">
                        <RotateCcw size={14} /> Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function TemplatesTab() {
  const [templates, setTemplates] = useState([])
  const [selectedKey, setSelectedKey] = useState(null)
  const [subject, setSubject] = useState('')
  const [htmlBody, setHtmlBody] = useState('')
  const [previewHtml, setPreviewHtml] = useState(null)
  const [previewSubject, setPreviewSubject] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    adminSettingsAPI.getEmailTemplates().then(res => setTemplates(res.data))
  }, [])

  const selectTemplate = (key) => {
    const t = templates.find(x => x.templateKey === key)
    setSelectedKey(key)
    setSubject(t.subject)
    setHtmlBody(t.htmlBody)
    setPreviewHtml(null)
    setMessage('')
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      await adminSettingsAPI.updateEmailTemplate(selectedKey, subject, htmlBody)
      setTemplates(templates.map(t => t.templateKey === selectedKey ? { ...t, subject, htmlBody } : t))
      setMessage('Saved.')
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = async () => {
    const res = await adminSettingsAPI.previewEmailTemplate(selectedKey, subject, htmlBody)
    setPreviewSubject(res.data.subject)
    setPreviewHtml(res.data.html)
  }

  return (
    <div className="admin-templates-layout">
      <div className="card settings-card admin-templates-list">
        <h3 className="settings-section-title">Templates</h3>
        {templates.map(t => (
          <button
            key={t.templateKey}
            className={`admin-template-item ${selectedKey === t.templateKey ? 'active' : ''}`}
            onClick={() => selectTemplate(t.templateKey)}
          >
            {t.templateKey.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="card settings-card" style={{ flex: 1 }}>
        {!selectedKey ? (
          <p className="settings-muted">Select a template to edit.</p>
        ) : (
          <>
            <div className="form-group">
              <label>Subject</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div className="form-group">
              <label>HTML body</label>
              <textarea rows={12} value={htmlBody} onChange={e => setHtmlBody(e.target.value)} style={{ fontFamily: 'monospace', fontSize: '12px' }} />
            </div>
            <div className="settings-actions-row" style={{ alignItems: 'center' }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handlePreview}>Preview</button>
              {message && <small style={{ color: 'var(--accent)' }}>{message}</small>}
            </div>

            {previewHtml !== null && (
              <div className="admin-template-preview">
                <div className="settings-muted" style={{ marginBottom: '8px' }}>Subject: {previewSubject}</div>
                <iframe title="Email preview" srcDoc={previewHtml} className="admin-template-preview-frame" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
