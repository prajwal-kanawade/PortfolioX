import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { portfolioAPI, resolveAssetUrl } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { Search, Eye, Heart, MessageCircle, User, Stethoscope, Camera, PenTool, Code2, Feather, Scale, Layers, PencilLine, Music, Building2, Dumbbell, ChefHat } from 'lucide-react'
import CommentsModal from '../components/CommentsModal'
import './Explore.css'

const CATEGORY_ICONS = {
  Healthcare: Stethoscope,
  Creative: Camera,
  Design: PenTool,
  Technology: Code2,
  Content: Feather,
  Legal: Scale,
  Music: Music,
  Architecture: Building2,
  Fitness: Dumbbell,
  Culinary: ChefHat,
}

function categoryIcon(category) {
  return CATEGORY_ICONS[category] || Layers
}

export default function Explore() {
  const { user, isAuthenticated } = useAuth()
  const { enableLikes, enableComments } = useSiteSettings()
  const navigate = useNavigate()
  const [portfolios, setPortfolios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [searchMode, setSearchMode] = useState('portfolio') // 'portfolio' | 'username'
  const [activeCategory, setActiveCategory] = useState('All')
  const [sort, setSort] = useState('trending')
  const [commentsFor, setCommentsFor] = useState(null)

  useEffect(() => {
    setLoading(true)
    portfolioAPI.explore({ sort, category: activeCategory === 'All' ? undefined : activeCategory })
      .then(res => setPortfolios(res.data))
      .catch(() => setError('Could not load portfolios. Please try again shortly.'))
      .finally(() => setLoading(false))
  }, [sort, activeCategory])

  const categories = useMemo(() => {
    const unique = [...new Set(portfolios.map(p => p.templateCategory).filter(Boolean))]
    return ['All', ...unique]
  }, [portfolios])

  const visiblePortfolios = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return portfolios
    if (searchMode === 'username') {
      return portfolios.filter(p =>
        p.ownerUsername?.toLowerCase().includes(q) ||
        p.ownerName?.toLowerCase().includes(q)
      )
    }
    return portfolios.filter(p =>
      p.title?.toLowerCase().includes(q) ||
      p.headline?.toLowerCase().includes(q)
    )
  }, [portfolios, search, searchMode])

  const handleToggleLike = async (e, portfolioId) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    const target = portfolios.find(p => p.id === portfolioId)
    if (!target) return
    const optimistic = { isLikedByMe: !target.isLikedByMe, likeCount: target.likeCount + (target.isLikedByMe ? -1 : 1) }
    setPortfolios(prev => prev.map(p => p.id === portfolioId ? { ...p, ...optimistic } : p))
    try {
      const res = await portfolioAPI.like(portfolioId)
      setPortfolios(prev => prev.map(p => p.id === portfolioId ? { ...p, isLikedByMe: res.data.liked, likeCount: res.data.likeCount } : p))
    } catch {
      setPortfolios(prev => prev.map(p => p.id === portfolioId ? { ...p, isLikedByMe: target.isLikedByMe, likeCount: target.likeCount } : p))
    }
  }

  return (
    <div className="explore">
      <header className="explore-hero">
        <h1>Discover Portfolios</h1>
        <p>Browse real portfolios published by the PortfolioX community.</p>
      </header>

      <div className="explore-controls">
        <button
          type="button"
          className="explore-search-mode-toggle"
          onClick={() => setSearchMode(m => m === 'portfolio' ? 'username' : 'portfolio')}
          title={searchMode === 'portfolio' ? 'Switch to searching by username' : 'Switch to searching by portfolio name'}
          aria-label={searchMode === 'portfolio' ? 'Switch to searching by username' : 'Switch to searching by portfolio name'}
        >
          {searchMode === 'portfolio' ? <Search size={16} /> : <User size={16} />}
          {searchMode === 'portfolio' ? 'By Title' : 'By Username'}
        </button>

        <div className="explore-search">
          <Search size={18} />
          <input
            type="text"
            placeholder={searchMode === 'username' ? 'Search by username...' : 'Search portfolios...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select className="explore-sort" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort portfolios">
          <option value="trending">Trending (last 7 days)</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      <div className="explore-categories">
        {categories.map(cat => (
          <button
            key={cat}
            className={`category-chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && <div className="loading"><div className="spinner"></div></div>}

      {!loading && error && <div className="error">{error}</div>}

      {!loading && !error && visiblePortfolios.length === 0 && (
        <div className="explore-empty">
          <p>No published portfolios found yet — be the first!</p>
        </div>
      )}

      {!loading && !error && visiblePortfolios.length > 0 && (
        <div className="explore-grid">
          {visiblePortfolios.map(p => {
            const Icon = categoryIcon(p.templateCategory)
            const isOwn = user?.id === p.userId

            const cardMedia = (
              <div className="explore-card-media">
                {p.photoUrl ? (
                  <img src={resolveAssetUrl(p.photoUrl)} alt={p.title} className="explore-card-image" />
                ) : (
                  <div className="explore-card-icon-bg"><Icon size={40} /></div>
                )}
              </div>
            )
            const ownerRow = !isOwn && p.ownerUsername && (
              <button
                type="button"
                className="explore-card-owner"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/user/${p.userId}`) }}
              >
                <span className="explore-card-owner-avatar">
                  {p.ownerAvatarUrl ? (
                    <img src={resolveAssetUrl(p.ownerAvatarUrl)} alt={p.ownerUsername} />
                  ) : (
                    <span>{(p.ownerName || p.ownerUsername)?.[0]?.toUpperCase() || '?'}</span>
                  )}
                </span>
                <span className="explore-card-owner-name">@{p.ownerUsername}</span>
              </button>
            )

            const cardBody = (
              <div className="explore-card-body">
                {p.templateName && <div className="explore-card-template">{p.templateName} template</div>}
                {ownerRow}
                {p.templateCategory && <span className="explore-card-category">{p.templateCategory}</span>}
                <h3>{p.title}</h3>
                {p.headline && <p>{p.headline}</p>}
                <div className="explore-card-meta">
                  <Eye size={14} /> {p.viewCount} views
                </div>
                {(enableLikes || enableComments) && (
                  <div className="explore-card-actions">
                    {enableLikes && (
                      <button
                        type="button"
                        className={`explore-card-like ${p.isLikedByMe ? 'liked' : ''}`}
                        onClick={(e) => handleToggleLike(e, p.id)}
                        aria-label={p.isLikedByMe ? 'Unlike this portfolio' : 'Like this portfolio'}
                        title={p.isLikedByMe ? 'Unlike' : 'Like'}
                      >
                        <Heart size={16} fill={p.isLikedByMe ? 'currentColor' : 'none'} /> {p.likeCount || 0}
                      </button>
                    )}
                    {enableComments && (
                      <button
                        type="button"
                        className="explore-card-comment"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCommentsFor(p) }}
                        aria-label="View comments"
                        title="Comments"
                      >
                        <MessageCircle size={16} /> Comment
                      </button>
                    )}
                  </div>
                )}
              </div>
            )

            if (isOwn) {
              return (
                <div key={p.id} className="explore-card explore-card-own">
                  {cardMedia}
                  {cardBody}
                  <div className="explore-card-own-overlay">
                    <span className="explore-card-own-badge">Your portfolio</span>
                    <div className="explore-card-own-actions">
                      <Link to={`/portfolio/${p.slug}`} className="btn btn-secondary">
                        <Eye size={16} /> Preview
                      </Link>
                      <Link to={`/portfolio/${p.id}/edit`} className="btn btn-primary">
                        <PencilLine size={16} /> Edit
                      </Link>
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <Link key={p.id} to={`/portfolio/${p.slug}`} className="explore-card">
                {cardMedia}
                {cardBody}
              </Link>
            )
          })}
        </div>
      )}

      {commentsFor && (
        <CommentsModal portfolio={commentsFor} onClose={() => setCommentsFor(null)} />
      )}
    </div>
  )
}
