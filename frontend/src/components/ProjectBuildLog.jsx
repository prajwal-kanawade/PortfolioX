import { useState } from 'react'
import { FileText } from 'lucide-react'
import './ProjectBuildLog.css'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

/**
 * Compact "build in public" log for a project - a short dated timeline of progress notes,
 * shown both in the editor (with the add form) and on public template pages (read-only).
 */
export default function ProjectBuildLog({ entries = [], editable = false, onAdd }) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleAdd = async () => {
    if (!content.trim() || !onAdd) return
    setSubmitting(true)
    try {
      await onAdd(content.trim())
      setContent('')
    } finally {
      setSubmitting(false)
    }
  }

  if (!editable && entries.length === 0) return null

  return (
    <div className="build-log">
      {entries.length > 0 && (
        <div className="build-log-header">
          <FileText size={14} /> <span>Build Log</span>
        </div>
      )}

      {entries.length > 0 && (
        <ul className="build-log-list">
          {entries.map(entry => (
            <li key={entry.id} className="build-log-entry">
              <span className="build-log-date">{formatDate(entry.createdAt)}</span>
              <span className="build-log-content">{entry.content}</span>
            </li>
          ))}
        </ul>
      )}

      {editable && (
        <div className="build-log-add">
          <textarea
            rows="2"
            placeholder="Add a build log entry - what did you work on?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button type="button" className="btn btn-secondary" onClick={handleAdd} disabled={!content.trim() || submitting}>
            {submitting ? 'Adding...' : 'Add Log Entry'}
          </button>
        </div>
      )}
    </div>
  )
}
