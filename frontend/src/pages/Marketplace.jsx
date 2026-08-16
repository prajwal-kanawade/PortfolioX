import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { portfolioAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Search, Stethoscope, Camera, PenTool, Code2, Feather, Scale, Layers, X, Music, Building2, Dumbbell, ChefHat } from 'lucide-react'
import { TEMPLATE_COMPONENTS, TEMPLATE_SAMPLE_DATA, TEMPLATE_PREVIEW_IMAGES } from './templates'
import './Marketplace.css'

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

export default function Marketplace() {
  const navigate = useNavigate()
  const { isAuthenticated, isAdmin } = useAuth()

  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortBy, setSortBy] = useState('featured')
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const [livePreviewTemplate, setLivePreviewTemplate] = useState(null)

  useEffect(() => {
    portfolioAPI.getTemplates()
      .then(res => setTemplates(res.data))
      .catch(() => setError('Could not load templates. Please try again shortly.'))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    const unique = [...new Set(templates.map(t => t.category).filter(Boolean))]
    return ['All', ...unique]
  }, [templates])

  const visibleTemplates = useMemo(() => {
    let list = templates.filter(t => {
      const matchesCategory = activeCategory === 'All' || t.category === activeCategory
      const q = search.trim().toLowerCase()
      const matchesSearch = !q ||
        t.name?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.code?.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })

    if (sortBy === 'name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'category') {
      list = [...list].sort((a, b) => (a.category || '').localeCompare(b.category || ''))
    }

    return list
  }, [templates, activeCategory, search, sortBy])

  const handlePreview = (template) => {
    if (TEMPLATE_COMPONENTS[template.code]) {
      setLivePreviewTemplate(template)
    } else {
      setPreviewTemplate(template)
    }
  }

  const handleUseTemplate = (template) => {
    if (isAdmin) {
      alert("Admin accounts can't create portfolios.")
      return
    }
    const destination = `/create-portfolio?template=${template.id}`
    if (isAuthenticated) {
      navigate(destination)
    } else {
      navigate(`/login?redirect=${encodeURIComponent(destination)}`)
    }
  }

  return (
    <div className="marketplace">
      <header className="marketplace-hero">
        <h1>Template Marketplace</h1>
        <p>Browse professionally designed templates, preview them, and start building in one click.</p>
      </header>

      <div className="marketplace-controls">
        <div className="marketplace-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="marketplace-sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort templates"
        >
          <option value="featured">Featured order</option>
          <option value="name">Name (A-Z)</option>
          <option value="category">Category</option>
        </select>
      </div>

      <div className="marketplace-categories">
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

      {loading && (
        <div className="loading"><div className="spinner"></div></div>
      )}

      {!loading && error && <div className="error">{error}</div>}

      {!loading && !error && visibleTemplates.length === 0 && (
        <div className="marketplace-empty">
          <p>No templates match your search.</p>
        </div>
      )}

      {!loading && !error && visibleTemplates.length > 0 && (
        <div className="marketplace-grid">
          {visibleTemplates.map(t => {
            const Icon = categoryIcon(t.category)
            const previewImage = TEMPLATE_PREVIEW_IMAGES[t.code]
            return (
              <div key={t.id || t.code} className="template-tile">
                <div className="template-tile-media">
                  {previewImage ? (
                    <img src={previewImage} alt={`${t.name} template preview`} className="template-tile-image" />
                  ) : (
                    <div className="template-tile-icon-bg"><Icon size={48} /></div>
                  )}
                </div>
                <div className="template-tile-overlay">
                  {t.category && <span className="template-tile-category">{t.category}</span>}
                  <h3>{t.name}</h3>
                  <p>{t.description}</p>
                  <div className="template-tile-actions">
                    <button className="btn btn-secondary" onClick={() => handlePreview(t)}>Preview</button>
                    <button className="btn btn-primary" onClick={() => handleUseTemplate(t)}>Use Template</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {previewTemplate && (
        <div className="template-modal-overlay" onClick={() => setPreviewTemplate(null)}>
          <div className="template-modal" onClick={(e) => e.stopPropagation()}>
            <button className="template-modal-close" onClick={() => setPreviewTemplate(null)} aria-label="Close preview">
              <X size={20} />
            </button>

            <div className="template-modal-preview">
              {(() => {
                const Icon = categoryIcon(previewTemplate.category)
                return <Icon size={56} />
              })()}
            </div>

            <div className="template-modal-body">
              {previewTemplate.category && <span className="template-tile-category">{previewTemplate.category}</span>}
              <h2>{previewTemplate.name}</h2>
              <p>{previewTemplate.description}</p>
              <p className="template-modal-note">
                Every template uses PortfolioX's section-based builder — add your projects, skills,
                experience and education after you select it, and rearrange them anytime from the editor.
              </p>
            </div>

            <div className="template-modal-actions">
              <button className="btn btn-secondary" onClick={() => setPreviewTemplate(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => handleUseTemplate(previewTemplate)}>Use This Template</button>
            </div>
          </div>
        </div>
      )}

      {livePreviewTemplate && (() => {
        const LiveComponent = TEMPLATE_COMPONENTS[livePreviewTemplate.code]
        const sampleData = TEMPLATE_SAMPLE_DATA[livePreviewTemplate.code]
        return (
          <div className="live-preview-overlay">
            <div className="live-preview-bar">
              <span>Previewing <strong>{livePreviewTemplate.name}</strong> with sample content</span>
              <div className="live-preview-bar-actions">
                <button className="btn btn-secondary" onClick={() => setLivePreviewTemplate(null)}>
                  <X size={16} /> Close
                </button>
                <button className="btn btn-primary" onClick={() => handleUseTemplate(livePreviewTemplate)}>Use This Template</button>
              </div>
            </div>
            <div className="live-preview-body">
              <LiveComponent portfolio={sampleData} />
            </div>
          </div>
        )
      })()}
    </div>
  )
}
