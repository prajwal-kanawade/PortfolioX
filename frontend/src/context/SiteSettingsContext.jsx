import React, { createContext, useEffect, useState } from 'react'
import { siteAPI } from '../services/api'
import { resolveLogoVariant } from '../components/logos/logoVariants'

export const SiteSettingsContext = createContext()

const DEFAULTS = {
  websiteName: 'PortFolioX',
  footerText: null,
  maintenanceMode: false,
  activeLogoKey: 'classic',
  enableLikes: true,
  enableComments: true,
  enableFollowSystem: true,
}

function buildFaviconDataUri(letter, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">` +
    `<rect width="64" height="64" rx="14" fill="${color}"/>` +
    `<text x="32" y="43" font-family="Arial, sans-serif" font-size="32" font-weight="700" fill="#ffffff" text-anchor="middle">${letter}</text>` +
    `</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULTS)
  const [loaded, setLoaded] = useState(false)

  const refresh = () => {
    siteAPI.getPublicSettings()
      .then((res) => setSettings(res.data))
      .catch(() => {})
      .finally(() => setLoaded(true))
  }

  useEffect(() => {
    refresh()
  }, [])

  useEffect(() => {
    // Browser tab title is fixed branding, independent of the admin-editable site name
    // shown in the navbar - the two are allowed to diverge.
    document.title = 'PortFolioX'

    const favicon = document.getElementById('favicon')
    if (favicon) {
      const { swatch } = resolveLogoVariant(settings.activeLogoKey)
      const letter = (settings.websiteName?.[0] || 'P').toUpperCase()
      favicon.href = buildFaviconDataUri(letter, swatch)
    }
  }, [settings.websiteName, settings.activeLogoKey])

  return (
    <SiteSettingsContext.Provider value={{ ...settings, loaded, refresh }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export const useSiteSettings = () => {
  const context = React.useContext(SiteSettingsContext)
  if (!context) {
    throw new Error('useSiteSettings must be used within SiteSettingsProvider')
  }
  return context
}
