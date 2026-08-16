import { resolveLogoVariant } from './logoVariants'

export default function Logo({ variant = 'classic', siteName = 'PortfolioX' }) {
  const { icon: Icon, color, weight } = resolveLogoVariant(variant)
  const colorValue = color === 'accent' ? 'var(--accent)' : 'var(--text-primary)'

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: colorValue, fontWeight: weight }}>
      <Icon size={22} strokeWidth={2.25} />
      <span>{siteName}</span>
    </span>
  )
}
