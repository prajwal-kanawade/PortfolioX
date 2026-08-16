import { useEffect, useState } from 'react'
import { adminAPI, adminSettingsAPI } from '../services/api'
import { Trash2, Settings as SettingsIcon, Ban, UserCheck, Download, MessageSquare, LayoutDashboard } from 'lucide-react'
import LineChart from '../components/charts/LineChart'
import BarChart from '../components/charts/BarChart'
import DonutChart from '../components/charts/DonutChart'
import AdminUserProfileModal from '../components/AdminUserProfileModal'
import Sidebar from '../components/Sidebar'
import StatPopover from '../components/StatPopover'
import { useCountUp } from '../hooks/useCountUp'
import './AdminDashboard.css'

const ADMIN_SIDEBAR_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
  { key: 'complaints', label: 'Complaints', icon: MessageSquare, to: '/admin/complaints' },
  { key: 'settings', label: 'Settings', icon: SettingsIcon, to: '/admin/settings' },
]

// Validated against the dark card surface with the dataviz skill's validator
// (six-check categorical palette) - see components/charts/charts.css for roles.
const SUBSCRIPTION_COLORS = { pro: '#5474E0', free: '#C2692E' }

function downloadCsv(analytics) {
  const escape = (cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`
  const rows = [
    ['Signups by day'], ['Date', 'Count'],
    ...analytics.signupsByDay.map(d => [d.date, d.count]),
    [],
    ['Template popularity'], ['Template', 'Count'],
    ...analytics.templatePopularity.map(t => [t.name, t.count]),
    [],
    ['Subscription breakdown'], ['Tier', 'Count'],
    ['Free', analytics.subscriptionBreakdown.free],
    ['Pro', analytics.subscriptionBreakdown.pro],
  ]
  const csv = rows.map(r => r.map(escape).join(',')).join('\n')
  const url = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `portfoliox-analytics-${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  link.remove()
}

function userDisplayName(u) {
  return u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : u.username
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [widgetSettings, setWidgetSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileUserId, setProfileUserId] = useState(null)
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('adminSidebarCollapsed') === 'true')

  useEffect(() => {
    localStorage.setItem('adminSidebarCollapsed', String(collapsed))
  }, [collapsed])

  useEffect(() => {
    loadData()
  }, [])

  // The admin account itself shouldn't show up in these lists, matching how the stat counts
  // themselves exclude admins (see AdminController.GetStats).
  const nonAdminUsers = users.filter(u => !u.isAdmin)
  const allPortfolios = nonAdminUsers.flatMap(u =>
    u.portfolios.map(p => ({ ...p, ownerName: userDisplayName(u) }))
  )
  const proUsers = nonAdminUsers.filter(u => u.subscriptionTier === 'pro')

  const totalUsersAnimated = useCountUp(stats?.totalUsers || 0)
  const totalPortfoliosAnimated = useCountUp(stats?.totalPortfolios || 0)
  const totalViewsAnimated = useCountUp(stats?.totalViews || 0)
  const activeSubscriptionsAnimated = useCountUp(stats?.activeSubscriptions || 0)

  const loadData = async () => {
    try {
      const [usersRes, statsRes, analyticsRes, generalRes] = await Promise.all([
        adminAPI.getAllUsers(),
        adminAPI.getStats(),
        adminAPI.getAnalytics(),
        adminSettingsAPI.getGeneral().catch(() => null)
      ])
      setUsers(usersRes.data)
      setStats(statsRes.data)
      setAnalytics(analyticsRes.data)
      setWidgetSettings(generalRes?.data || null)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Delete this user?')) return
    try {
      await adminAPI.deleteUser(userId)
      setUsers(users.filter(u => u.id !== userId))
    } catch (err) {
      alert('Failed to delete user')
    }
  }

  const handleBanUser = async (userId) => {
    const reason = prompt('Reason for suspension:')
    if (!reason) return
    try {
      await adminAPI.banUser(userId, reason)
      setUsers(users.map(u => u.id === userId ? { ...u, isBanned: true } : u))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to suspend user')
    }
  }

  const handleUnbanUser = async (userId) => {
    try {
      await adminAPI.unbanUser(userId)
      setUsers(users.map(u => u.id === userId ? { ...u, isBanned: false } : u))
    } catch (err) {
      alert('Failed to unsuspend user')
    }
  }

  const handleApproveUser = async (userId) => {
    try {
      await adminAPI.approveUser(userId)
      setUsers(users.map(u => u.id === userId ? { ...u, isApproved: true } : u))
    } catch (err) {
      alert('Failed to approve user')
    }
  }

  if (loading) return <div className="loading"><div className="spinner"></div></div>

  return (
    <div className="container">
      <div className="app-sidebar-layout">
        <Sidebar
          header={<div className="dashboard-sidebar-name" style={{ padding: '4px 2px' }}>Admin</div>}
          items={ADMIN_SIDEBAR_ITEMS}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(c => !c)}
        />

        <main className="app-sidebar-main">
      <h1 style={{ marginBottom: '20px' }}>Admin Dashboard</h1>

      {stats && (
        <div className="grid" style={{ marginBottom: '40px' }}>
          <div className="card animate-in stat-card-hoverable" style={{ animationDelay: '0ms' }}>
            <h3>{totalUsersAnimated}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Total Users</p>

            <StatPopover
              title={`All Users (${nonAdminUsers.length})`}
              items={nonAdminUsers}
              emptyText="No users yet"
              onItemClick={(u) => setProfileUserId(u.id)}
              renderPrimary={userDisplayName}
              renderSecondary={(u) => u.email}
            />
          </div>
          <div className="card animate-in stat-card-hoverable" style={{ animationDelay: '60ms' }}>
            <h3>{totalPortfoliosAnimated}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Portfolios</p>

            <StatPopover
              title={`All Portfolios (${allPortfolios.length})`}
              items={allPortfolios}
              emptyText="No portfolios yet"
              itemHref={(p) => `/portfolio/${p.slug}`}
              renderPrimary={(p) => p.title}
              renderSecondary={(p) => `by ${p.ownerName}`}
            />
          </div>
          <div className="card animate-in" style={{ animationDelay: '120ms' }}>
            <h3>{totalViewsAnimated}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Views</p>
          </div>
          <div className="card animate-in stat-card-hoverable" style={{ animationDelay: '180ms' }}>
            <h3>{activeSubscriptionsAnimated}</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Active Subscriptions</p>

            <StatPopover
              title={`Active Subscriptions (${proUsers.length})`}
              items={proUsers}
              emptyText="No active subscriptions"
              onItemClick={(u) => setProfileUserId(u.id)}
              renderPrimary={userDisplayName}
              renderSecondary={(u) => u.email}
            />
          </div>
        </div>
      )}

      {analytics && (
        <>
          <div className="admin-analytics-grid">
            {(widgetSettings?.showSignupsWidget ?? true) && (
              <div className="card animate-in" style={{ animationDelay: '240ms' }}>
                <h3 className="admin-chart-title">Signups (last 30 days)</h3>
                <LineChart data={analytics.signupsByDay} valueKey="count" labelKey="date" />
              </div>
            )}

            {(widgetSettings?.showSubscriptionWidget ?? true) && (
              <div className="card animate-in" style={{ animationDelay: '300ms' }}>
                <h3 className="admin-chart-title">Subscription split</h3>
                <DonutChart
                  segments={[
                    { label: 'Pro', value: analytics.subscriptionBreakdown.pro, color: SUBSCRIPTION_COLORS.pro },
                    { label: 'Free', value: analytics.subscriptionBreakdown.free, color: SUBSCRIPTION_COLORS.free }
                  ]}
                />
              </div>
            )}

            {(widgetSettings?.showTemplatesWidget ?? true) && (
              <div className="card admin-chart-wide animate-in" style={{ animationDelay: '360ms' }}>
                <h3 className="admin-chart-title">Portfolios per template</h3>
                <BarChart data={analytics.templatePopularity} valueKey="count" labelKey="name" />
              </div>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <button className="btn btn-secondary" onClick={() => downloadCsv(analytics)}>
              <Download size={16} /> Download CSV
            </button>
          </div>
        </>
      )}

      <div className="card">
        <h2>Users</h2>
        <div style={{ overflowX: 'auto', marginTop: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Portfolios</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Tier</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px' }}>
                    <button
                      className="admin-user-name-link"
                      onClick={() => setProfileUserId(user.id)}
                      title="View profile"
                    >
                      {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.username}
                    </button>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {user.portfolios.length === 0 ? (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>—</span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {user.portfolios.map(p => (
                          <a
                            key={p.id}
                            href={`/portfolio/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-portfolio-link"
                          >
                            {p.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ fontSize: '12px', background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '4px' }}>
                      {user.subscriptionTier}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {user.isBanned && <span className="security-badge" style={{ color: '#ff6b6b' }}>Suspended</span>}
                    {!user.isBanned && !user.isApproved && <span className="security-badge">Pending approval</span>}
                    {!user.isBanned && user.isApproved && <span className="settings-muted" style={{ fontSize: '12px' }}>Active</span>}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!user.isApproved && !user.isBanned && (
                        <button onClick={() => handleApproveUser(user.id)} className="btn btn-secondary" title="Approve">
                          <UserCheck size={16} />
                        </button>
                      )}
                      {user.isBanned ? (
                        <button onClick={() => handleUnbanUser(user.id)} className="btn btn-secondary" title="Unsuspend">
                          <UserCheck size={16} />
                        </button>
                      ) : (
                        <button onClick={() => handleBanUser(user.id)} className="btn btn-secondary" title="Suspend">
                          <Ban size={16} />
                        </button>
                      )}
                      <button onClick={() => handleDeleteUser(user.id)} className="btn btn-secondary" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </main>
      </div>

      {profileUserId && (
        <AdminUserProfileModal userId={profileUserId} onClose={() => setProfileUserId(null)} />
      )}
    </div>
  )
}
