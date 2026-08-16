import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { portfolioAPI, settingsAPI, siteAPI } from '../services/api'
import SuggestButton from '../components/SuggestButton'
import { CheckCircle2, Lightbulb, Sparkles } from 'lucide-react'

const TIPS = [
  'Keep your headline short and specific - "Full-Stack Developer | React & Node" beats "Passionate coder".',
  'Write About Me like you\'re introducing yourself to a hiring manager, not a friend - lead with what you do.',
  'Pick the template that matches your field. You can add all your real content after this step, in the editor.',
  'Pro members can click Suggest to get real AI-generated headline and bio options tailored to your category.',
]

export default function CreatePortfolio() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    headline: '',
    aboutMe: ''
  })
  const [limitReached, setLimitReached] = useState(false)
  const [limitMessage, setLimitMessage] = useState('')

  useEffect(() => {
    Promise.all([
      portfolioAPI.getTemplates(),
      settingsAPI.get().catch(() => null),
      siteAPI.getPublicSettings().catch(() => null)
    ]).then(([templatesRes, settingsRes, siteRes]) => {
      setTemplates(templatesRes.data)
      // Explicit query param wins, then the user's own preference (Settings > Portfolio
      // Preferences), then the site-wide admin default as a last resort.
      const preselectId = searchParams.get('template') || settingsRes?.data?.defaultTemplateId || siteRes?.data?.defaultTemplateId
      if (preselectId && templatesRes.data.some(t => t.id === preselectId)) {
        setSelectedTemplate(preselectId)
      }
    }).catch(console.error)
  }, [searchParams])

  const selectedCategory = templates.find(t => t.id === selectedTemplate)?.category

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedTemplate) return alert('Please select a template')

    setLoading(true)
    setLimitReached(false)
    try {
      const res = await portfolioAPI.create({
        templateId: selectedTemplate,
        title: formData.title,
        headline: formData.headline,
        aboutMe: formData.aboutMe
      })
      navigate(`/portfolio/${res.data.id}/edit`)
    } catch (err) {
      console.error('Failed to create portfolio', err)
      if (err.response?.status === 403) {
        setLimitReached(true)
        setLimitMessage(err.response?.data?.message || '')
      } else {
        alert(err.response?.data?.message || 'Failed to create portfolio. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="animate-in" style={{ marginBottom: '8px' }}>
        <h1>Create New Portfolio</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
          Pick a template built for your field, add a few details, and start building - you can change everything later in the editor.
        </p>
      </div>

      <div className="animate-in" style={{ display: 'flex', gap: '16px', margin: '24px 0 20px', animationDelay: '60ms' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: selectedTemplate ? 'var(--accent)' : 'var(--text-primary)' }}>
          {selectedTemplate ? <CheckCircle2 size={16} /> : <span style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid currentColor', display: 'inline-block' }} />}
          1. Choose a template
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          <span style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid currentColor', display: 'inline-block' }} />
          2. Portfolio details
        </span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '40px' }}>
        {templates.map((t, i) => (
          <div
            key={t.id}
            className="card animate-in"
            onClick={() => setSelectedTemplate(t.id)}
            style={{
              cursor: 'pointer',
              border: selectedTemplate === t.id ? '2px solid var(--accent)' : '1px solid var(--border)',
              background: selectedTemplate === t.id ? 'rgba(var(--accent-rgb),.05)' : 'var(--bg-card)',
              animationDelay: `${120 + i * 40}ms`
            }}
          >
            <h3>{t.name}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{t.description}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <div className="card animate-in" style={{ flex: '1.4 1 420px', minWidth: 0, animationDelay: '200ms' }}>
          <h2>Portfolio Details</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="My Awesome Portfolio"
              />
            </div>

            <div className="form-group">
              <label>Headline</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  style={{ flex: 1, minWidth: 0 }}
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="Full-Stack Developer | UI/UX Designer"
                />
                <SuggestButton
                  category={selectedCategory}
                  field="headline"
                  context={formData.title}
                  onSelect={(value) => setFormData({ ...formData, headline: value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>About Me</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <textarea
                  rows="4"
                  style={{ flex: 1, minWidth: 0 }}
                  value={formData.aboutMe}
                  onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
                  placeholder="Tell us about yourself..."
                />
                <SuggestButton
                  category={selectedCategory}
                  field="aboutMe"
                  context={[formData.title, formData.headline].filter(Boolean).join(' - ')}
                  alignSelf="flex-start"
                  onSelect={(value) => setFormData({ ...formData, aboutMe: value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading || !selectedTemplate}>
              {loading ? 'Creating...' : 'Create Portfolio'}
            </button>
          </form>

          {limitReached && (
            <div
              className="animate-in"
              style={{
                marginTop: '16px',
                padding: '20px',
                textAlign: 'center',
                borderRadius: '10px',
                border: '1px solid var(--accent)',
                background: 'rgba(var(--accent-rgb),.05)'
              }}
            >
              <Sparkles size={24} style={{ color: 'var(--accent)', marginBottom: '8px' }} />
              <p style={{ fontWeight: 600, marginBottom: '6px' }}>Buy Pro Version to create more portfolios</p>
              {limitMessage && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>{limitMessage}</p>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/upgrade?redirect=/create-portfolio')}
              >
                Buy Pro
              </button>
            </div>
          )}
        </div>

        <div className="card animate-in" style={{ flex: '1 1 260px', alignSelf: 'flex-start', animationDelay: '260ms' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Lightbulb size={18} style={{ color: 'var(--accent)' }} /> Tips for a strong start
          </h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0 }}>
            {TIPS.map((tip, i) => (
              <li key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '16px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: 'var(--accent)' }}>&bull;</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
