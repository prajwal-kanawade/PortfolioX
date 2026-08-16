import { Music, Eye } from 'lucide-react'
import { resolveAssetUrl } from '../../services/api'
import './MusicianTemplate.css'

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

export default function MusicianTemplate({ portfolio }) {
  const initials = getInitials(portfolio.title)
  const hasReleases = portfolio.projects?.length > 0
  const hasGallery = portfolio.galleryPhotos?.length > 0
  const hasSkills = portfolio.skills?.length > 0
  const hasExperience = portfolio.experiences?.length > 0
  const hasEducation = portfolio.educations?.length > 0

  return (
    <div className="musician-template">
      <nav className="ms-nav">
        <div className="ms-nav-inner">
          <span className="ms-brand">{portfolio.title}</span>
          <div className="ms-nav-links">
            {hasReleases && <a href="#ms-releases">Releases</a>}
            {hasGallery && <a href="#ms-gallery">Gallery</a>}
            {hasExperience && <a href="#ms-tour">Tour History</a>}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="ms-hero">
        <div className="ms-hero-photo">
          {portfolio.photoUrl ? (
            <img src={resolveAssetUrl(portfolio.photoUrl)} alt={portfolio.title} />
          ) : (
            <div className="ms-hero-photo-fallback">{initials}</div>
          )}
          <div className="ms-hero-scrim"></div>
        </div>
        <div className="ms-hero-content">
          {portfolio.template?.category && <span className="ms-eyebrow">{portfolio.template.category}</span>}
          <h1 className="ms-hero-title">{portfolio.headline || portfolio.title}</h1>
          {portfolio.aboutMe && <p className="ms-hero-blurb">{portfolio.aboutMe}</p>}
          <div className="ms-hero-actions">
            {hasReleases && <a href="#ms-releases" className="ms-btn ms-btn-solid">Listen Now</a>}
            <a href="#ms-contact" className="ms-btn ms-btn-ghost">Book Me</a>
          </div>
        </div>
      </section>

      {/* Releases */}
      {hasReleases && (
        <section className="ms-section" id="ms-releases">
          <div className="ms-container">
            <span className="ms-eyebrow">Discography</span>
            <h2>Releases &amp; Tracks</h2>
            <div className="ms-releases-grid">
              {portfolio.projects.map(p => (
                <div key={p.id} className="ms-release-card">
                  <div className="ms-release-art">
                    {p.imageUrl ? (
                      <img src={resolveAssetUrl(p.imageUrl)} alt={p.title} />
                    ) : (
                      <Music size={32} />
                    )}
                  </div>
                  <h3>{p.title}</h3>
                  {p.description && <p>{p.description}</p>}
                  {p.technologies && (
                    <div className="ms-tag-row">
                      {p.technologies.split(',').map(t => t.trim()).filter(Boolean).map((t, i) => (
                        <span key={i} className="ms-tag">{t}</span>
                      ))}
                    </div>
                  )}
                  {(p.projectUrl || p.githubUrl) && (
                    <a href={p.projectUrl || p.githubUrl} target="_blank" rel="noopener noreferrer" className="ms-release-link">
                      Listen &#8594;
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Live Performance Gallery */}
      {hasGallery && (
        <section className="ms-section ms-section-dark" id="ms-gallery">
          <div className="ms-container">
            <span className="ms-eyebrow">On Stage</span>
            <h2>Live Performance Gallery</h2>
            <div className="ms-gallery-grid">
              {portfolio.galleryPhotos.map(g => (
                <div key={g.id} className="ms-gallery-card">
                  <img src={resolveAssetUrl(g.imageUrl)} alt={g.caption || portfolio.title} />
                  {g.caption && <div className="ms-gallery-caption">{g.caption}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Instruments & Techniques */}
      {hasSkills && (
        <section className="ms-section">
          <div className="ms-container">
            <span className="ms-eyebrow">Craft</span>
            <h2>Instruments &amp; Techniques</h2>
            <div className="ms-skills-grid">
              {portfolio.skills.map(s => (
                <div key={s.id} className="ms-skill-chip">
                  <span className="ms-skill-dot"></span>
                  {s.skillName} — {s.proficiencyLevel}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tour & Residency History */}
      {hasExperience && (
        <section className="ms-section ms-section-dark" id="ms-tour">
          <div className="ms-container">
            <span className="ms-eyebrow">On the Road</span>
            <h2>Tour &amp; Residency History</h2>
            <div className="ms-timeline">
              {portfolio.experiences.map(e => (
                <div key={e.id} className="ms-timeline-item">
                  <div className="ms-timeline-date">
                    {formatDate(e.startDate)} – {e.isCurrent ? 'Present' : formatDate(e.endDate)}
                  </div>
                  <div>
                    <h4>{e.jobTitle}</h4>
                    <p className="ms-timeline-role">{e.companyName}{e.location ? ` — ${e.location}` : ''}</p>
                    {e.description && <p className="ms-timeline-desc">{e.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Training */}
      {hasEducation && (
        <section className="ms-section">
          <div className="ms-container">
            <span className="ms-eyebrow">Training</span>
            <h2>Musical Education</h2>
            <div className="ms-timeline">
              {portfolio.educations.map(ed => (
                <div key={ed.id} className="ms-timeline-item">
                  <div className="ms-timeline-date">{ed.graduationDate ? formatDate(ed.graduationDate) : ''}</div>
                  <div>
                    <h4>{ed.institutionName}</h4>
                    <p className="ms-timeline-role">{[ed.degree, ed.fieldOfStudy].filter(Boolean).join(' in ')}</p>
                    {ed.description && <p className="ms-timeline-desc">{ed.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="ms-footer" id="ms-contact">
        <span className="ms-footer-brand">{portfolio.title}</span>
        <span className="ms-footer-meta">
          <Eye size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
          {portfolio.viewCount} profile views &middot; Built with PortfolioX
        </span>
      </footer>
    </div>
  )
}
