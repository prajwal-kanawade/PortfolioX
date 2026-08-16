import { ChefHat, Eye } from 'lucide-react'
import { resolveAssetUrl } from '../../services/api'
import './ChefTemplate.css'

function getInitials(name) {
  if (!name) return '?'
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  return words.slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function ChefTemplate({ portfolio }) {
  const initials = getInitials(portfolio.title)
  const hasDishes = portfolio.projects?.length > 0
  const hasGallery = portfolio.galleryPhotos?.length > 0
  const hasSkills = portfolio.skills?.length > 0
  const hasExperience = portfolio.experiences?.length > 0
  const hasEducation = portfolio.educations?.length > 0
  const hasCookbooks = portfolio.books?.length > 0

  return (
    <div className="chef-template">
      <nav className="cf-nav">
        <div className="cf-nav-inner">
          <span className="cf-brand">{portfolio.title}</span>
          <div className="cf-nav-links">
            {hasDishes && <a href="#cf-dishes">Signature Dishes</a>}
            {hasGallery && <a href="#cf-gallery">Gallery</a>}
            {hasExperience && <a href="#cf-experience">Experience</a>}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="cf-hero">
        <div className="cf-container cf-hero-grid">
          <div>
            {portfolio.template?.category && <span className="cf-eyebrow">{portfolio.template.category}</span>}
            <h1 className="cf-hero-title">{portfolio.headline || portfolio.title}</h1>
            {portfolio.aboutMe && <p className="cf-hero-blurb">{portfolio.aboutMe}</p>}
            {hasDishes && <a href="#cf-dishes" className="cf-btn">Explore the Menu</a>}
          </div>
          <div className="cf-hero-photo">
            {portfolio.photoUrl ? (
              <img src={resolveAssetUrl(portfolio.photoUrl)} alt={portfolio.title} />
            ) : (
              <div className="cf-hero-photo-fallback">{initials}</div>
            )}
            <div className="cf-hero-frame"></div>
          </div>
        </div>
      </section>

      {/* Signature Dishes */}
      {hasDishes && (
        <section className="cf-section" id="cf-dishes">
          <div className="cf-container">
            <span className="cf-eyebrow">The Menu</span>
            <h2>Signature Dishes</h2>
            <div className="cf-dishes-grid">
              {portfolio.projects.map(p => (
                <div key={p.id} className="cf-dish-card">
                  <div className="cf-dish-media">
                    {p.imageUrl ? (
                      <img src={resolveAssetUrl(p.imageUrl)} alt={p.title} />
                    ) : (
                      <ChefHat size={30} />
                    )}
                  </div>
                  <h3>{p.title}</h3>
                  {p.description && <p>{p.description}</p>}
                  {p.technologies && (
                    <div className="cf-tag-row">
                      {p.technologies.split(',').map(t => t.trim()).filter(Boolean).map((t, i) => (
                        <span key={i} className="cf-tag">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Food Gallery */}
      {hasGallery && (
        <section className="cf-section cf-section-dark" id="cf-gallery">
          <div className="cf-container">
            <span className="cf-eyebrow">From the Kitchen</span>
            <h2>Food Gallery</h2>
            <div className="cf-gallery-grid">
              {portfolio.galleryPhotos.map(g => (
                <div key={g.id} className="cf-gallery-card">
                  <img src={resolveAssetUrl(g.imageUrl)} alt={g.caption || portfolio.title} />
                  {g.caption && <div className="cf-gallery-caption">{g.caption}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Culinary Techniques */}
      {hasSkills && (
        <section className="cf-section">
          <div className="cf-container">
            <span className="cf-eyebrow">Craft</span>
            <h2>Culinary Techniques</h2>
            <div className="cf-skills-grid">
              {portfolio.skills.map(s => (
                <div key={s.id} className="cf-skill-chip">{s.skillName} &middot; {s.proficiencyLevel}</div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Kitchen Experience */}
      {hasExperience && (
        <section className="cf-section cf-section-dark" id="cf-experience">
          <div className="cf-container">
            <span className="cf-eyebrow">Career</span>
            <h2>Kitchen Experience</h2>
            <div className="cf-timeline">
              {portfolio.experiences.map(e => (
                <div key={e.id} className="cf-timeline-item">
                  <div className="cf-timeline-date">
                    {formatDate(e.startDate)} – {e.isCurrent ? 'Present' : formatDate(e.endDate)}
                  </div>
                  <div>
                    <h4>{e.jobTitle}</h4>
                    <p className="cf-timeline-role">{e.companyName}{e.location ? ` — ${e.location}` : ''}</p>
                    {e.description && <p className="cf-timeline-desc">{e.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Culinary Training */}
      {hasEducation && (
        <section className="cf-section">
          <div className="cf-container">
            <span className="cf-eyebrow">Training</span>
            <h2>Culinary Training</h2>
            <div className="cf-timeline">
              {portfolio.educations.map(ed => (
                <div key={ed.id} className="cf-timeline-item">
                  <div className="cf-timeline-date">{ed.graduationDate ? formatDate(ed.graduationDate) : ''}</div>
                  <div>
                    <h4>{ed.institutionName}</h4>
                    <p className="cf-timeline-role">{[ed.degree, ed.fieldOfStudy].filter(Boolean).join(' in ')}</p>
                    {ed.description && <p className="cf-timeline-desc">{ed.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Published Cookbooks (optional) */}
      {hasCookbooks && (
        <section className="cf-section cf-section-dark">
          <div className="cf-container">
            <span className="cf-eyebrow">In Print</span>
            <h2>Published Cookbooks</h2>
            <div className="cf-books-grid">
              {portfolio.books.map(b => (
                <div key={b.id} className="cf-book-card">
                  <div className="cf-book-cover">
                    {b.coverImageUrl ? (
                      <img src={resolveAssetUrl(b.coverImageUrl)} alt={b.title} />
                    ) : (
                      <span>{b.title?.[0]?.toUpperCase() || '?'}</span>
                    )}
                  </div>
                  <h4>{b.title}</h4>
                  {(b.genre || b.publishedYear) && (
                    <span className="cf-book-meta">{[b.genre, b.publishedYear].filter(Boolean).join(' | ')}</span>
                  )}
                  {b.description && <p>{b.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="cf-footer">
        <span className="cf-footer-brand">{portfolio.title}</span>
        <span className="cf-footer-meta">
          <Eye size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
          {portfolio.viewCount} profile views &middot; Built with PortfolioX
        </span>
      </footer>
    </div>
  )
}
