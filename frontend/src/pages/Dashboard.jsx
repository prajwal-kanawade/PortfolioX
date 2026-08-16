import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { portfolioAPI, resumeAPI, resolveAssetUrl } from '../services/api'
import LineChart from '../components/charts/LineChart'
import DonutChart from '../components/charts/DonutChart'
import BarChart from '../components/charts/BarChart'
import Sidebar from '../components/Sidebar'
import StatPopover from '../components/StatPopover'
import { useCountUp } from '../hooks/useCountUp'
import {
  FileText, Plus, Sparkles, Trash2, LayoutDashboard, Briefcase,
  ShieldCheck, Eye, TrendingUp, Gauge, Settings as SettingsIcon, PieChart, BarChart3, Heart
} from 'lucide-react'
import './Dashboard.css'

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'portfolios', label: 'My Portfolios', icon: Briefcase },
  { key: 'resumes', label: 'My Resumes', icon: FileText },
  { key: 'likes', label: 'Likes', icon: Heart },
]

// Fixed categorical order, validated with the dataviz skill's validate_palette.js against
// the dark card surface (chroma floor / CVD separation / contrast all pass; teal-vs-orange
// sits in the 6-8 ΔE warn band, mitigated by DonutChart's own legend). "Other" is an
// intentionally low-chroma neutral bucket, not a fifth categorical slot.
const PORTFOLIO_VIEW_COLORS = ['#5474E0', '#2E9E6B', '#C2692E', '#B23A6B']
const OTHER_COLOR = '#8A8F98'

