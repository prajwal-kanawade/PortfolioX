import { useEffect, useRef, useState } from 'react'

const EASE_OUT = (t) => 1 - Math.pow(1 - t, 3)

/**
 * Animates a number from 0 up to targetValue once on mount (and whenever
 * targetValue changes), respecting prefers-reduced-motion.
 */
export function useCountUp(targetValue, durationMs = 600) {
  const target = Number(targetValue) || 0
  const [value, setValue] = useState(0)
  const frameRef = useRef(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setValue(target)
      return
    }

    const start = performance.now()
    const from = 0

    const tick = (now) => {
      const elapsed = now - start
      const progress = Math.min(1, elapsed / durationMs)
      setValue(Math.round(from + (target - from) * EASE_OUT(progress)))
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs])

  return value
}
