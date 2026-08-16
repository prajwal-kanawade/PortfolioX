import { Link } from 'react-router-dom'
import { Wrench } from 'lucide-react'
import { useSiteSettings } from '../context/SiteSettingsContext'

export default function MaintenanceScreen() {
  const { websiteName } = useSiteSettings()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', gap: '16px' }}>
      <Wrench size={40} style={{ color: 'var(--accent)' }} />
      <h1>{websiteName} is down for maintenance</h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '420px' }}>
        We're making some improvements and will be back shortly. Thanks for your patience.
      </p>
      <Link to="/login" className="btn btn-secondary">Admin login</Link>
    </div>
  )
}
