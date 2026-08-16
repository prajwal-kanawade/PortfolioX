import { Dumbbell, Eye } from 'lucide-react'
import { resolveAssetUrl } from '../../services/api'
import './FitnessTrainerTemplate.css'

function getInitials(name) {
  if (!name) return '?'
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  return words.slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

function computeYearsExperience(experiences) {
  if (!experiences?.length) return null
  const starts = experiences.map(e => new Date(e.startDate)).filter(d => !isNaN(d.getTime()))
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

export default function FitnessTrainerTemplate({ portfolio }) {
  const initials = getInitials(portfolio.title)
  const yearsExperience = computeYearsExperience(portfolio.experiences)
  const hasPrograms = portfolio.projects?.length > 0
  const hasGallery = portfolio.galleryPhotos?.length > 0
  const hasSkills = portfolio.skills?.length > 0
  const hasExperience = portfolio.experiences?.length > 0
  const hasEducation = portfolio.educations?.length > 0

  return (
    <div className="fitness-template">
      <nav className="ft-nav">
        <div className="ft-nav-inner">
          <span className="ft-brand">{portfolio.title}</span>
          <div className="ft-nav-links">
            {hasPrograms && <a href="#ft-programs">Programs</a>}
            {hasGallery && <a href="#ft-gallery">Results</a>}
            {hasExperience && <a href="#ft-experience">Experience</a>}
          </div>
          <a href="#ft-contact" className="ft-btn-cta">Book a Session</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="ft-hero">
        <div className="ft-container ft-hero-grid">
          <div>
            {portfolio.template?.category && <span className="ft-eyebrow">{portfolio.template.category}</span>}
            <h1 className="ft-hero-title">{portfolio.headline || portfolio.title}</h1>
            {portfolio.aboutMe && <p className="ft-hero-blurb">{portfolio.aboutMe}</p>}
            <div className="ft-hero-stats">
              {yearsExperience && (
                <div className="ft-stat"><span className="ft-stat-value">{yearsExperience}+</span><span className="ft-stat-label">Years Coaching</span></div>
              )}
              {hasSkills && (
                <div className="ft-stat"><span className="ft-stat-value">{portfolio.skills.length}</span><span className="ft-stat-label">Certifications</span></div>
              )}
              <div className="ft-stat"><span className="ft-stat-value">{portfolio.viewCount}</span><span className="ft-stat-label">Profile Views</span></div>
            </div>
            <a href="#ft-contact" className="ft-btn ft-btn-solid">Book a Session</a>
          </div>
          <div className="ft-hero-photo">
            {portfolio.photoUrl ? (
              <img src={resolveAssetUrl(portfolio.photoUrl)} alt={portfolio.title} />
            ) : (
              <div className="ft-hero-photo-fallback">{initials}</div>
            )}
          </div>
        </div>
      </section>

      {/* Programs / Transformation Case Studies */}
      {hasPrograms && (
        <section className="ft-section" id="ft-programs">
          <div className="ft-container">
            <span className="ft-eyebrow">Results That Speak</span>
            <h2>Programs &amp; Transformations</h2>
            <div className="ft-programs-grid">
              {portfolio.projects.map(p => (
                <div key={p.id} className="ft-program-card">
                  <div className="ft-program-icon"><Dumbbell size={26} /></div>
                  <h3>{p.title}</h3>
                  {p.description && <p>{p.description}</p>}
                  {p.technologies && (
                    <div className="ft-tag-row">
                      {p.technologies.split(',').map(t => t.trim()).filter(Boolean).map((t, i) => (
                        <span key={i} className="ft-tag">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Before/After Gallery */}
      {hasGallery && (
        <section className="ft-section ft-section-dark" id="ft-gallery">
          <div className="ft-container">
            <span className="ft-eyebrow">Proof in Progress</span>
            <h2>Before &amp; After Gallery</h2>
            <div className="ft-gallery-grid">
              {portfolio.galleryPhotos.map(g => (
                <div key={g.id} className="ft-gallery-card">
                  <img src={resolveAssetUrl(g.imageUrl)} alt={g.caption || portfolio.title} />
                  {g.caption && <div className="ft-gallery-caption">{g.caption}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Certifications & Specialties */}
      {hasSkills && (
        <section className="ft-section">
          <div className="ft-container">
            <span className="ft-eyebrow">Credentials</span>
            <h2>Certifications &amp; Specialties</h2>
            <div className="ft-skills-grid">
              {portfolio.skills.map(s => (
                <div key={s.id} className="ft-skill-card">
                  <h4>{s.skillName}</h4>
                  <span className="ft-skill-level">{s.proficiencyLevel}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Coaching Experience */}
      {hasExperience && (
        <section className="ft-section ft-section-dark" id="ft-experience">
          <div className="ft-container">
            <span className="ft-eyebrow">Track Record</span>
            <h2>Coaching Experience</h2>
            <div className="ft-timeline">
              {portfolio.experiences.map(e => (
                <div key={e.id} className="ft-timeline-item">
                  <div className="ft-timeline-date">
                    {formatDate(e.startDate)} – {e.isCurrent ? 'Present' : formatDate(e.endDate)}
                  </div>
                  <div>
                    <h4>{e.jobTitle}</h4>
                    <p className="ft-timeline-role">{e.companyName}{e.location ? ` — ${e.location}` : ''}</p>
                    {e.description && <p className="ft-timeline-desc">{e.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Certifications / Education */}
      {hasEducation && (
        <section className="ft-section">
          <div className="ft-container">
            <span className="ft-eyebrow">Foundation</span>
            <h2>Certifications &amp; Education</h2>
            <div className="ft-timeline">
              {portfolio.educations.map(ed => (
                <div key={ed.id} className="ft-timeline-item">
                  <div className="ft-timeline-date">{ed.graduationDate ? formatDate(ed.graduationDate) : ''}</div>
                  <div>
                    <h4>{ed.institutionName}</h4>
                    <p className="ft-timeline-role">{[ed.degree, ed.fieldOfStudy].filter(Boolean).join(' in ')}</p>
                    {ed.description && <p className="ft-timeline-desc">{ed.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="ft-footer" id="ft-contact">
        <span className="ft-footer-brand">{portfolio.title}</span>
        <span className="ft-footer-meta">
          <Eye size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
          {portfolio.viewCount} profile views &middot; Built with PortfolioX
        </span>
      </footer>
    </div>
  )
}
