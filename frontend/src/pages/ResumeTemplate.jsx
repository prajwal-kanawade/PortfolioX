import './ResumeTemplate.css'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function ResumeTemplate({ resume, variant = 'modern' }) {
  const contactParts = [resume.phone, resume.email, resume.linkedInUrl, resume.location].filter(Boolean)
  const hasExperience = resume.experiences?.length > 0
  const hasEducation = resume.educations?.length > 0
  const hasSkills = resume.skillCategories?.length > 0

  return (
    <div className="rs-print-area">
      <div className={`resume-template resume-template-${variant}`}>
        <div className="rs-header">
          <div className="rs-name">{resume.fullName || 'YOUR NAME HERE'}</div>
          {contactParts.length > 0 && (
            <div className="rs-contact-info">
              {contactParts.map((part, i) => (
                <span key={i}>
                  {part}
                  {i < contactParts.length - 1 && <span className="rs-contact-sep"> / </span>}
                </span>
              ))}
            </div>
          )}
        </div>

        {resume.summary && (
          <div className="rs-section">
            <div className="rs-section-title">Career Summary</div>
            <p className="rs-summary">{resume.summary}</p>
          </div>
        )}

        {hasExperience && (
          <div className="rs-section">
            <div className="rs-section-title">Work Experience</div>
            {resume.experiences.map(e => (
              <div key={e.id} className="rs-entry">
                <div className="rs-entry-header">
                  <div>
                    <div className="rs-entry-title">{e.jobTitle}</div>
                    <div className="rs-entry-subtitle">{e.companyName}{e.location ? ` - ${e.location}` : ''}</div>
                  </div>
                  <div className="rs-entry-date">
                    {formatDate(e.startDate)} - {e.isCurrent ? 'Present' : formatDate(e.endDate)}
                  </div>
                </div>
                {e.bullets?.length > 0 && (
                  <ul className="rs-bullets">
                    {e.bullets.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {hasEducation && (
          <div className="rs-section">
            <div className="rs-section-title">Education & Certifications</div>
            {resume.educations.map(ed => (
              <div key={ed.id} className="rs-entry">
                <div className="rs-entry-header">
                  <div>
                    <div className="rs-entry-title">{ed.degree}</div>
                    <div className="rs-entry-subtitle">{ed.university}</div>
                  </div>
                  <div className="rs-entry-date">{formatDate(ed.graduationDate)}</div>
                </div>
                {ed.bullets?.length > 0 && (
                  <ul className="rs-bullets">
                    {ed.bullets.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {hasSkills && (
          <div className="rs-section">
            <div className="rs-section-title">Skills</div>
            <div className="rs-skills-grid">
              {resume.skillCategories.map(s => (
                <div key={s.id} className="rs-skill-category">
                  <strong>{s.categoryName}:</strong> {s.content}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
