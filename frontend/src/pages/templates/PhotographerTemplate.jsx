import { Aperture, Eye } from 'lucide-react'
import { resolveAssetUrl } from '../../services/api'
import './PhotographerTemplate.css'

function getInitials(name) {
  if (!name) return '?'
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  return words.slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

function computeYearsActive(experiences) {
  if (!experiences?.length) return null
  const starts = experiences
    .map(e => new Date(e.startDate))
    .filter(d => !isNaN(d.getTime()))
  if (!starts.length) return null
  const earliest = new Date(Math.min(...starts))
  const years = Math.floor((Date.now() - earliest.getTime()) / (365.25 * 24 * 3600 * 1000))
  return Math.max(1, years)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function PhotographerTemplate({ portfolio }) {
  const initials = getInitials(portfolio.title)
  const yearsActive = computeYearsActive(portfolio.experiences)
  const hasSkills = portfolio.skills?.length > 0
  const hasExperience = portfolio.experiences?.length > 0
  const hasEducation = portfolio.educations?.length > 0
  const galleryPhotos = portfolio.galleryPhotos || []

  return (
    <div className="photographer-template">
      <nav className="ph-nav">
        <div className="ph-nav-inner">
          <span className="ph-brand">{portfolio.title}</span>
          <div className="ph-nav-links">
            <a href="#ph-gallery">Gallery</a>
            {hasSkills && <a href="#ph-expertise">Specialties</a>}
            {hasExperience && <a href="#ph-experience">Experience</a>}
            {hasEducation && <a href="#ph-education">Education</a>}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="ph-hero">
        <div className="ph-pane">
          <div>
            <span className="ph-eyebrow">Portfolio / 01</span>
            <h1 className="ph-hero-title">{portfolio.headline || portfolio.title}</h1>
          </div>
          <span className="ph-hero-year">'{new Date().getFullYear().toString().slice(-2)}</span>
        </div>

        <div className="ph-pane ph-pane-photo">
          {portfolio.photoUrl ? (
            <img src={resolveAssetUrl(portfolio.photoUrl)} alt={portfolio.title} />
          ) : (
            <div className="ph-pane-photo-fallback">{initials}</div>
          )}
          {portfolio.aboutMe && <div className="ph-pane-photo-caption">{portfolio.title}</div>}
        </div>

        <div className="ph-pane ph-pane-stats">
          <div className="ph-stat-row">
            <span className="ph-stat-label">Photos Showcased</span>
            <span className="ph-stat-value">{galleryPhotos.length}</span>
          </div>
          {yearsActive && (
            <div className="ph-stat-row">
              <span className="ph-stat-label">Years Active</span>
              <span className="ph-stat-value">{yearsActive}+</span>
            </div>
          )}
          <div className="ph-stat-row">
            <span className="ph-stat-label">Profile Views</span>
            <span className="ph-stat-value">{portfolio.viewCount}</span>
          </div>
        </div>
      </section>

      {/* Philosophy / About */}
      {portfolio.aboutMe && (
        <section className="ph-section">
          <div className="ph-container ph-philosophy-grid">
            <div className="ph-philosophy-heading">
              <span className="ph-eyebrow">Philosophy / 02</span>
              <h2>The Art of Seeing.</h2>
            </div>
            <div className="ph-philosophy-body">
              <p>{portfolio.aboutMe}</p>
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      <section className="ph-section" id="ph-gallery" style={{ borderTop: '1px dashed var(--ph-medium-gray)' }}>
        <div className="ph-container">
          <span className="ph-eyebrow">Showcase / 03</span>
          <h2 style={{ marginBottom: '40px' }}>Selected Work</h2>
          <div className="ph-gallery-grid">
            {galleryPhotos.length === 0 && (
              <div className="ph-gallery-empty">
                Showcase photos coming soon.
              </div>
            )}
            {galleryPhotos.map(g => (
              <div key={g.id} className="ph-gallery-card">
                <img src={resolveAssetUrl(g.imageUrl)} alt={g.caption || portfolio.title} />
                {g.caption && <div className="ph-gallery-caption">{g.caption}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise / Specialties */}
      {hasSkills && (
        <section className="ph-section" id="ph-expertise">
          <div className="ph-container">
            <span className="ph-eyebrow">Specialties / 04</span>
            <h2 style={{ marginBottom: '40px' }}>Areas of Focus</h2>
            <div className="ph-expertise-grid">
              {portfolio.skills.map(s => (
                <div key={s.id} className="ph-expertise-card">
                  <Aperture size={28} />
                  <h3>{s.skillName}</h3>
                  <p>{s.proficiencyLevel}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Experience */}
      {hasExperience && (
        <section className="ph-section ph-timeline-section" id="ph-experience">
          <div className="ph-container">
            <span className="ph-eyebrow">Experience / 05</span>
            <h2 style={{ marginBottom: '40px' }}>Studio Timeline</h2>
            <div className="ph-timeline">
              {portfolio.experiences.map(e => (
                <div key={e.id} className="ph-timeline-item">
                  <div className="ph-timeline-meta">
                    {formatDate(e.startDate)} – {e.isCurrent ? 'Present' : formatDate(e.endDate)}
                  </div>
                  <div>
                    <h4>{e.jobTitle}</h4>
                    <p className="ph-timeline-role">{e.companyName}{e.location ? ` — ${e.location}` : ''}</p>
                    {e.description && <p className="ph-timeline-desc">{e.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Education */}
      {hasEducation && (
        <section className="ph-section" id="ph-education">
          <div className="ph-container">
            <span className="ph-eyebrow">Education / 06</span>
            <h2 style={{ marginBottom: '40px' }}>Academic Foundation</h2>
            <div className="ph-timeline">
              {portfolio.educations.map(ed => (
                <div key={ed.id} className="ph-timeline-item">
                  <div className="ph-timeline-meta">{ed.graduationDate ? formatDate(ed.graduationDate) : ''}</div>
                  <div>
                    <h4>{ed.institutionName}</h4>
                    <p className="ph-timeline-role">{[ed.degree, ed.fieldOfStudy].filter(Boolean).join(' in ')}</p>
                    {ed.description && <p className="ph-timeline-desc">{ed.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Vision quote */}
      <section className="ph-vision">
        <blockquote>"{portfolio.headline || 'Art is not what you see, but what you make others see.'}"</blockquote>
        <div className="ph-vision-divider"></div>
      </section>

      <footer className="ph-footer">
        <span className="ph-footer-brand">{portfolio.title}</span>
        <span className="ph-footer-meta">
          <Eye size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
          {portfolio.viewCount} profile views &middot; Built with PortfolioX
        </span>
      </footer>
    </div>
  )
}
