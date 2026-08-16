import { useState } from 'react'
import './charts.css'

const SIZE = 180
const STROKE = 26
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Donut chart for a small (2-4 slot) categorical split. Two or more series
 * always ships a legend - color alone is never the only identity channel.
 * segments: [{ label, value, color }] - colors must be pre-validated
 * (see dataviz skill color-formula.md six checks) rather than picked ad hoc.
 */
export default function DonutChart({ segments }) {
  const [hoverIndex, setHoverIndex] = useState(null)

  const total = segments.reduce((sum, s) => sum + s.value, 0)
  if (total === 0) return <div className="chart-empty">No data yet</div>

  let offsetSoFar = 0

  return (
    <div className="chart-root chart-donut-root">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="chart-svg chart-donut-svg">
        <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--bg-secondary)" strokeWidth={STROKE} />
          {segments.map((s, i) => {
            const fraction = s.value / total
            const dash = fraction * CIRCUMFERENCE
            const gap = 2 // surface-color gap between segments
            const el = (
              <circle
                key={i}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={s.color}
                strokeWidth={STROKE}
                strokeDasharray={`${Math.max(0, dash - gap)} ${CIRCUMFERENCE - dash + gap}`}
                strokeDashoffset={-offsetSoFar}
                opacity={hoverIndex == null || hoverIndex === i ? 1 : 0.5}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                style={{ cursor: 'pointer', transition: 'opacity .15s ease' }}
              />
            )
            offsetSoFar += dash
            return el
          })}
        </g>
        <text x={SIZE / 2} y={SIZE / 2 - 4} textAnchor="middle" className="chart-donut-total">
          {hoverIndex != null ? segments[hoverIndex].value : total}
        </text>
        <text x={SIZE / 2} y={SIZE / 2 + 16} textAnchor="middle" className="chart-axis-label">
          {hoverIndex != null ? segments[hoverIndex].label : 'Total'}
        </text>
      </svg>

      <div className="chart-legend">
        {segments.map((s, i) => (
          <div
            key={i}
            className="chart-legend-item"
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <span className="chart-legend-swatch" style={{ background: s.color }} />
            <span>{s.label}</span>
            <span className="chart-legend-value">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
