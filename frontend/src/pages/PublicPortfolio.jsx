import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Heart, MessageCircle } from 'lucide-react'
import { portfolioAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { resolveTemplateComponent } from './templates'
import ContactForm from '../components/ContactForm'
import CommentsModal from '../components/CommentsModal'
import './PublicPortfolio.css'

export default function PublicPortfolio() {
  const { slug } = useParams()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showComments, setShowComments] = useState(false)
  const [highlightCommentId, setHighlightCommentId] = useState(null)

  useEffect(() => {
    portfolioAPI.getBySlug(slug).then(res => setPortfolio(res.data)).catch(() => null).finally(() => setLoading(false))
  }, [slug])

  // The owner can opt their profile out of search indexing (Settings > Privacy) - reflect that
  // on the actual public page via a robots meta tag, cleaned up on unmount/navigation.
  useEffect(() => {
    if (!portfolio || portfolio.searchEngineVisible) return

    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    return () => document.head.removeChild(meta)
  }, [portfolio])

  // A notification link (e.g. "/portfolio/slug#comment-id") should land directly on that
  // comment - open the modal automatically and scroll to it once comments are loaded.
  useEffect(() => {
    if (!portfolio || !location.hash?.startsWith('#comment-')) return
    setHighlightCommentId(location.hash.replace('#comment-', ''))
    setShowComments(true)
  }, [portfolio, location.hash])

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    const wasLiked = portfolio.isLikedByMe
    setPortfolio(p => ({ ...p, isLikedByMe: !wasLiked, likeCount: (p.likeCount || 0) + (wasLiked ? -1 : 1) }))
    try {
      const res = await portfolioAPI.like(portfolio.id)
      setPortfolio(p => ({ ...p, isLikedByMe: res.data.liked, likeCount: res.data.likeCount }))
    } catch {
      setPortfolio(p => ({ ...p, isLikedByMe: wasLiked, likeCount: (p.likeCount || 0) + (wasLiked ? 1 : -1) }))
    }
  }

  if (loading) return <div className="loading"><div className="spinner"></div></div>
  if (!portfolio) return <div className="error" style={{ marginTop: '40px' }}>Portfolio not found</div>

  const TemplateComponent = resolveTemplateComponent(portfolio.template?.code)
  return (
    <>
      <TemplateComponent portfolio={portfolio} />
      <ContactForm portfolioId={portfolio.id} isOwnPortfolio={!!user && user.id === portfolio.userId} />

      <div className="public-portfolio-social-bar">
        <button
          type="button"
          className={`public-portfolio-social-btn ${portfolio.isLikedByMe ? 'liked' : ''}`}
          onClick={handleToggleLike}
          aria-label={portfolio.isLikedByMe ? 'Unlike this portfolio' : 'Like this portfolio'}
        >
          <Heart size={18} fill={portfolio.isLikedByMe ? 'currentColor' : 'none'} /> {portfolio.likeCount || 0}
        </button>
        <button
          type="button"
          className="public-portfolio-social-btn"
          onClick={() => setShowComments(true)}
          aria-label="View comments"
        >
          <MessageCircle size={18} /> Comments
        </button>
      </div>

      {showComments && (
        <CommentsModal
          portfolio={portfolio}
          highlightCommentId={highlightCommentId}
          onClose={() => { setShowComments(false); setHighlightCommentId(null) }}
        />
      )}
    </>
  )
}
