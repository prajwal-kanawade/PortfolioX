import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, Heart, ChevronDown, ChevronUp } from 'lucide-react'
import { commentsAPI, resolveAssetUrl } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Modal.css'
import './CommentsModal.css'

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return new Date(dateStr).toLocaleDateString()
}

function toggleLikeInTree(comments, commentId) {
  return comments.map(c => {
    if (c.id === commentId) {
      return { ...c, isLikedByMe: !c.isLikedByMe, likeCount: c.likeCount + (c.isLikedByMe ? -1 : 1) }
    }
    if (c.replies?.length) {
      return { ...c, replies: toggleLikeInTree(c.replies, commentId) }
    }
    return c
  })
}

function CommentRow({ comment, isReply, onLike, onReplyClick, onClose, id }) {
  return (
    <div id={id} className={`comment-row ${isReply ? 'reply' : ''}`}>
      <span className="comment-avatar">
        {comment.avatarUrl ? (
          <img src={resolveAssetUrl(comment.avatarUrl)} alt={comment.username} />
        ) : (
          <span>{comment.username?.[0]?.toUpperCase() || '?'}</span>
        )}
      </span>
      <div className="comment-body">
        <div className="comment-header">
          <Link to={`/user/${comment.userId}`} className="comment-author" onClick={onClose}>@{comment.username}</Link>
          <span className="comment-time">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="comment-content">{comment.content}</p>
        <div className="comment-actions">
          <button type="button" className={`comment-like-btn ${comment.isLikedByMe ? 'liked' : ''}`} onClick={onLike}>
            <Heart size={13} fill={comment.isLikedByMe ? 'currentColor' : 'none'} /> {comment.likeCount || 0}
          </button>
          {!isReply && onReplyClick && (
            <button type="button" className="comment-reply-btn" onClick={onReplyClick}>Reply</button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CommentsModal({ portfolio, onClose, highlightCommentId }) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)
  const [expandedReplies, setExpandedReplies] = useState(() => new Set())

  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => {
      const next = new Set(prev)
      if (next.has(commentId)) next.delete(commentId)
      else next.add(commentId)
      return next
    })
  }

  const load = () => {
    setLoading(true)
    commentsAPI.getForPortfolio(portfolio.id)
      .then(res => setComments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [portfolio.id])

  useEffect(() => {
    if (!highlightCommentId || loading) return

    // Replies are collapsed by default - if the highlighted id belongs to one, expand its
    // parent first and wait for that re-render before trying to scroll to it.
    const parent = comments.find(c => c.replies?.some(r => r.id === highlightCommentId))
    if (parent && !expandedReplies.has(parent.id)) {
      setExpandedReplies(prev => new Set(prev).add(parent.id))
      return
    }

    const el = document.getElementById(`comment-${highlightCommentId}`)
    if (el) el.scrollIntoView({ block: 'center' })
  }, [highlightCommentId, loading, comments, expandedReplies])

  const handlePostComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    if (!isAuthenticated) { navigate('/login'); return }
    setPosting(true)
    try {
      await commentsAPI.addComment(portfolio.id, newComment.trim())
      setNewComment('')
      load()
    } catch {
      alert('Could not post comment.')
    } finally {
      setPosting(false)
    }
  }

  const handlePostReply = async (commentId) => {
    if (!replyText.trim()) return
    setReplying(true)
    try {
      await commentsAPI.addReply(commentId, replyText.trim())
      setReplyText('')
      setReplyingTo(null)
      load()
    } catch {
      alert('Could not post reply.')
    } finally {
      setReplying(false)
    }
  }

  const handleLikeComment = async (commentId) => {
    if (!isAuthenticated) { navigate('/login'); return }
    setComments(prev => toggleLikeInTree(prev, commentId))
    try {
      await commentsAPI.likeComment(commentId)
    } catch {
      load()
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box comments-modal-box animate-in" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        <div className="modal-title">Comments on {portfolio.title}</div>

        {isAuthenticated ? (
          <form className="comments-compose" onSubmit={handlePostComment}>
            <textarea rows={2} placeholder="Write a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
            <button type="submit" className="btn btn-primary" disabled={posting || !newComment.trim()}>
              {posting ? 'Posting...' : 'Post'}
            </button>
          </form>
        ) : (
          <p className="comments-login-prompt">
            <Link to="/login">Log in</Link> to leave a comment.
          </p>
        )}

        <div className="comments-list">
          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : comments.length === 0 ? (
            <p className="comments-empty">No comments yet. Be the first!</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className={`comment-item ${highlightCommentId === c.id ? 'highlighted' : ''}`} id={`comment-${c.id}`}>
                <CommentRow
                  comment={c}
                  onLike={() => handleLikeComment(c.id)}
                  onReplyClick={() => { setReplyingTo(replyingTo === c.id ? null : c.id); setReplyText('') }}
                  onClose={onClose}
                />

                {replyingTo === c.id && (
                  <div className="comment-reply-compose">
                    <textarea rows={2} placeholder={`Reply to @${c.username}...`} value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" className="btn btn-primary" onClick={() => handlePostReply(c.id)} disabled={replying || !replyText.trim()}>
                        {replying ? 'Posting...' : 'Reply'}
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => setReplyingTo(null)}>Cancel</button>
                    </div>
                  </div>
                )}

                {c.replies?.length > 0 && (
                  <button
                    type="button"
                    className="comment-toggle-replies-btn"
                    onClick={() => toggleReplies(c.id)}
                  >
                    {expandedReplies.has(c.id) ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    {expandedReplies.has(c.id)
                      ? 'Hide replies'
                      : `Show ${c.replies.length} ${c.replies.length === 1 ? 'reply' : 'replies'}`}
                  </button>
                )}

                {c.replies?.length > 0 && expandedReplies.has(c.id) && (
                  <div className="comment-replies">
                    {c.replies.map(r => (
                      <CommentRow
                        key={r.id}
                        id={`comment-${r.id}`}
                        comment={r}
                        isReply
                        onLike={() => handleLikeComment(r.id)}
                        onClose={onClose}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
