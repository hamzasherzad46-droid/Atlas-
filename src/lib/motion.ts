/** True when the student has asked the system for less motion: animations become instant cuts. */
export function reducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/**
 * A motion token from global.css (`--fast`, `--mid`, `--slow`, `--ease`) for script-driven
 * animations, so their timings stay in the stylesheet with the rest.
 */
export function motion(name: '--fast' | '--mid' | '--slow' | '--count'): { duration: number; easing: string } {
  const css = getComputedStyle(document.documentElement)
  return { duration: parseFloat(css.getPropertyValue(name)) || 200, easing: css.getPropertyValue('--ease').trim() || 'ease-out' }
}
