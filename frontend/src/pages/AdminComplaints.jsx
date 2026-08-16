import { useEffect, useState } from 'react'
import { adminAPI } from '../services/api'
import { X, MessageSquare, Bug, CheckCircle2, LayoutDashboard, Settings as SettingsIcon } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import '../components/Modal.css'
import './Settings.css'
import './AdminDashboard.css'

const TABS = [
  { key: 'complaints', label: 'Complaints', icon: MessageSquare },
  { key: 'bugs', label: 'Bug Reports', icon: Bug },
]

const ADMIN_SIDEBAR_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
  { key: 'complaints', label: 'Complaints', icon: MessageSquare, to: '/admin/complaints' },
  { key: 'settings', label: 'Settings', icon: SettingsIcon, to: '/admin/settings' },
]

export default function AdminComplaints() {
  const [activeTab, setActiveTab] = useState('complaints')
  const [complaints, setComplaints] = useState([])
  const [bugReports, setBugReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('adminSidebarCollapsed') === 'true')

  useEffect(() => {
    localStorage.setItem('adminSidebarCollapsed', String(collapsed))
  }, [collapsed])

  const load = () => {
    setLoading(true)
    Promise.all([adminAPI.getComplaints(), adminAPI.getBugReports()])
      .then(([complaintsRes, bugsRes]) => {
        setComplaints(complaintsRes.data)
        setBugReports(bugsRes.data)
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleResolveComplaint = async (id) => {
    await adminAPI.resolveComplaint(id)
    setComplaints(complaints.map(c => c.id === id ? { ...c, status: 'resolved' } : c))
    setSelected(sel => sel && sel.id === id ? { ...sel, status: 'resolved' } : sel)
  }

  const handleResolveBugReport = async (id) => {
    await adminAPI.resolveBugReport(id)
    setBugReports(bugReports.map(b => b.id === id ? { ...b, status: 'resolved' } : b))
    setSelected(sel => sel && sel.id === id ? { ...sel, status: 'resolved' } : sel)
  }

  if (loading) return <div className="loading"><div className="spinner"></div></div>

  const rows = activeTab === 'complaints' ? complaints : bugReports

  return (
    <div className="container">
      <div className="app-sidebar-layout">
        <Sidebar
          header={<div className="dashboard-sidebar-name" style={{ padding: '4px 2px' }}>Admin Panel</div>}
          items={ADMIN_SIDEBAR_ITEMS}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(c => !c)}
        />

        <main className="app-sidebar-main">
      <h1 style={{ marginBottom: '20px' }}>Complaints &amp; Bug Reports</h1>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <tab.icon size={16} /> {tab.label} ({tab.key === 'complaints' ? complaints.length : bugReports.length})
          </button>
        ))}
      </div>

      <div className="card security-table-card">
        {rows.length === 0 ? (
          <p className="settings-muted" style={{ padding: '20px' }}>Nothing here yet.</p>
        ) : (
          <div className="security-table-scroll" style={{ maxHeight: 520 }}>
            <table className="security-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>{activeTab === 'complaints' ? 'Subject' : 'Description'}</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id}>
                    <td>{row.userName} <span className="settings-muted">({row.userEmail})</span></td>
                    <td>{activeTab === 'complaints' ? row.subject : row.description}</td>
                    <td style={{ textTransform: 'capitalize' }}>
                      {row.status === 'resolved'
                        ? <span style={{ color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14} /> Resolved</span>
                        : <span className="security-badge">Open</span>}
                    </td>
                    <td>{new Date(row.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-secondary" onClick={() => setSelected(row)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </main>
      </div>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)} aria-label="Close"><X size={18} /></button>
            <div className="modal-title">{activeTab === 'complaints' ? 'Complaint' : 'Bug Report'}</div>

            <div className="modal-field-row">
              <span className="modal-field-label">From</span>
              <span className="modal-field-value">{selected.userName} ({selected.userEmail})</span>
            </div>
            {activeTab === 'complaints' && (
              <div className="modal-field-row">
                <span className="modal-field-label">Subject</span>
                <span className="modal-field-value">{selected.subject}</span>
              </div>
            )}
            {activeTab === 'bugs' && selected.pageUrl && (
              <div className="modal-field-row">
                <span className="modal-field-label">Page</span>
                <span className="modal-field-value">{selected.pageUrl}</span>
              </div>
            )}
            <div className="modal-field-row">
              <span className="modal-field-label">Submitted</span>
              <span className="modal-field-value">{new Date(selected.createdAt).toLocaleString()}</span>
            </div>

            <div style={{ marginTop: '16px' }}>
              <div className="modal-field-label" style={{ marginBottom: '6px' }}>Message</div>
              <p style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: 1.6 }}>
                {activeTab === 'complaints' ? selected.message : selected.description}
              </p>
            </div>

            {selected.status !== 'resolved' && (
              <button
                className="btn btn-primary"
                style={{ marginTop: '20px' }}
                onClick={() => activeTab === 'complaints' ? handleResolveComplaint(selected.id) : handleResolveBugReport(selected.id)}
              >
                <CheckCircle2 size={16} /> Mark Resolved
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
