import { useSiteSettings } from '../context/SiteSettingsContext'
import './Footer.css'

export default function Footer() {
  const { websiteName, footerText } = useSiteSettings()

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <span>&copy; {new Date().getFullYear()} {websiteName}</span>
        {footerText && <span className="site-footer-text">{footerText}</span>}
      </div>
    </footer>
  )
}
