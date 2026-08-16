import { useState } from 'react'
import { Mail, CheckCircle2 } from 'lucide-react'
import { portfolioAPI } from '../services/api'
import './ContactForm.css'

export default function ContactForm({ portfolioId, isOwnPortfolio }) {
  const [visitorName, setVisitorName] = useState('')
  const [visitorEmail, setVisitorEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  if (isOwnPortfolio) {
    return (
      <section className="contact-form-section">
        <div className="contact-form-card card">
          <h2><Mail size={20} /> Get in Touch</h2>
          <p className="contact-form-disabled">
            This is your portfolio — visitors can reach you here. You can't message yourself.
          </p>
        </div>
      </section>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSending(true)
    try {
      await portfolioAPI.sendContactMessage(portfolioId, { visitorName, visitorEmail, message })
      setSent(true)
      setVisitorName('')
      setVisitorEmail('')
      setMessage('')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send your message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="contact-form-section">
      <div className="contact-form-card card">
        <h2><Mail size={20} /> Get in Touch</h2>

        {sent ? (
          <div className="contact-form-success">
            <CheckCircle2 size={20} />
            <span>Your message has been sent.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="error">{error}</div>}
            <div className="form-group">
              <label>Your Name</label>
              <input type="text" required value={visitorName} onChange={(e) => setVisitorName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Your Email</label>
              <input type="email" required value={visitorEmail} onChange={(e) => setVisitorEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea required rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={sending}>
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
