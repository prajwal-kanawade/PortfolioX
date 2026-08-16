import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { aiAPI } from '../services/api'
import { suggest } from '../utils/suggestions'
import './SuggestButton.css'

/**
 * Free users: instant canned suggestion (unchanged behavior, no API call).
 * Pro users: calls the AI suggest endpoint and shows a few real options to pick from.
 */
export default function SuggestButton({ category, field, context, onSelect, style, alignSelf }) {
  const { isPro } = useAuth()
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState(null)
  const [error, setError] = useState('')

  const handleClick = async () => {
    if (!isPro) {
      onSelect(suggest(category, field))
      return
    }

    setError('')
    setOptions(null)
    setLoading(true)
    try {
      const res = await aiAPI.suggest(category, field, context)
      setOptions(res.data.suggestions || [])
    } catch (err) {
      setError('Could not get suggestions')
    } finally {
      setLoading(false)
    }
  }

  const handlePick = (option) => {
    onSelect(option)
    setOptions(null)
  }

  return (
    <div className="suggest-button-wrap" style={{ alignSelf, ...style }}>
      <button type="button" className="btn btn-secondary" onClick={handleClick} disabled={loading}>
        <Sparkles size={16} /> {loading ? 'Thinking...' : 'Suggest'}
      </button>

      {options && options.length > 0 && (
        <div className="suggest-dropdown">
          {options.map((opt, i) => (
            <button key={i} type="button" className="suggest-option" onClick={() => handlePick(opt)}>
              {opt}
            </button>
          ))}
          <button type="button" className="suggest-dismiss" onClick={() => setOptions(null)}>Dismiss</button>
        </div>
      )}

      {error && <div className="suggest-error">{error}</div>}
    </div>
  )
}
