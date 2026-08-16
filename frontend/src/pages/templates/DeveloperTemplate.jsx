import { Grid3x3, Mail } from 'lucide-react'
import { resolveAssetUrl } from '../../services/api'
import ProjectBuildLog from '../../components/ProjectBuildLog'
import './DeveloperTemplate.css'

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

export default function DeveloperTemplate({ portfolio }) {
  const initials = getInitials(portfolio.title)
  const hasSkills = portfolio.skills?.length > 0
  const hasExperience = portfolio.experiences?.length > 0
  const projects = portfolio.projects || []
  const featured = projects[0]
  const restProjects = featured ? projects.slice(1) : []

  return (
    <div className="developer-template">
      <div className="dv-frame">
        <nav className="dv-nav">
          <div className="dv-nav-brand">
            {portfolio.photoUrl ? (
              <img src={resolveAssetUrl(portfolio.photoUrl)} alt={portfolio.title} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
            ) : (
              <span className="dv-mono" style={{ fontSize: 12, fontWeight: 700 }}>{initials}</span>
            )}
            <span className="dv-status-dot"></span>
            <span className="dv-status-label">Available Now</span>
          </div>
          <div className="dv-nav-links">
            <a href="#">Home</a>
            {projects.length > 0 && <a href="#dv-projects">Projects</a>}
            <a href="#dv-contact">Contact</a>
          </div>
          <a href="#dv-contact" className="dv-btn-primary">Get In Touch</a>
        </nav>

        {/* Hero */}
        <section className="dv-hero">
          <div className="dv-container">
            <div className="dv-hero-grid">
              <div className="dv-hero-id">
                <div className="dv-hero-photo">
                  <div className="dv-hero-photo-backdrop"></div>
                  {portfolio.photoUrl ? (
                    <img src={resolveAssetUrl(portfolio.photoUrl)} alt={portfolio.title} />
                  ) : (
                    <div className="dv-hero-photo-fallback">{initials}</div>
                  )}
                </div>
                <div>
                  <span className="dv-hero-im">I'M</span>
                  <h1 className="dv-hero-name">{portfolio.title}</h1>
                </div>
              </div>
              <div className="dv-hero-tagline">
                {portfolio.headline ? <span>{portfolio.headline}</span> : <span>Full-Stack Developer</span>}
              </div>
            </div>

            {featured && (
              <div className="dv-featured">
                <div className="dv-featured-inner">
                  <div className="dv-featured-head">
                    <div>
                      <span className="dv-mono dv-featured-eyebrow">FEATURED PROJECT // 01</span>
                    </div>
                    {(featured.projectUrl || featured.githubUrl) && (
                      <a
                        href={featured.projectUrl || featured.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--dv-orange)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}
                      >
                        Explore the Work →
                      </a>
                    )}
                  </div>
                  <div className="dv-featured-panel">
                    <h3>{featured.title}</h3>
                    {featured.description && <p>{featured.description}</p>}
                    {featured.technologies && (
                      <div className="dv-project-tags" style={{ marginTop: 24 }}>
                        {featured.technologies.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                          <span key={t} className="dv-project-tag" style={{ color: '#9ca3af', borderColor: '#334155' }}>{t}</span>
                        ))}
                      </div>
                    )}
                    <ProjectBuildLog entries={featured.logEntries} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Tech Stack */}
        {hasSkills && (
          <section className="dv-section-dark" id="dv-skills">
            <div className="dv-container">
              <div className="dv-section-head">
                <div className="dv-section-icon"><Grid3x3 size={22} color="#fff" /></div>
                <h2 style={{ fontSize: 28 }}>Tech Stack</h2>
              </div>
              <div className="dv-skills-grid">
                {portfolio.skills.map(s => (
                  <span key={s.id} className="dv-skill-chip">
                    <span className="dot"></span>
                    {s.skillName} — {s.proficiencyLevel}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Projects */}
        {restProjects.length > 0 && (
          <section className={hasSkills ? 'dv-section-dark' : 'dv-section-dark'} id="dv-projects" style={{ paddingTop: hasSkills ? 0 : undefined }}>
            <div className="dv-container">
              <div className="dv-section-head">
                <div className="dv-section-icon"><Grid3x3 size={22} color="#fff" /></div>
                <h2 style={{ fontSize: 28 }}>Recent Projects</h2>
              </div>
              <div className="dv-projects-grid">
                {restProjects.map(p => {
                  const link = p.projectUrl || p.githubUrl
                  return (
                    <div key={p.id}>
                      <div className="dv-project-media">
                        {p.imageUrl ? (
                          <img src={resolveAssetUrl(p.imageUrl)} alt={p.title} />
                        ) : (
                          <div className="dv-project-media-fallback">{p.title?.[0]?.toUpperCase() || '?'}</div>
                        )}
                        {link && (
                          <a className="dv-project-overlay" href={link} target="_blank" rel="noopener noreferrer">
                            <span>View Project</span>
                          </a>
                        )}
                      </div>
                      <h3 className="dv-project-title">{p.title}</h3>
                      {p.technologies && (
                        <div className="dv-project-tags">
                          {p.technologies.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                            <span key={t} className="dv-project-tag">{t}</span>
                          ))}
                        </div>
                      )}
                      <ProjectBuildLog entries={p.logEntries} />
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Experience */}
        {hasExperience && (
          <section className="dv-section-light">
            <div className="dv-container">
              <div className="dv-section-head">
                <div className="dv-section-icon"><Mail size={22} color="#fff" /></div>
                <h2 style={{ fontSize: 28, color: 'var(--dv-black)' }}>Experience</h2>
              </div>
              <div>
                {portfolio.experiences.map(e => (
                  <div key={e.id} className="dv-timeline-item">
                    <div>
                      <h4 className="dv-timeline-role">{e.jobTitle}</h4>
                      <p className="dv-timeline-company">{e.companyName}{e.location ? ` — ${e.location}` : ''}</p>
                      {e.description && <p className="dv-timeline-desc">{e.description}</p>}
                    </div>
                    <div className="dv-timeline-date">
                      {formatDate(e.startDate)} – {e.isCurrent ? 'Present' : formatDate(e.endDate)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Closing CTA */}
        <section className="dv-cta" id="dv-contact">
          <div className="dv-cta-bg-text dv-mono" style={{ fontFamily: 'Anybody, sans-serif', fontWeight: 900, textTransform: 'uppercase' }}>
            {portfolio.title}
          </div>
          <h3>LET'S BUILD SOMETHING<br />GREAT TOGETHER</h3>
          <p className="dv-mono" style={{ color: 'var(--dv-gray)', fontSize: 13 }}>
            {portfolio.viewCount} profile views &middot; Built with PortfolioX
          </p>
        </section>

        <footer className="dv-footer">
          <span className="dv-footer-brand">{portfolio.title}</span>
          <span className="dv-footer-meta">© {new Date().getFullYear()} {portfolio.title}. All rights reserved.</span>
        </footer>
      </div>
    </div>
  )
}
