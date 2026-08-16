import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { aiAPI, resumeAPI } from '../services/api'
import { Bot, FileText, PenLine, Send, Sparkles, Trash2, User } from 'lucide-react'
import './ResumeBuilder.css'

const GREETING = "Hi! Let's build your resume. What's your full name and the job title/role you're targeting?"

export default function ResumeBuilder() {
  const navigate = useNavigate()
  const { isPro, user } = useAuth()
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [aiMode, setAiMode] = useState(false)

  // AI chat state
  const [messages, setMessages] = useState([{ role: 'assistant', content: GREETING }])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [readyData, setReadyData] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [usage, setUsage] = useState(null)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  const loadUsage = () => {
    aiAPI.getUsage().then(res => setUsage(res.data)).catch(() => {})
  }

  useEffect(() => {
    resumeAPI.getMyResumes()
      .then(res => setResumes(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
    if (isPro) loadUsage()
  }, [isPro])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, readyData])

  useEffect(() => {
    if (!sending && aiMode) inputRef.current?.focus()
  }, [sending, aiMode])

  const handleStartManual = async () => {
    setCreating(true)
    try {
      const title = user?.firstName ? `${user.firstName}'s Resume` : 'My Resume'
      const res = await resumeAPI.create({ title })
      navigate(`/resume/${res.data.id}/edit`)
    } catch (err) {
      alert('Failed to create resume')
      setCreating(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this resume?')) return
    try {
      await resumeAPI.delete(id)
      setResumes(resumes.filter(r => r.id !== id))
    } catch (err) {
      alert('Failed to delete resume')
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    const nextMessages = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setInput('')
    setSending(true)
    setError('')

    try {
      const res = await aiAPI.resumeChat(nextMessages)
      setMessages([...nextMessages, { role: 'assistant', content: res.data.reply }])
      if (res.data.readyToGenerate && res.data.data) {
        setReadyData(res.data.data)
      }
      loadUsage()
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Something went wrong talking to the AI. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')
    try {
      const res = await aiAPI.generateResume(readyData)
      navigate(`/resume/${res.data.id}/edit`)
    } catch (err) {
      setError(err.response?.data || 'Failed to create the resume. Please try again.')
      setGenerating(false)
    }
  }

  return (
    <div className="resume-builder-container">
      <div className="resume-builder-header animate-in">
        <h1><FileText size={22} /> Resume Builder</h1>
        <p>Fill it in yourself, or let AI draft it for you from a few quick questions.</p>
      </div>

      {!aiMode && (
        <div className="rb-entry-grid">
          <div className="card rb-entry-card animate-in" style={{ animationDelay: '80ms' }} onClick={handleStartManual}>
            <div className="rb-entry-icon"><PenLine size={26} /></div>
            <h3>Fill in Manually</h3>
            <p>Add your contact info, summary, experience, education, and skills yourself.</p>
            {creating && <span className="rb-entry-loading">Creating...</span>}
          </div>

          <div
            className={`card rb-entry-card animate-in ${!isPro ? 'rb-entry-locked' : ''}`}
            style={{ animationDelay: '140ms' }}
            onClick={() => isPro ? setAiMode(true) : navigate('/upgrade?redirect=/resume-builder')}
          >
            <div className="rb-entry-icon"><Sparkles size={26} /></div>
            <h3>Build with AI</h3>
            <p>{isPro ? 'Answer a few questions and AI drafts the whole resume for you.' : 'Available on the Pro plan.'}</p>
            {!isPro && <span className="rb-entry-badge">Upgrade to Pro</span>}
          </div>
        </div>
      )}

      {aiMode && (
        <div className="rb-step-indicator animate-in">
          <span className="rb-step done"><span className="rb-step-dot" /> Step 1: Choose a method</span>
          <span className="rb-step active"><span className="rb-step-dot" /> Step 2: Answer a few questions</span>
        </div>
      )}

      {aiMode && (
        <div className="card ai-chat-card animate-in">
          {usage && (
            <small style={{ display: 'block', padding: '12px 20px 0', color: 'var(--text-secondary)' }}>
              {usage.limit - usage.used}/{usage.limit} AI credits remaining this month
            </small>
          )}
          <div className="ai-chat-messages" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`ai-message ai-message-${m.role}`}>
                <div className="ai-message-icon">{m.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}</div>
                <div className="ai-message-bubble">{m.content}</div>
              </div>
            ))}
            {sending && (
              <div className="ai-message ai-message-assistant">
                <div className="ai-message-icon"><Bot size={16} /></div>
                <div className="ai-message-bubble ai-message-typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>

          {error && <div className="error" style={{ margin: '0 20px 12px' }}>{error}</div>}

          <form className="ai-chat-input" onSubmit={handleSend}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your answer..."
              disabled={sending}
            />
            <button type="submit" className="btn btn-primary" disabled={sending || !input.trim()}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {readyData && (
        <div className="card rb-review-card animate-in">
          <h2>Your resume is ready</h2>
          <p className="ai-review-subtitle">I've drafted your resume from our conversation. Create it to review and fine-tune the details.</p>
          <button className="btn btn-primary btn-full" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Creating your resume...' : 'Create My Resume'}
          </button>
        </div>
      )}

      {!loading && resumes.length > 0 && (
        <div className="rb-existing">
          <h2>Your Resumes</h2>
          <div className="grid">
            {resumes.map((r, i) => (
              <div key={r.id} className="card rb-resume-card animate-in" style={{ animationDelay: `${i * 50}ms` }}>
                <h3>{r.title}</h3>
                {r.fullName && <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{r.fullName}</p>}
                <div className="rb-resume-actions">
                  <Link to={`/resume/${r.id}/edit`} className="btn btn-secondary" style={{ flex: 1 }}>Edit</Link>
                  <button className="btn btn-secondary" onClick={() => handleDelete(r.id)} title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
