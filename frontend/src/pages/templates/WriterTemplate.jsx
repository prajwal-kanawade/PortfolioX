import { Eye } from 'lucide-react'
import { resolveAssetUrl } from '../../services/api'
import './WriterTemplate.css'

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

export default function WriterTemplate({ portfolio }) {
  const initials = getInitials(portfolio.title)
  const hasBooks = portfolio.books?.length > 0
  const hasExperience = portfolio.experiences?.length > 0

  return (
    <div className="writer-template">
      <nav className="wr-nav">
        <div className="wr-nav-inner">
          <span className="wr-brand">{portfolio.title}</span>
          <div className="wr-nav-links">
            <a href="#wr-bookshelf">Bookshelf</a>
            {hasExperience && <a href="#wr-experience">Experience</a>}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="wr-section" style={{ paddingBottom: '64px' }}>
        <div className="wr-container wr-hero">
          <div>
            {portfolio.template?.category && (
              <span className="wr-label" style={{ display: 'block', marginBottom: '16px' }}>
                Author &amp; {portfolio.template.category}
              </span>
            )}
            <h1 className="wr-hero-title">{portfolio.headline || portfolio.title}</h1>
            {portfolio.aboutMe && <p className="wr-hero-blurb">{portfolio.aboutMe}</p>}
            <div className="wr-hero-actions">
              <a href="#wr-bookshelf" className="wr-btn wr-btn-solid">Explore the Bookshelf</a>
              {hasExperience && <a href="#wr-experience" className="wr-btn wr-btn-ghost">Literary Timeline</a>}
            </div>
          </div>
          <div className="wr-portrait">
            {portfolio.photoUrl ? (
              <img src={resolveAssetUrl(portfolio.photoUrl)} alt={portfolio.title} />
            ) : (
              <div className="wr-portrait-fallback">{initials}</div>
            )}
            <div className="wr-portrait-frame"></div>
          </div>
        </div>
      </section>

      <div className="wr-container"><div className="wr-divider"></div></div>

      {/* Bookshelf */}
      <section className="wr-section" id="wr-bookshelf">
        <div className="wr-container">
          <div className="wr-bookshelf-header">
            <div>
              <span className="wr-label" style={{ display: 'block', marginBottom: '8px' }}>Selected Bibliography</span>
              <h2 style={{ fontSize: '32px' }}>The Bookshelf</h2>
            </div>
          </div>
          <div className="wr-books-grid">
            {!hasBooks && <div className="wr-bookshelf-empty">The bookshelf is being curated — check back soon.</div>}
            {portfolio.books?.map(b => (
              <div key={b.id} className="wr-book-card">
                <div className="wr-book-cover">
                  {b.coverImageUrl ? (
                    <img src={resolveAssetUrl(b.coverImageUrl)} alt={b.title} />
                  ) : (
                    <span className="wr-book-cover-fallback">{b.title?.[0]?.toUpperCase() || '?'}</span>
                  )}
                </div>
                {(b.genre || b.publishedYear) && (
                  <span className="wr-label wr-book-meta">
                    {[b.genre, b.publishedYear].filter(Boolean).join(' | ')}
                  </span>
                )}
                <h3 className="wr-book-title">{b.title}</h3>
                {b.description && <p className="wr-book-desc">{b.description}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {hasExperience && (
        <>
          <div className="wr-container"><div className="wr-divider"></div></div>

          {/* Literary Timeline */}
          <section className="wr-section" id="wr-experience">
            <div className="wr-container">
              <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                <span className="wr-label">Career in Letters</span>
                <h2 style={{ fontSize: '32px', marginTop: '8px' }}>Literary Timeline</h2>
              </div>
              <div className="wr-toc">
                {portfolio.experiences.map(e => (
                  <div key={e.id} className="wr-toc-entry">
                    <div className="wr-toc-row">
                      <span className="wr-toc-title">{e.jobTitle} at {e.companyName}</span>
                      <span className="wr-toc-date">
                        {formatDate(e.startDate)} – {e.isCurrent ? 'Present' : formatDate(e.endDate)}
                      </span>
                    </div>
                    {e.description && <p className="wr-toc-desc">{e.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <footer className="wr-footer">
        <span className="wr-footer-brand">{portfolio.title}</span>
        <span className="wr-footer-meta">
          <Eye size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
          {portfolio.viewCount} profile views &middot; Built with PortfolioX
        </span>
      </footer>
    </div>
  )
}