export default function Dashboard() {
  const { user, isPro, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [portfolios, setPortfolios] = useState([])
  const [resumes, setResumes] = useState([])
  const [viewsByDay, setViewsByDay] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('dashboardSidebarCollapsed') === 'true')

  useEffect(() => {
    localStorage.setItem('dashboardSidebarCollapsed', String(collapsed))
  }, [collapsed])

  useEffect(() => {
    if (isAdmin) return
    loadAll()
  }, [isAdmin])

  // Admins don't create portfolios - send them to the analytics dashboard instead.
  if (isAdmin) return <Navigate to="/admin" replace />

  const loadAll = async () => {
    try {
      const [portfoliosRes, resumesRes, viewsRes] = await Promise.all([
        portfolioAPI.getMyPortfolios(),
        resumeAPI.getMyResumes().catch(() => ({ data: [] })),
        portfolioAPI.getMyViewsByDay().catch(() => ({ data: [] })),
      ])
      setPortfolios(portfoliosRes.data)
      setResumes(resumesRes.data)
      setViewsByDay(viewsRes.data)
    } catch (err) {
      setError('Failed to load your dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this portfolio?')) return
    try {
      await portfolioAPI.delete(id)
      setPortfolios(portfolios.filter(p => p.id !== id))
    } catch (err) {
      alert('Failed to delete portfolio')
    }
  }

  const handleDeleteResume = async (id) => {
    if (!confirm('Delete this resume?')) return
    try {
      await resumeAPI.delete(id)
      setResumes(resumes.filter(r => r.id !== id))
    } catch (err) {
      alert('Failed to delete resume')
    }
  }

  const stats = useMemo(() => {
    const totalViews = portfolios.reduce((sum, p) => sum + (p.viewCount || 0), 0)
    const avgScore = portfolios.length
      ? Math.round(portfolios.reduce((sum, p) => sum + (p.portfolioScore || 0), 0) / portfolios.length)
      : 0
    return {
      totalPortfolios: portfolios.length,
      totalViews,
      avgScore,
      totalResumes: resumes.length,
    }
  }, [portfolios, resumes])

  const topPortfolios = useMemo(() => {
    return [...portfolios].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5)
  }, [portfolios])

  // Views-by-portfolio donut: top 4 get their own categorical slot, the rest fold into a
  // single "Other" bucket rather than generating a 5th+ hue.
  const viewsByPortfolio = useMemo(() => {
    const sorted = [...portfolios].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    const top = sorted.slice(0, 4)
    const rest = sorted.slice(4)
    const segments = top
      .filter(p => (p.viewCount || 0) > 0)
      .map((p, i) => ({ label: p.title, value: p.viewCount || 0, color: PORTFOLIO_VIEW_COLORS[i] }))
    const otherTotal = rest.reduce((sum, p) => sum + (p.viewCount || 0), 0)
    if (otherTotal > 0) segments.push({ label: 'Other', value: otherTotal, color: OTHER_COLOR })
    return segments
  }, [portfolios])

  // Content-richness bar: total skills+projects+experience+education entries per portfolio,
  // derived client-side from data getMyPortfolios() already returns in full.
  const contentCounts = useMemo(() => {
    return [...portfolios]
      .map(p => ({
        name: p.title,
        count: (p.skills?.length || 0) + (p.projects?.length || 0) + (p.experiences?.length || 0) + (p.educations?.length || 0),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [portfolios])

  const [likesByPortfolio, setLikesByPortfolio] = useState({})
  const [likesLoading, setLikesLoading] = useState(false)

  useEffect(() => {
    if (activeTab !== 'likes' || portfolios.length === 0) return
    setLikesLoading(true)
    Promise.all(portfolios.map(p =>
      portfolioAPI.getLikes(p.id).then(res => [p.id, res.data]).catch(() => [p.id, []])
    ))
      .then(entries => setLikesByPortfolio(Object.fromEntries(entries)))
      .finally(() => setLikesLoading(false))
  }, [activeTab, portfolios])

  const totalPortfoliosAnimated = useCountUp(stats.totalPortfolios)
  const totalViewsAnimated = useCountUp(stats.totalViews)
  const avgScoreAnimated = useCountUp(stats.avgScore)
  const totalResumesAnimated = useCountUp(stats.totalResumes)

  if (loading) return <div className="loading"><div className="spinner"></div></div>

  const sidebarItems = [
    ...TABS.map(tab => ({ key: tab.key, label: tab.label, icon: tab.icon, active: activeTab === tab.key, onClick: () => setActiveTab(tab.key) })),
    { key: 'security', label: 'Security', icon: ShieldCheck, to: '/security' },
    { key: 'settings', label: 'Settings', icon: SettingsIcon, to: '/settings' },
  ]

  const sidebarHeader = (
    <>
      <div className="dashboard-sidebar-avatar">
        {(user?.firstName?.[0] || user?.username?.[0] || '?').toUpperCase()}
      </div>
      <div>
        <div className="dashboard-sidebar-name">{user?.firstName || user?.username}</div>
        {isPro && <span className="nav-pro-badge">PRO</span>}
      </div>
    </>
  )

  return (
    <div className="app-sidebar-layout">
      <Sidebar header={sidebarHeader} items={sidebarItems} collapsed={collapsed} onToggleCollapse={() => setCollapsed(c => !c)} />

      <main className="app-sidebar-main">
        {error && <div className="error">{error}</div>}

        {activeTab === 'overview' && (
          <div>
            <div className="dashboard-header">
              <div>
                <h1>Welcome, {user?.firstName || user?.username}!</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Here's how your portfolios are doing.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Link to={isPro ? '/ai-builder' : '/upgrade?redirect=/ai-builder'} className="btn btn-secondary">
                  <Sparkles size={20} /> Build with AI
                </Link>
                <Link to="/create-portfolio" className="btn btn-primary">
                  <Plus size={20} /> Create Portfolio
                </Link>
              </div>
            </div>

            <div className="dashboard-stats-grid">
              <div className="card dashboard-stat-tile animate-in stat-card-hoverable" style={{ animationDelay: '0ms' }}>
                <Briefcase size={20} className="dashboard-stat-icon" />
                <h3>{totalPortfoliosAnimated}</h3>
                <p>Total Portfolios</p>

                <StatPopover
                  title={
                    <>
                      My Portfolios ({portfolios.length})
                      <span className={`stat-popover-tier-badge ${isPro ? 'pro' : 'free'}`}>{isPro ? 'PRO' : 'FREE'}</span>
                    </>
                  }
                  items={portfolios}
                  emptyText="No portfolios yet - create your first one!"
                  itemHref={(p) => `/portfolio/${p.slug}`}
                  renderPrimary={(p) => p.title}
                  renderSecondary={(p) => p.template?.name ? `${p.template.name} template` : 'No template'}
                />
              </div>
              <div className="card dashboard-stat-tile animate-in" style={{ animationDelay: '60ms' }}>
                <Eye size={20} className="dashboard-stat-icon" />
                <h3>{totalViewsAnimated}</h3>
                <p>Total Views</p>
              </div>
              <div className="card dashboard-stat-tile animate-in" style={{ animationDelay: '120ms' }}>
                <Gauge size={20} className="dashboard-stat-icon" />
                <h3>{avgScoreAnimated}</h3>
                <p>Avg. Completeness Score</p>
              </div>
              <div className="card dashboard-stat-tile animate-in" style={{ animationDelay: '180ms' }}>
                <FileText size={20} className="dashboard-stat-icon" />
                <h3>{totalResumesAnimated}</h3>
                <p>Total Resumes</p>
              </div>
            </div>

            <div className="dashboard-overview-grid">
              <div className="card animate-in" style={{ animationDelay: '240ms' }}>
                <h3 className="dashboard-section-title"><TrendingUp size={18} /> Views (last 30 days)</h3>
                <LineChart data={viewsByDay} valueKey="count" labelKey="date" />
              </div>

              <div className="card animate-in" style={{ animationDelay: '300ms' }}>
                <h3 className="dashboard-section-title">Top Portfolios</h3>
                {topPortfolios.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No portfolios yet.</p>
                ) : (
                  <ul className="dashboard-top-list">
                    {topPortfolios.map(p => (
                      <li key={p.id}>
                        <Link to={`/portfolio/${p.id}/edit`}>{p.title}</Link>
                        <span><Eye size={13} /> {p.viewCount}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="card animate-in" style={{ animationDelay: '360ms' }}>
                <h3 className="dashboard-section-title"><PieChart size={18} /> Views by Portfolio</h3>
                {viewsByPortfolio.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>No views yet.</p>
                ) : (
                  <DonutChart segments={viewsByPortfolio} />
                )}
              </div>

              <div className="card animate-in" style={{ animationDelay: '420ms' }}>
                <h3 className="dashboard-section-title"><BarChart3 size={18} /> Content per Portfolio</h3>
                <BarChart data={contentCounts} valueKey="count" labelKey="name" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'portfolios' && (
          <div>
            <div className="dashboard-header">
              <h1>My Portfolios</h1>
              <Link to="/create-portfolio" className="btn btn-primary">
                <Plus size={20} /> Create Portfolio
              </Link>
            </div>

            {portfolios.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <h3>No portfolios yet</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Create your first portfolio to get started!</p>
                <Link to="/create-portfolio" className="btn btn-primary">Create Portfolio</Link>
              </div>
            ) : (
              <div className="grid">
                {portfolios.map(p => (
                  <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <h3>{p.template?.name || 'Custom'}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{p.title}</p>
                      {p.isPublished && (
                        <span style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '500' }}>✓ Published</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                      <Link to={`/portfolio/${p.id}/edit`} className="btn btn-secondary" style={{ flex: 1 }}>Edit</Link>
                      <a href={`/portfolio/${p.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ flex: 1 }}>View</a>
                      <button onClick={() => handleDelete(p.id)} className="btn btn-secondary" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {p.viewCount} views · Score: {p.portfolioScore}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'resumes' && (
          <div>
            <div className="dashboard-header">
              <h1>My Resumes</h1>
              <Link to="/resume-builder" className="btn btn-primary">
                <FileText size={18} /> New Resume
              </Link>
            </div>

            {resumes.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>No resumes yet.</p>
                <Link to="/resume-builder" className="btn btn-primary">Build a Resume</Link>
              </div>
            ) : (
              <div className="grid">
                {resumes.map(r => (
                  <div key={r.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <h3>{r.title}</h3>
                      {r.fullName && <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{r.fullName}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                      <Link to={`/resume/${r.id}/edit`} className="btn btn-secondary" style={{ flex: 1 }}>Edit</Link>
                      <button onClick={() => handleDeleteResume(r.id)} className="btn btn-secondary" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'likes' && (
          <div>
            <div className="dashboard-header">
              <h1>Likes</h1>
              <p style={{ color: 'var(--text-secondary)' }}>See who liked each of your portfolios.</p>
            </div>

            {portfolios.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Create a portfolio to start collecting likes.</p>
              </div>
            ) : likesLoading ? (
              <div className="loading"><div className="spinner"></div></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {portfolios.map(p => {
                  const likers = likesByPortfolio[p.id] || []
                  return (
                    <div key={p.id} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h3>{p.title}</h3>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                          <Heart size={14} /> {likers.length} like{likers.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      {likers.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No likes yet.</p>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                          {likers.map(liker => (
                            <Link
                              key={liker.userId}
                              to={`/user/${liker.userId}`}
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px 6px 6px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '999px', fontSize: '13px', color: 'var(--text-primary)' }}
                            >
                              <span style={{ width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', background: 'var(--accent)', color: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                                {liker.avatarUrl ? (
                                  <img src={resolveAssetUrl(liker.avatarUrl)} alt={liker.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  liker.username?.[0]?.toUpperCase() || '?'
                                )}
                              </span>
                              @{liker.username}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
