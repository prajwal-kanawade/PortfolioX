import { Building2, Eye } from 'lucide-react'
import { resolveAssetUrl } from '../../services/api'
import './ArchitectTemplate.css'

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

export default function ArchitectTemplate({ portfolio }) {
  const initials = getInitials(portfolio.title)
  const hasProjects = portfolio.projects?.length > 0
  const hasGallery = portfolio.galleryPhotos?.length > 0
  const hasSkills = portfolio.skills?.length > 0
  const hasExperience = portfolio.experiences?.length > 0
  const hasEducation = portfolio.educations?.length > 0

  return (
    <div className="architect-template">
      <nav className="ac-nav">
        <div className="ac-nav-inner">
          <span className="ac-brand">{portfolio.title}</span>
          <div className="ac-nav-links">
            {hasProjects && <a href="#ac-projects">Projects</a>}
            {hasGallery && <a href="#ac-gallery">Gallery</a>}
            {hasExperience && <a href="#ac-experience">Experience</a>}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="ac-hero">
        <div className="ac-container ac-hero-grid">
          <div>
            {portfolio.template?.category && <span className="ac-eyebrow">{portfolio.template.category}</span>}
            <h1 className="ac-hero-title">{portfolio.headline || portfolio.title}</h1>
            {portfolio.aboutMe && <p className="ac-hero-blurb">{portfolio.aboutMe}</p>}
          </div>
          <div className="ac-hero-photo">
            {portfolio.photoUrl ? (
              <img src={resolveAssetUrl(portfolio.photoUrl)} alt={portfolio.title} />
            ) : (
              <div className="ac-hero-photo-fallback">{initials}</div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {hasProjects && (
        <section className="ac-section" id="ac-projects">
          <div className="ac-container">
            <span className="ac-eyebrow">Selected Work</span>
            <h2>Featured Projects</h2>
            <div className="ac-projects-grid">
              {portfolio.projects.map(p => (
                <div key={p.id} className="ac-project-card">
                  <div className="ac-project-media">
                    {p.imageUrl ? (
                      <img src={resolveAssetUrl(p.imageUrl)} alt={p.title} />
                    ) : (
                      <Building2 size={32} />
                    )}
                  </div>
                  <div className="ac-project-body">
                    <h3>{p.title}</h3>
                    {p.description && <p>{p.description}</p>}
                    {p.technologies && (
                      <div className="ac-tag-row">
                        {p.technologies.split(',').map(t => t.trim()).filter(Boolean).map((t, i) => (
                          <span key={i} className="ac-tag">{t}</span>
                        ))}
                      </div>
                    )}
                    {(p.projectUrl || p.githubUrl) && (
                      <a href={p.projectUrl || p.githubUrl} target="_blank" rel="noopener noreferrer" className="ac-project-link">
                        View Case Study &#8594;
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Portfolio Gallery */}
      {hasGallery && (
        <section className="ac-section ac-section-tint" id="ac-gallery">
          <div className="ac-container">
            <span className="ac-eyebrow">Visual Archive</span>
            <h2>Portfolio Gallery</h2>
            <div className="ac-gallery-grid">
              {portfolio.galleryPhotos.map(g => (
                <div key={g.id} className="ac-gallery-card">
                  <img src={resolveAssetUrl(g.imageUrl)} alt={g.caption || portfolio.title} />
                  {g.caption && <div className="ac-gallery-caption">{g.caption}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Design Disciplines */}
      {hasSkills && (
        <section className="ac-section">
          <div className="ac-container">
            <span className="ac-eyebrow">Capabilities</span>
            <h2>Design Disciplines</h2>
            <div className="ac-skills-grid">
              {portfolio.skills.map(s => (
                <div key={s.id} className="ac-skill-card">
                  <h4>{s.skillName}</h4>
                  <p>{s.proficiencyLevel}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Firm History */}
      {hasExperience && (
        <section className="ac-section ac-section-tint" id="ac-experience">
          <div className="ac-container">
            <span className="ac-eyebrow">Practice</span>
            <h2>Firm History</h2>
            <div className="ac-timeline">
              {portfolio.experiences.map(e => (
                <div key={e.id} className="ac-timeline-item">
                  <div className="ac-timeline-date">
                    {formatDate(e.startDate)} – {e.isCurrent ? 'Present' : formatDate(e.endDate)}
                  </div>
                  <div>
                    <h4>{e.jobTitle}</h4>
                    <p className="ac-timeline-role">{e.companyName}{e.location ? ` — ${e.location}` : ''}</p>
                    {e.description && <p className="ac-timeline-desc">{e.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Education */}
      {hasEducation && (
        <section className="ac-section">
          <div className="ac-container">
            <span className="ac-eyebrow">Foundation</span>
            <h2>Education</h2>
            <div className="ac-timeline">
              {portfolio.educations.map(ed => (
                <div key={ed.id} className="ac-timeline-item">
                  <div className="ac-timeline-date">{ed.graduationDate ? formatDate(ed.graduationDate) : ''}</div>
                  <div>
                    <h4>{ed.institutionName}</h4>
                    <p className="ac-timeline-role">{[ed.degree, ed.fieldOfStudy].filter(Boolean).join(' in ')}</p>
                    {ed.description && <p className="ac-timeline-desc">{ed.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="ac-footer">
        <span className="ac-footer-brand">{portfolio.title}</span>
        <span className="ac-footer-meta">
          <Eye size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
          {portfolio.viewCount} profile views &middot; Built with PortfolioX
        </span>
      </footer>
    </div>
  )
}
