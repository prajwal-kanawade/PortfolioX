import { useState } from 'react'
import './charts.css'

const WIDTH = 600
const BAR_HEIGHT = 20
const BAR_GAP = 14
const PAD = { top: 8, right: 48, bottom: 8, left: 120 }

/**
 * Horizontal bar chart, single series (nominal categorical - product/template
 * names). Per the color formula, a single series takes one consistent hue,
 * never a different color per bar - that would spend the identity channel
 * re-encoding what bar length already shows.
 */
export default function BarChart({ data, valueKey = 'count', labelKey = 'name', color = 'var(--accent)' }) {
  const [hoverIndex, setHoverIndex] = useState(null)

  if (!data || data.length === 0) return <div className="chart-empty">No data yet</div>

  const height = PAD.top + PAD.bottom + data.length * (BAR_HEIGHT + BAR_GAP) - BAR_GAP
  const innerW = WIDTH - PAD.left - PAD.right
  const maxVal = Math.max(1, ...data.map(d => d[valueKey]))

  return (
    <div className="chart-root">
      <svg viewBox={`0 0 ${WIDTH} ${height}`} className="chart-svg" style={{ height }}>
        {data.map((d, i) => {
          const barW = Math.max(2, (d[valueKey] / maxVal) * innerW)
          const barY = PAD.top + i * (BAR_HEIGHT + BAR_GAP)
          const isHovered = hoverIndex === i

          return (
            <g key={i} onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)}>
              <text x={PAD.left - 10} y={barY + BAR_HEIGHT / 2 + 4} textAnchor="end" className="chart-axis-label">
                {d[labelKey]}
              </text>
              <rect x={PAD.left} y={barY} width={innerW} height={BAR_HEIGHT} rx="4" className="chart-bar-track" />
              <rect
                x={PAD.left}
                y={barY}
                width={barW}
                height={BAR_HEIGHT}
                rx="4"
                fill={color}
                opacity={isHovered ? 1 : 0.85}
              />
              <text x={PAD.left + barW + 8} y={barY + BAR_HEIGHT / 2 + 4} className="chart-value-label">
                {d[valueKey]}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
