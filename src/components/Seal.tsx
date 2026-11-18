/**
 * The Atlas seal: an armillary sphere (the ring, a meridian, and the ecliptic at 23.4°), drawn as on
 * the app icon (public/icons/icon.svg) but without its fine engraved scale, which only shows large.
 * It appears in one place in the app, the welcome screen.
 */
export function Seal({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.6" stroke="currentColor" strokeWidth="1.7" />
      <ellipse cx="12" cy="12" rx="3.1" ry="8.6" stroke="currentColor" strokeWidth="1.1" />
      <ellipse cx="12" cy="12" rx="8.6" ry="3.1" transform="rotate(-23.4 12 12)" style={{ stroke: 'var(--ink)' }} strokeWidth="1.3" />
      <circle cx="12" cy="12" r="1.5" style={{ fill: 'var(--ink)' }} />
    </svg>
  )
}
