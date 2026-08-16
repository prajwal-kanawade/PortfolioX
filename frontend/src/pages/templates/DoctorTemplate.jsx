import { useEffect, useState } from 'react'
import { Stethoscope, GraduationCap, Briefcase, FolderKanban, Eye, ExternalLink, Github, Calendar, CheckCircle2 } from 'lucide-react'
import { portfolioAPI, resolveAssetUrl } from '../../services/api'
import ProjectBuildLog from '../../components/ProjectBuildLog'
import './DoctorTemplate.css'

function getInitials(name) {
  if (!name) return '?'
  const cleaned = name.replace(/^Dr\.?\s*/i, '').trim()
  const words = cleaned.split(/\s+/).filter(Boolean)
  if (words.length === 0) return name[0]?.toUpperCase() || '?'
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

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidEmail(email) {
  return EMAIL_RE.test(String(email).trim())
}

function BookingSection({ portfolioId }) {
  const isLive = Boolean(portfolioId)
  const [date, setDate] = useState(todayIso())
  const [availability, setAvailability] = useState(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [form, setForm] = useState({ visitorName: '', visitorEmail: '', note: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [confirmation, setConfirmation] = useState(null)
  const [invalidEmailNotice, setInvalidEmailNotice] = useState(false)

  useEffect(() => {
    if (!isLive) return
    setSelectedSlot(null)
    setLoadingSlots(true)
    portfolioAPI.getAvailability(portfolioId, date)
      .then(res => setAvailability(res.data))
      .catch(() => setError('Could not load availability. Please try again.'))
      .finally(() => setLoadingSlots(false))
  }, [portfolioId, date, isLive])

  const handleBook = async (e) => {
    e.preventDefault()
    setError('')

    if (!isValidEmail(form.visitorEmail)) {
      setInvalidEmailNotice(true)
      return
    }

    setSubmitting(true)
    try {
      const res = await portfolioAPI.bookAppointment(portfolioId, {
        visitorName: form.visitorName,
        visitorEmail: form.visitorEmail,
        note: form.note,
        appointmentDate: date,
        timeSlot: selectedSlot,
      })
      setConfirmation(res.data)
    } catch (err) {
      if (err.response?.status === 409) {
        setError('That time slot was just booked — please pick another.')
        setSelectedSlot(null)
        portfolioAPI.getAvailability(portfolioId, date).then(res => setAvailability(res.data)).catch(() => {})
      } else if (err.response?.status === 400 && /email/i.test(err.response?.data?.message || '')) {
        setInvalidEmailNotice(true)
      } else {
        setError('Could not book this appointment. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmation) {
    return (
      <section className="dr-section dr-timeline-section" id="dr-booking">
        <div className="dr-container">
          <div className="dr-confirmation">
            <CheckCircle2 size={48} />
            <h2>Booking Confirmed</h2>
            <p>
              {confirmation.visitorName}, your appointment is set for{' '}
              <strong>{formatDate(confirmation.appointmentDate)} at {confirmation.timeSlot}</strong>.
            </p>
            <p className="dr-confirmation-email-note">
              A confirmation email has been sent to <strong>{confirmation.visitorEmail}</strong>.
            </p>
            <button className="dr-btn dr-btn-secondary" onClick={() => { setConfirmation(null); setSelectedSlot(null); setForm({ visitorName: '', visitorEmail: '', note: '' }) }}>
              Book Another
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="dr-section dr-timeline-section" id="dr-booking">
      <div className="dr-container">
        <div className="dr-section-heading">
          <h2>Book an Appointment</h2>
          <div className="dr-underline"></div>
        </div>

        {!isLive && (
          <p className="dr-preview-note">
            This is a preview — booking becomes available once this template is used for a real portfolio.
          </p>
        )}

        <div className="dr-booking-grid">
          <div className="dr-card">
            <label className="dr-field-label" htmlFor="dr-booking-date">
              <Calendar size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              Select a date
            </label>
            <input
              id="dr-booking-date"
              type="date"
              min={todayIso()}
              value={date}
              disabled={!isLive}
              onChange={(e) => setDate(e.target.value)}
              className="dr-date-input"
            />

            <div className="dr-slot-grid">
              {(availability?.allSlots || ['09:00 AM', '10:30 AM', '01:15 PM', '02:45 PM', '04:00 PM', '05:30 PM']).map(slot => {
                const taken = availability?.bookedSlots?.includes(slot)
                return (
                  <button
                    type="button"
                    key={slot}
                    disabled={!isLive || taken || loadingSlots}
                    className={`dr-slot ${selectedSlot === slot ? 'selected' : ''} ${taken ? 'taken' : ''}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot}
                  </button>
                )
              })}
            </div>
          </div>

          <form className="dr-card" onSubmit={handleBook}>
            <label className="dr-field-label">Your Name</label>
            <input
              type="text"
              required
              disabled={!isLive}
              value={form.visitorName}
              onChange={(e) => setForm({ ...form, visitorName: e.target.value })}
              className="dr-text-input"
            />
            <label className="dr-field-label">Email</label>
            <input
              type="email"
              required
              disabled={!isLive}
              value={form.visitorEmail}
              onChange={(e) => setForm({ ...form, visitorEmail: e.target.value })}
              className="dr-text-input"
            />
            <label className="dr-field-label">Reason for Visit (optional)</label>
            <textarea
              rows={3}
              disabled={!isLive}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="dr-text-input"
            />
            {error && <p className="dr-booking-error">{error}</p>}
            <button type="submit" className="dr-btn dr-btn-primary" disabled={!isLive || !selectedSlot || submitting}>
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      </div>

      {invalidEmailNotice && (
        <div className="dr-modal-overlay" onClick={() => setInvalidEmailNotice(false)}>
          <div className="dr-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Invalid Email Address</h3>
            <p>Please enter a valid email address so we can send your appointment confirmation.</p>
            <button className="dr-btn dr-btn-primary" onClick={() => setInvalidEmailNotice(false)}>
              Okay
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default function DoctorTemplate({ portfolio }) {
  const initials = getInitials(portfolio.title)
  const yearsExperience = computeYearsExperience(portfolio.experiences)
  const hasSkills = portfolio.skills?.length > 0
  const hasExperience = portfolio.experiences?.length > 0
  const hasEducation = portfolio.educations?.length > 0
  const hasProjects = portfolio.projects?.length > 0

  return (
    <div className="doctor-template">
      <nav className="dr-nav">
        <div className="dr-nav-inner">
          <span className="dr-brand">{portfolio.title}</span>
          <div className="dr-nav-links">
            {hasSkills && <a href="#dr-expertise">Expertise</a>}
            {hasExperience && <a href="#dr-experience">Experience</a>}
            {hasEducation && <a href="#dr-education">Education</a>}
            {hasProjects && <a href="#dr-projects">Case Studies</a>}
            <a href="#dr-booking">Book Appointment</a>
          </div>
        </div>
      </nav>

      <section className="dr-section dr-hero">
        <div className="dr-container dr-hero-grid">
          <div>
            {portfolio.template?.category && <span className="dr-eyebrow">{portfolio.template.category}</span>}
            <h1>{portfolio.headline || portfolio.title}</h1>
            {portfolio.aboutMe && <p className="dr-hero-about">{portfolio.aboutMe}</p>}
            <div className="dr-hero-stats">
              {yearsExperience && (
                <div className="dr-stat">
                  <span className="dr-stat-value">{yearsExperience}+</span>
                  <span className="dr-stat-label">Years Experience</span>
                </div>
              )}
              {hasSkills && (
                <div className="dr-stat">
                  <span className="dr-stat-value">{portfolio.skills.length}</span>
                  <span className="dr-stat-label">Areas of Expertise</span>
                </div>
              )}
              <div className="dr-stat">
                <span className="dr-stat-value">{portfolio.viewCount}</span>
                <span className="dr-stat-label">Profile Views</span>
              </div>
            </div>
          </div>
          <div className="dr-hero-avatar">
            {portfolio.photoUrl ? (
              <img src={resolveAssetUrl(portfolio.photoUrl)} alt={portfolio.title} className="dr-avatar-photo" />
            ) : (
              <div className="dr-avatar-circle">{initials}</div>
            )}
          </div>
        </div>
      </section>

      {hasSkills && (
        <section className="dr-section" id="dr-expertise">
          <div className="dr-container">
            <div className="dr-section-heading">
              <h2>Areas of Expertise</h2>
              <div className="dr-underline"></div>
            </div>
            <div className="dr-expertise-grid">
              {portfolio.skills.map(s => (
                <div key={s.id} className="dr-card">
                  <Stethoscope size={32} className="dr-card-icon" />
                  <h3>{s.skillName}</h3>
                  <p>Proficiency: {s.proficiencyLevel}</p>
                  {s.endorsements > 0 && (
                    <div className="dr-badge-row">
                      <span className="dr-badge">{s.endorsements} endorsement{s.endorsements === 1 ? '' : 's'}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {hasExperience && (
        <section className="dr-section dr-timeline-section" id="dr-experience">
          <div className="dr-container">
            <div className="dr-section-heading">
              <h2>Professional Experience</h2>
              <div className="dr-underline"></div>
            </div>
            <div className="dr-timeline">
              {portfolio.experiences.map(e => (
                <div key={e.id} className="dr-timeline-item">
                  <div className="dr-timeline-icon"><Briefcase size={20} /></div>
                  <div>
                    <h4>{e.jobTitle}</h4>
                    <p className="dr-timeline-role">{e.companyName}{e.location ? ` — ${e.location}` : ''}</p>
                    <p className="dr-timeline-meta">
                      {formatDate(e.startDate)} – {e.isCurrent ? 'Present' : formatDate(e.endDate)}
                    </p>
                    {e.description && <p className="dr-timeline-desc">{e.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {hasEducation && (
        <section className="dr-section" id="dr-education">
          <div className="dr-container">
            <div className="dr-section-heading">
              <h2>Academic Foundation</h2>
              <div className="dr-underline"></div>
            </div>
            <div className="dr-timeline">
              {portfolio.educations.map(ed => (
                <div key={ed.id} className="dr-timeline-item">
                  <div className="dr-timeline-icon"><GraduationCap size={20} /></div>
                  <div>
                    <h4>{ed.institutionName}</h4>
                    <p className="dr-timeline-role">
                      {[ed.degree, ed.fieldOfStudy].filter(Boolean).join(' in ')}
                    </p>
                    {ed.graduationDate && <p className="dr-timeline-meta">{formatDate(ed.graduationDate)}</p>}
                    {ed.description && <p className="dr-timeline-desc">{ed.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {hasProjects && (
        <section className="dr-section dr-timeline-section" id="dr-projects">
          <div className="dr-container">
            <div className="dr-section-heading">
              <h2>Case Studies &amp; Publications</h2>
              <div className="dr-underline"></div>
            </div>
            <div className="dr-projects-grid">
              {portfolio.projects.map(p => (
                <div key={p.id} className="dr-card">
                  <FolderKanban size={28} className="dr-card-icon" />
                  <h3>{p.title}</h3>
                  {p.description && <p>{p.description}</p>}
                  {p.technologies && (
                    <div className="dr-badge-row">
                      {p.technologies.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                        <span key={t} className="dr-badge">{t}</span>
                      ))}
                    </div>
                  )}
                  {(p.projectUrl || p.githubUrl) && (
                    <div className="dr-project-links">
                      {p.projectUrl && (
                        <a href={p.projectUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={14} /> View
                        </a>
                      )}
                      {p.githubUrl && (
                        <a href={p.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github size={14} /> Source
                        </a>
                      )}
                    </div>
                  )}
                  <ProjectBuildLog entries={p.logEntries} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <BookingSection portfolioId={portfolio.id} />

      <footer className="dr-footer">
        <div className="dr-footer-inner">
          <div className="dr-footer-brand">{portfolio.title}</div>
          {portfolio.headline && <p className="dr-footer-tagline">{portfolio.headline}</p>}
          <p className="dr-footer-meta">
            <Eye size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            {portfolio.viewCount} profile views &middot; Built with PortfolioX
          </p>
        </div>
      </footer>
    </div>
  )
}
