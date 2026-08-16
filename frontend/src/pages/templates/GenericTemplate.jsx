import { resolveAssetUrl } from '../../services/api'
import ProjectBuildLog from '../../components/ProjectBuildLog'

export default function GenericTemplate({ portfolio }) {
  return (
    <div className="container">
      <header style={{ marginBottom: '40px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        {portfolio.photoUrl && (
          <img
            src={resolveAssetUrl(portfolio.photoUrl)}
            alt={portfolio.title}
            style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)' }}
          />
        )}
        <div>
          <h1>{portfolio.title}</h1>
          <p style={{ color: 'var(--accent)', fontSize: '18px', marginBottom: '12px' }}>{portfolio.headline}</p>
          <p style={{ color: 'var(--text-secondary)' }}>{portfolio.aboutMe}</p>
        </div>
      </header>

      {portfolio.skills?.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <h2>Skills</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
            {portfolio.skills.map(s => (
              <div key={s.id} className="card" style={{ padding: '12px 16px' }}>
                {s.skillName}
              </div>
            ))}
          </div>
        </section>
      )}

      {portfolio.experiences?.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <h2>Experience</h2>
          {portfolio.experiences.map(e => (
            <div key={e.id} className="card" style={{ marginBottom: '12px' }}>
              <h3>{e.jobTitle}</h3>
              <p style={{ color: 'var(--accent)' }}>{e.companyName}{e.location ? ` — ${e.location}` : ''}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{e.description}</p>
            </div>
          ))}
        </section>
      )}

      {portfolio.educations?.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <h2>Education</h2>
          {portfolio.educations.map(ed => (
            <div key={ed.id} className="card" style={{ marginBottom: '12px' }}>
              <h3>{ed.institutionName}</h3>
              <p style={{ color: 'var(--accent)' }}>{[ed.degree, ed.fieldOfStudy].filter(Boolean).join(' in ')}</p>
              {ed.description && <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{ed.description}</p>}
            </div>
          ))}
        </section>
      )}

      {portfolio.projects?.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <h2>Projects</h2>
          <div className="grid">
            {portfolio.projects.map(p => (
              <div key={p.id} className="card">
                {p.imageUrl && (
                  <img
                    src={resolveAssetUrl(p.imageUrl)}
                    alt={p.title}
                    style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }}
                  />
                )}
                <h3>{p.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{p.description}</p>
                {p.technologies && <small>{p.technologies}</small>}
                <ProjectBuildLog entries={p.logEntries} />
              </div>
            ))}
          </div>
        </section>
      )}

      <div style={{ textAlign: 'center', paddingTop: '40px', borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
        <p>Built with PortfolioX | Views: {portfolio.viewCount}</p>
      </div>
    </div>
  )
}
