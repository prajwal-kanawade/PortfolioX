import { ExternalLink, Github, Eye } from 'lucide-react'
import { resolveAssetUrl } from '../../services/api'
import ProjectBuildLog from '../../components/ProjectBuildLog'
import './GraphicDesignerTemplate.css'

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

export default function GraphicDesignerTemplate({ portfolio }) {
  const initials = getInitials(portfolio.title)
  const hasSkills = portfolio.skills?.length > 0
  const hasExperience = portfolio.experiences?.length > 0
  const hasProjects = portfolio.projects?.length > 0

  return (
    <div className="designer-template">
      <nav className="gd-nav">
        <div className="gd-nav-inner">
          <span className="gd-brand">{portfolio.title}</span>
          <div className="gd-nav-links">
            {hasSkills && <a href="#gd-expertise">Expertise</a>}
            {hasExperience && <a href="#gd-experience">Experience</a>}
            {hasProjects && <a href="#gd-portfolio">Portfolio</a>}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="gd-section" style={{ paddingBottom: '48px' }}>
        <div className="gd-container">
          <h1 className="gd-hero-title">{portfolio.headline || portfolio.title}</h1>
          <div className="gd-hero-row">
            {portfolio.aboutMe && <p className="gd-hero-blurb">{portfolio.aboutMe}</p>}
            <div className="gd-hero-person">
              <div className="gd-avatar">
                {portfolio.photoUrl ? (
                  <img src={resolveAssetUrl(portfolio.photoUrl)} alt={portfolio.title} />
                ) : (
                  <div className="gd-avatar-fallback">{initials}</div>
                )}
              </div>
              <div>
                <p className="gd-hero-person-name">{portfolio.title}</p>
                {portfolio.template?.category && <p className="gd-hero-person-tag">{portfolio.template.category} Specialist</p>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      {portfolio.aboutMe && (
        <section className="gd-section" style={{ background: '#fff' }}>
          <div className="gd-container gd-about-grid">
            <div>
              <span className="gd-pill">About Me</span>
              <h2 className="gd-about-heading" style={{ marginTop: '24px' }}>{portfolio.aboutMe}</h2>
              <div className="gd-about-media">
                {portfolio.photoUrl ? (
                  <img src={resolveAssetUrl(portfolio.photoUrl)} alt={portfolio.title} />
                ) : (
                  <span className="gd-about-media-fallback">{initials}</span>
                )}
              </div>
            </div>
            <div style={{ paddingTop: '48px' }}>
              <div className="gd-stat-block">
                <h3 className="gd-stat-value">{portfolio.projects?.length || 0}</h3>
                <p className="gd-stat-label">Portfolio pieces completed and showcased.</p>
              </div>
              <div className="gd-stat-block">
                <h3 className="gd-stat-value">{portfolio.skills?.length || 0}</h3>
                <p className="gd-stat-label">Core areas of design expertise.</p>
              </div>
              <div className="gd-stat-block">
                <h3 className="gd-stat-value">{portfolio.viewCount}</h3>
                <p className="gd-stat-label">Profile views and counting.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Expertise / skills as service cards */}
      {hasSkills && (
        <section className="gd-section" id="gd-expertise">
          <div className="gd-container">
            <span className="gd-pill">Expertise</span>
            <h2 style={{ fontSize: '40px', margin: '24px 0 40px' }}>A look at my core design skills</h2>
            <div className="gd-skills-grid">
              {portfolio.skills.map(s => (
                <div key={s.id} className="gd-skill-card">
                  <h4>{s.skillName}</h4>
                  <span className="gd-skill-level">{s.proficiencyLevel}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Experience */}
      {hasExperience && (
        <section className="gd-section" id="gd-experience" style={{ background: '#fff' }}>
          <div className="gd-container">
            <span className="gd-pill">Experience</span>
            <h2 style={{ fontSize: '40px', margin: '24px 0 40px' }}>A yearly snapshot of my creative growth</h2>
            <div>
              {portfolio.experiences.map(e => (
                <div key={e.id} className="gd-exp-row">
                  <div>
                    <h4>{e.jobTitle} at {e.companyName}</h4>
                    <p>{e.description}</p>
                  </div>
                  <div className="gd-exp-date">
                    {formatDate(e.startDate)} – {e.isCurrent ? 'Now' : formatDate(e.endDate)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Portfolio */}
      {hasProjects && (
        <section className="gd-section" id="gd-portfolio">
          <div className="gd-container">
            <span className="gd-pill">Portfolio</span>
            <h2 style={{ fontSize: '40px', margin: '24px 0 40px' }}>Explore my portfolio of creative solutions</h2>
            <div className="gd-portfolio-grid">
              {portfolio.projects.map((p, i) => {
                const link = p.projectUrl || p.githubUrl
                return (
                  <div key={p.id} className={`gd-portfolio-item ${i % 4 === 3 ? 'wide' : ''}`}>
                    <div className="gd-portfolio-media">
                      {p.imageUrl ? (
                        <img src={resolveAssetUrl(p.imageUrl)} alt={p.title} />
                      ) : (
                        <span className="gd-portfolio-media-fallback">{p.title?.[0]?.toUpperCase() || '?'}</span>
                      )}
                    </div>
                    <div className="gd-portfolio-meta">
                      <h5>{p.title}</h5>
                      {link && (
                        <a className="gd-portfolio-link" href={link} target="_blank" rel="noopener noreferrer">
                          {p.githubUrl && !p.projectUrl ? <Github size={14} /> : <ExternalLink size={14} />}
                        </a>
                      )}
                      <ProjectBuildLog entries={p.logEntries} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Connect CTA */}
      <section className="gd-section">
        <div className="gd-connect">
          <h2>Let's Connect</h2>
        </div>
      </section>

      <footer className="gd-footer">
        <span className="gd-footer-brand">{portfolio.title}</span>
        <span className="gd-footer-meta">
          <Eye size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
          {portfolio.viewCount} profile views &middot; Built with PortfolioX
        </span>
      </footer>
    </div>
  )
}
