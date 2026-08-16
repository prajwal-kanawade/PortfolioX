import { useState } from 'react'
import './charts.css'

const WIDTH = 600
const HEIGHT = 220
const PAD = { top: 16, right: 16, bottom: 28, left: 36 }

/**
 * Single-series line/area chart. One series needs no legend - the chart's
 * title already says what's plotted (dataviz skill: marks-and-anatomy.md).
 */
export default function LineChart({ data, valueKey = 'count', labelKey = 'date', color = 'var(--accent)' }) {
  const [hoverIndex, setHoverIndex] = useState(null)

  if (!data || data.length === 0) return <div className="chart-empty">No data yet</div>

  const innerW = WIDTH - PAD.left - PAD.right
  const innerH = HEIGHT - PAD.top - PAD.bottom
  const maxVal = Math.max(1, ...data.map(d => d[valueKey]))

  const x = (i) => PAD.left + (i / Math.max(1, data.length - 1)) * innerW
  const y = (v) => PAD.top + innerH - (v / maxVal) * innerH

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d[valueKey])}`).join(' ')
  const areaPath = `${linePath} L ${x(data.length - 1)} ${PAD.top + innerH} L ${x(0)} ${PAD.top + innerH} Z`

  // 4 horizontal gridlines (0, 1/3, 2/3, max) - recessive, hairline
  const gridSteps = [0, maxVal / 3, (maxVal * 2) / 3, maxVal]

  // Sparse x labels: first, middle, last only
  const labelIndices = data.length > 1 ? [0, Math.floor((data.length - 1) / 2), data.length - 1] : [0]

  const hovered = hoverIndex != null ? data[hoverIndex] : null

  return (
    <div className="chart-root">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="chart-svg">
        {gridSteps.map((g, i) => (
          <line key={i} x1={PAD.left} x2={WIDTH - PAD.right} y1={y(g)} y2={y(g)} className="chart-gridline" />
        ))}

        <path d={areaPath} fill={color} opacity="0.1" stroke="none" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {hoverIndex != null && (
          <>
            <line x1={x(hoverIndex)} x2={x(hoverIndex)} y1={PAD.top} y2={PAD.top + innerH} className="chart-crosshair" />
            <circle cx={x(hoverIndex)} cy={y(hovered[valueKey])} r="5" fill={color} stroke="var(--bg-card)" strokeWidth="2" />
          </>
        )}

        {/* Invisible hover targets, one per point */}
        {data.map((d, i) => (
          <rect
            key={i}
            x={x(i) - innerW / data.length / 2}
            y={PAD.top}
            width={innerW / data.length}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          />
        ))}

        {labelIndices.map(i => (
          <text key={i} x={x(i)} y={HEIGHT - 8} className="chart-axis-label" textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'}>
            {new Date(data[i][labelKey]).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </text>
        ))}
      </svg>

      {hovered && (
        <div className="chart-tooltip" style={{ left: `${(x(hoverIndex) / WIDTH) * 100}%` }}>
          <strong>{hovered[valueKey]}</strong> on {new Date(hovered[labelKey]).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </div>
      )}
    </div>
  )
}
