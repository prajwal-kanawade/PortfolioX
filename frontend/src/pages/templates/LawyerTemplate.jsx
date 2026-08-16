import { CheckCircle2, Scale, Briefcase, Shield, Home, FileText, HeartHandshake, Eye } from 'lucide-react'
import { resolveAssetUrl } from '../../services/api'
import './LawyerTemplate.css'

const EXPERTISE_ICONS = [Scale, Briefcase, Shield, HeartHandshake, Home, FileText]

function getInitials(name) {
  if (!name) return '?'
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  return words.slice(0, 2).map(w => w[0].toUpperCase()).join('')
}

function computeYearsExperience(experiences) {
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

export default function LawyerTemplate({ portfolio }) {
  const initials = getInitials(portfolio.title)
  const yearsExperience = computeYearsExperience(portfolio.experiences)
  const hasSkills = portfolio.skills?.length > 0
  const hasExperience = portfolio.experiences?.length > 0

  return (
    <div className="lawyer-template">
      <nav className="lw-nav">
        <div className="lw-nav-inner">
          <span className="lw-brand">{portfolio.title}</span>
          <div className="lw-nav-links">
            {hasSkills && <a href="#lw-expertise">Expertise</a>}
            {hasExperience && <a href="#lw-experience">Experience</a>}
            <a href="#lw-contact">Contact</a>
          </div>
          <a href="#lw-contact" className="lw-btn-gold">Consultation</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="lw-section lw-hero">
        <div className="lw-container lw-hero-grid">
          <div>
            <div>
              <span className="lw-hero-rule"></span>
              <span className="lw-eyebrow" style={{ color: 'var(--lw-secondary-fixed)' }}>Justice, Expertise, Results</span>
            </div>
            <h1 className="lw-hero-title">{portfolio.headline || portfolio.title}</h1>
            {portfolio.aboutMe && <p className="lw-hero-body">{portfolio.aboutMe}</p>}
            <div className="lw-hero-actions">
              {hasSkills && <a href="#lw-expertise" className="lw-btn-gold">Explore Expertise</a>}
              <a href="#lw-contact" className="lw-btn-outline">Contact Now</a>
            </div>
          </div>
          <div className="lw-hero-photo-wrap">
            <div className="lw-hero-photo">
              {portfolio.photoUrl ? (
                <img src={resolveAssetUrl(portfolio.photoUrl)} alt={portfolio.title} />
              ) : (
                <div className="lw-hero-photo-fallback">{initials}</div>
              )}
            </div>
            {yearsExperience && (
              <div className="lw-hero-stat">
                <div className="lw-hero-stat-value">{yearsExperience}+</div>
                <div className="lw-hero-stat-label">Years Experience</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="lw-stats-bar">
        <div className="lw-stats-grid">
          {yearsExperience && (
            <div>
              <div className="lw-stat-value">{yearsExperience}+</div>
              <p className="lw-stat-label">Years of Experience</p>
            </div>
          )}
          {hasSkills && (
            <div>
              <div className="lw-stat-value">{portfolio.skills.length}</div>
              <p className="lw-stat-label">Areas of Expertise</p>
            </div>
          )}
          {portfolio.projects?.length > 0 && (
            <div>
              <div className="lw-stat-value">{portfolio.projects.length}</div>
              <p className="lw-stat-label">Case Studies</p>
            </div>
          )}
          <div>
            <div className="lw-stat-value">{portfolio.viewCount}</div>
            <p className="lw-stat-label">Profile Views</p>
          </div>
        </div>
      </section>

      {/* About / Advocate intro */}
      {portfolio.aboutMe && (
        <section className="lw-section">
          <div className="lw-container lw-intro-grid">
            <div>
              <h2 className="lw-intro-heading">Your advocate. Your voice. Your legal ally.</h2>
            </div>
            <div>
              <p className="lw-intro-body">{portfolio.aboutMe}</p>
              <div className="lw-checklist">
                <div className="lw-checklist-item"><CheckCircle2 size={20} /><span>Personalized legal support</span></div>
                <div className="lw-checklist-item"><CheckCircle2 size={20} /><span>No-cost initial consultation</span></div>
                <div className="lw-checklist-item"><CheckCircle2 size={20} /><span>Transparent, fair fees</span></div>
                <div className="lw-checklist-item"><CheckCircle2 size={20} /><span>Client-first representation</span></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Areas of Expertise */}
      {hasSkills && (
        <section className="lw-section" id="lw-expertise" style={{ background: 'var(--lw-surface-container-low)' }}>
          <div className="lw-container">
            <div className="lw-expertise-header">
              <span className="lw-eyebrow">Our Services</span>
              <h2 style={{ fontSize: 36, marginTop: 8 }}>Areas of Expertise</h2>
            </div>
            <div className="lw-expertise-grid">
              {portfolio.skills.map((s, i) => {
                const Icon = EXPERTISE_ICONS[i % EXPERTISE_ICONS.length]
                return (
                  <div key={s.id} className="lw-expertise-card">
                    <Icon size={32} />
                    <h3>{s.skillName}</h3>
                    <p>Proficiency: {s.proficiencyLevel}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Experience / Case history */}
      {hasExperience && (
        <section className="lw-section lw-section-dark" id="lw-experience">
          <div className="lw-container">
            <span className="lw-eyebrow" style={{ color: 'var(--lw-secondary-fixed)' }}>Case History</span>
            <h2 style={{ fontSize: 36, marginTop: 8, marginBottom: 40 }}>Professional Experience</h2>
            <div>
              {portfolio.experiences.map(e => (
                <div key={e.id} className="lw-case-item">
                  <div>
                    <h4 className="lw-case-role">{e.jobTitle}</h4>
                    <p className="lw-case-company">{e.companyName}{e.location ? ` — ${e.location}` : ''}</p>
                    {e.description && <p className="lw-case-desc">{e.description}</p>}
                  </div>
                  <div className="lw-case-date">
                    {formatDate(e.startDate)} – {e.isCurrent ? 'Present' : formatDate(e.endDate)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Closing CTA */}
      <section className="lw-section lw-cta" id="lw-contact">
        <blockquote>"{portfolio.headline || 'Justice, Expertise, Results.'}"</blockquote>
        <p className="lw-eyebrow" style={{ color: 'var(--lw-on-surface-variant)' }}>
          {portfolio.viewCount} profile views &middot; Built with PortfolioX
        </p>
      </section>

      <footer className="lw-footer">
        <span className="lw-footer-brand">{portfolio.title}</span>
        <span className="lw-footer-meta">
          <Eye size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
          © {new Date().getFullYear()} {portfolio.title}. All rights reserved.
        </span>
      </footer>
    </div>
  )
}
