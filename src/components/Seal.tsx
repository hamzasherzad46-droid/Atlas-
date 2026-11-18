/**
 * The Atlas seal: an armillary sphere in fine line (horizon, meridian, equator and the ecliptic at
 * 23.4°). It appears in one place in the app, the welcome screen, and on the app icon.
 */
export function Seal({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={0.9} aria-hidden>
      <circle cx="12" cy="12" r="10.5" />
      <ellipse cx="12" cy="12" rx="10.5" ry="3.6" />
      <ellipse cx="12" cy="12" rx="3.6" ry="10.5" />
      <ellipse cx="12" cy="12" rx="10.5" ry="3.6" transform="rotate(-23.4 12 12)" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}
