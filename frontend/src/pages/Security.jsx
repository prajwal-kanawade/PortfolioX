import { useEffect, useMemo, useState } from 'react'
import { authAPI } from '../services/api'
import { Laptop, Trash2, CheckCircle2, XCircle, Search } from 'lucide-react'
import './Security.css'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

const FAILURE_LABELS = {
  invalid_credentials: 'Wrong password',
  account_inactive: 'Account inactive',
  pending_verification: 'Awaiting device verification',
}

export default function Security() {
  const [devices, setDevices] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState(null)
  const [dateSearch, setDateSearch] = useState('')

  const filteredHistory = useMemo(() => {
    const q = dateSearch.trim().toLowerCase()
    if (!q) return history
    return history.filter(h => formatDate(h.createdAt).toLowerCase().includes(q))
  }, [history, dateSearch])

  const load = async () => {
    const [devicesRes, historyRes] = await Promise.all([
      authAPI.getTrustedDevices(),
      authAPI.getLoginHistory(),
    ])
    setDevices(devicesRes.data)
    setHistory(historyRes.data)
  }

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const handleRemove = async (id) => {
    setRemovingId(id)
    try {
      await authAPI.revokeTrustedDevice(id)
      setDevices(devices.filter(d => d.id !== id))
    } finally {
      setRemovingId(null)
    }
  }

  if (loading) return <div className="loading"><div className="spinner"></div></div>

  return (
    <div className="container">
      <h1 style={{ marginBottom: '24px' }}>Security</h1>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px' }}>Trusted Devices</h2>
        {devices.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No trusted devices yet.</p>
        ) : (
          <div className="security-list">
            {devices.map(d => (
              <div key={d.id} className="card security-row">
                <Laptop size={20} />
                <div className="security-row-info">
                  <div className="security-row-title">{d.browser} on {d.operatingSystem}</div>
                  <div className="security-row-meta">
                    {d.ipAddress} · Last login {formatDate(d.lastLoginAt)} · Trusted until {formatDate(d.expiresAt)}
                  </div>
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleRemove(d.id)}
                  disabled={removingId === d.id}
                >
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 style={{ marginBottom: '16px' }}>Login History</h2>

        {history.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No login attempts recorded yet.</p>
        ) : (
          <>
            <div className="security-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by date (e.g. Aug 5, 2026)..."
                value={dateSearch}
                onChange={(e) => setDateSearch(e.target.value)}
              />
            </div>

            <div className="card security-table-card">
              <div className="security-table-scroll">
                <table className="security-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Device</th>
                      <th>IP Address</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map(h => (
                      <tr key={h.id}>
                        <td>
                          <span className="security-status-cell">
                            {h.success
                              ? <CheckCircle2 size={16} color="var(--accent)" />
                              : <XCircle size={16} color="#e57373" />}
                            {h.success ? 'Successful login' : (FAILURE_LABELS[h.failureReason] || 'Failed login')}
                            {h.isNewDevice && <span className="security-badge">New device</span>}
                          </span>
                        </td>
                        <td>{h.browser} on {h.operatingSystem}</td>
                        <td>{h.ipAddress}</td>
                        <td>{formatDate(h.createdAt)}</td>
                      </tr>
                    ))}
                    {filteredHistory.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                          No login attempts match that date.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
