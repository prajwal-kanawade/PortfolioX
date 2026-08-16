import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { aiAPI, portfolioAPI } from '../services/api'
import { Bot, Send, Sparkles, User } from 'lucide-react'
import './AiPortfolioBuilder.css'

const GREETING = "Hi! I'll help you build your portfolio in just a couple minutes. What's your name and professional title?"

export default function AiPortfolioBuilder() {
  const navigate = useNavigate()
  const { isPro } = useAuth()
  const [messages, setMessages] = useState([{ role: 'assistant', content: GREETING }])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [readyData, setReadyData] = useState(null)
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [usage, setUsage] = useState(null)
  const [suggestedTemplate, setSuggestedTemplate] = useState(null)
  const [autoCreating, setAutoCreating] = useState(false)
  const [showManualPicker, setShowManualPicker] = useState(false)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  const loadUsage = () => {
    aiAPI.getUsage().then(res => setUsage(res.data)).catch(() => {})
  }

  useEffect(() => {
    if (!isPro) return
    portfolioAPI.getTemplates().then(res => setTemplates(res.data)).catch(() => {})
    loadUsage()
  }, [isPro])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, readyData])

  // The input is disabled while waiting on a reply, which drops focus; restore it
  // once re-enabled so the user can keep typing without an extra click.
  useEffect(() => {
    if (!sending) inputRef.current?.focus()
  }, [sending])

  // As soon as the chat has gathered enough info, automatically figure out which
  // template fits the described profession and create the portfolio - no manual
  // template click required. Falls back to the manual picker if this fails.
  useEffect(() => {
    if (!readyData || showManualPicker) return

    let cancelled = false
    setAutoCreating(true)
    setError('')

    aiAPI.suggestTemplate(readyData)
      .then(res => {
        if (cancelled) return
        setSuggestedTemplate(res.data)
        return aiAPI.generatePortfolio(res.data.id, readyData)
      })
      .then(res => {
        if (cancelled || !res) return
        navigate(`/portfolio/${res.data.id}/edit`)
      })
      .catch(err => {
        if (cancelled) return
        setError(err.response?.data?.message || err.response?.data || 'Could not auto-create your portfolio. Please pick a template below.')
        setShowManualPicker(true)
        setAutoCreating(false)
      })

    return () => { cancelled = true }
  }, [readyData, showManualPicker])

  if (!isPro) {
    return (
      <div className="ai-builder-container">
        <div className="card ai-upsell">
          <div className="ai-upsell-icon"><Sparkles size={32} /></div>
          <h1>AI Portfolio Builder</h1>
          <p>Chat with an AI assistant and it'll build your whole portfolio for you — title, skills, experience, education, and projects. This feature is available on the Pro plan.</p>
          <button className="btn btn-primary" onClick={() => navigate('/upgrade?redirect=/ai-builder')}>Upgrade to Pro</button>
        </div>
      </div>
    )
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
      const res = await aiAPI.chat(nextMessages)
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

  const handleCreatePortfolio = async () => {
    if (!selectedTemplate) return alert('Please choose a template')
    setCreating(true)
    setError('')
    try {
      const res = await aiAPI.generatePortfolio(selectedTemplate, readyData)
      navigate(`/portfolio/${res.data.id}/edit`)
    } catch (err) {
      setError(err.response?.data || 'Failed to create the portfolio. Please try again.')
      setCreating(false)
    }
  }

  return (
    <div className="ai-builder-container">
      <div className="ai-builder-header">
        <h1><Sparkles size={22} /> AI Portfolio Builder</h1>
        <p>Answer a few questions and I'll put your portfolio together automatically.</p>
        {usage && (
          <small style={{ color: 'var(--text-secondary)' }}>
            {usage.limit - usage.used}/{usage.limit} AI credits remaining this month
          </small>
        )}
      </div>

      <div className="card ai-chat-card">
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

      {readyData && !showManualPicker && (
        <div className="card ai-review-card">
          <h2>{autoCreating ? 'Putting your portfolio together...' : 'One moment...'}</h2>
          <p className="ai-review-subtitle">
            {suggestedTemplate
              ? <>Building your <strong>{suggestedTemplate.name}</strong> portfolio based on what you told me.</>
              : "Figuring out which template fits your profession best..."}
          </p>
          {error && <div className="error">{error}</div>}
          <button
            type="button"
            className="btn btn-secondary"
            style={{ marginTop: '12px' }}
            onClick={() => setShowManualPicker(true)}
          >
            Not the right fit? Choose a different template
          </button>
        </div>
      )}

      {readyData && showManualPicker && (
        <div className="card ai-review-card">
          <h2>Choose a template to finish up</h2>
          <p className="ai-review-subtitle">Pick a template and I'll create your portfolio with it.</p>

          <div className="ai-template-grid">
            {templates.map(t => (
              <div
                key={t.id}
                className={`ai-template-card ${selectedTemplate === t.id ? 'selected' : ''}`}
                onClick={() => setSelectedTemplate(t.id)}
              >
                <h3>{t.name}</h3>
                <p>{t.description}</p>
              </div>
            ))}
          </div>

          <button className="btn btn-primary btn-full" onClick={handleCreatePortfolio} disabled={creating || !selectedTemplate}>
            {creating ? 'Creating your portfolio...' : 'Create My Portfolio'}
          </button>
        </div>
      )}
    </div>
  )
}
