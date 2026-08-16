import { Sparkles, Zap, Globe, Layers, LayoutGrid } from 'lucide-react'

// Simple in-code logo variants (icon + color role) rather than external design assets - see
// components/logos/Logo.jsx for how these render, and context/SiteSettingsContext.jsx for how
// the matching favicon color is generated from the same `swatch`.
export const LOGO_VARIANTS = {
  classic: { icon: Sparkles, color: 'accent', weight: 700, swatch: '#4F6FE0' },
  bolt: { icon: Zap, color: 'accent', weight: 800, swatch: '#B8720B' },
  orbit: { icon: Globe, color: 'accent', weight: 600, swatch: '#0D9488' },
  mono: { icon: Layers, color: 'text-primary', weight: 700, swatch: '#5B6272' },
  stack: { icon: LayoutGrid, color: 'accent', weight: 700, swatch: '#C2417A' },
}

export const LOGO_KEYS = Object.keys(LOGO_VARIANTS)

export function resolveLogoVariant(key) {
  return LOGO_VARIANTS[key] || LOGO_VARIANTS.classic
}
