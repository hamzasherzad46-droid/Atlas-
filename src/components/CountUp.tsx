import { useEffect, useState } from 'react'
import { motion, reducedMotion } from '../lib/motion'

/**
 * A number that counts up to its value when it first appears or changes (about a quarter of a
 * second, easing out), or simply shows it when the system asks for less motion. Screen readers get
 * the final value only.
 */
export function CountUp({ value, format = String }: { value: number; format?: (v: number) => string }) {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    let raf = 0
    if (reducedMotion() || !Number.isFinite(value) || value === 0) {
      raf = requestAnimationFrame(() => setShown(value))
      return () => cancelAnimationFrame(raf)
    }
    const { duration } = motion('--count')
    const start = performance.now()
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - k) ** 3
      setShown(Math.round(value * eased))
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return (
    <>
      <span aria-hidden>{format(shown)}</span>
      <span className="sr-only">{format(value)}</span>
    </>
  )
}
