import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { portfolioAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Zap, BarChart3, FileText, LayoutTemplate, PenLine, Palette, Rocket } from 'lucide-react'
import './Home.css'

const faqs = [
  {
    q: 'Why should I use PortfolioX instead of building from scratch?',
    a: 'PortfolioX provides pre-designed, professionally styled templates. Save dozens of hours on design.'
  },
  {
    q: 'Do I need coding experience?',
    a: 'Not at all! Our intuitive builder allows you to create and update without touching code.'
  },
  {
    q: 'Can I build a resume too, not just a portfolio?',
    a: 'Yes - use the Resume Builder to fill in your resume manually, or let AI draft it for you from a few quick questions (Pro), then download it as a PDF.'
  }
]

const steps = [
  { icon: LayoutTemplate, title: 'Pick a template', desc: 'Browse professionally designed templates for your field, or let AI pick one for you.' },
  { icon: PenLine, title: 'Add your content', desc: 'Fill in your projects, experience, and skills - or answer a few questions and let AI write it.' },
  { icon: Palette, title: 'Make it yours', desc: 'Tweak colors, layout, and sections until it actually looks like you.' },
  { icon: Rocket, title: 'Publish & share', desc: 'Go live on your own PortfolioX link in seconds, and share it anywhere.' }
]

const templates = [
  { code: '01_MED', name: 'Doctor', desc: 'Healthcare professionals' },
  { code: '02_VIS', name: 'Photographer', desc: 'Visual showcase' },
  { code: '03_ART', name: 'Graphic Designer', desc: 'Case-study focused' },
  { code: '04_ENG', name: 'Lawyer', desc: 'Legal counsel showcase' },
  { code: '05_DEV', name: 'Developer', desc: 'Full-stack showcase' },
  { code: '06_WRIT', name: 'Writer', desc: 'Content creator' }
]

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated, isPro } = useAuth()
  const [allTemplates, setAllTemplates] = useState([])
  const [openFaq, setOpenFaq] = useState(null)

  const handleGetStarted = () => navigate(isAuthenticated ? '/dashboard' : '/register')
  const handleUpgrade = () => navigate(isAuthenticated ? '/upgrade' : '/login?redirect=/upgrade')

  useEffect(() => {
    portfolioAPI.getTemplates().then(res => setAllTemplates(res.data)).catch(console.error)
  }, [])

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <h1>Build Your Professional Portfolio</h1>
        <p>Choose from professionally designed templates, or let our AI assistant build it for you in a chat. No coding required.</p>
        <div className="hero-buttons">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary">Get Started Free</Link>
              <Link to="/login" className="btn btn-secondary">Login</Link>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <h2>Why PortfolioX?</h2>
        <div className="features-grid">
          <div className="feature-card feature-card-clickable" onClick={() => navigate('/ai-builder')}>
            <Zap size={28} className="icon" />
            <h3>Instant Launch</h3>
            <p>Let our AI assistant build your portfolio for you in a chat.</p>
          </div>
          <div className="feature-card">
            <BarChart3 size={28} className="icon" />
            <h3>Live Analytics</h3>
            <p>See real-time views and performance data for every portfolio you publish.</p>
          </div>
          <div className="feature-card feature-card-clickable" onClick={() => navigate('/resume-builder')}>
            <FileText size={28} className="icon" />
            <h3>Resume Builder</h3>
            <p>Fill it in yourself, or let AI draft it for you.</p>
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className="templates">
        <h2>Portfolio Templates</h2>
        <div className="templates-grid">
          {templates.map(t => (
            <div key={t.code} className="template-card card">
              <h3>{t.name}</h3>
              <p>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="faq">
        <h2>Common Questions</h2>
        <div className="faq-list">
          {faqs.map((item, i) => (
            <div key={i} className="faq-item card" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="faq-question">
                <h3>{item.q}</h3>
                <span>{openFaq === i ? '−' : '+'}</span>
              </div>
              {openFaq === i && <p className="faq-answer">{item.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing">
        <h2>Simple Pricing</h2>
        <div className="pricing-grid">
          <div className="pricing-card card">
            <h3>Free</h3>
            <p className="price">₹0 <small>/forever</small></p>
            <ul>
              <li>✓ 1 Portfolio</li>
              <li>✓ Standard Templates</li>
              <li>✗ Custom Domain</li>
            </ul>
            <button className="btn btn-secondary" onClick={handleGetStarted}>Get Started</button>
          </div>
          <div className="pricing-card card featured">
            <h3>Pro {isPro && <span className="pricing-current-badge">Your Plan</span>}</h3>
            <p className="price">₹1500 <small>/month</small></p>
            <ul>
              <li>✓ Unlimited Portfolios</li>
              <li>✓ All Templates</li>
              <li>✓ Custom Domain</li>
              <li>✓ AI Portfolio Builder</li>
            </ul>
            {isPro ? (
              <button className="btn btn-secondary" disabled>✓ You're on Pro</button>
            ) : (
              <button className="btn btn-primary" onClick={handleUpgrade}>Upgrade</button>
            )}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="steps">
        <h2>Build Your Portfolio in Minutes</h2>
        <p className="steps-subtitle">No coding, no design headaches. Just four simple steps.</p>
        <div className="steps-grid">
          {steps.map((step, i) => (
            <div key={step.title} className="step-card">
              <div className="step-number">{i + 1}</div>
              <div className="step-icon"><step.icon size={24} /></div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Ready to showcase your work?</h2>
        <p>Join thousands of professionals building their online presence.</p>
        <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn btn-primary btn-lg">
          {isAuthenticated ? 'Go to Your Dashboard' : 'Start Building Now'}
        </Link>
      </section>
    </div>
  )
}
