import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import './PasswordInput.css'

export default function PasswordInput({ value, onChange, ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="password-field">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        {...props}
      />
      <button
        type="button"
        className="password-toggle-btn"
        onClick={() => setVisible(v => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}
