/**
 * Engraved celestial details. Drawn from real data, not decoration for its own sake:
 * the seal is an armillary sphere (horizon, meridian, equator and the ecliptic at 23.4°),
 * and the chart plots the main stars of Orion — the constellation of a human figure —
 * from their J2000 right ascension and declination.
 */

/** The Atlas seal: an armillary sphere in fine line. */
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

/** Orion, J2000 coordinates (RA in hours, Dec in degrees) and visual magnitude. */
const STARS = {
  betelgeuse: { ra: 5.9195, dec: 7.407, mag: 0.42, greek: 'α' },
  rigel: { ra: 5.2423, dec: -8.202, mag: 0.13, greek: 'β' },
  bellatrix: { ra: 5.4189, dec: 6.35, mag: 1.64, greek: 'γ' },
  mintaka: { ra: 5.5334, dec: -0.299, mag: 2.23, greek: 'δ' },
  alnilam: { ra: 5.6036, dec: -1.202, mag: 1.69, greek: 'ε' },
  alnitak: { ra: 5.6793, dec: -1.943, mag: 1.77, greek: 'ζ' },
  saiph: { ra: 5.7959, dec: -9.67, mag: 2.06, greek: 'κ' },
  meissa: { ra: 5.5856, dec: 9.934, mag: 3.39, greek: 'λ' },
} as const

type Star = keyof typeof STARS

const FIGURE: [Star, Star][] = [
  ['meissa', 'betelgeuse'],
  ['meissa', 'bellatrix'],
  ['betelgeuse', 'bellatrix'],
  ['betelgeuse', 'alnitak'],
  ['bellatrix', 'mintaka'],
  ['mintaka', 'alnilam'],
  ['alnilam', 'alnitak'],
  ['alnitak', 'saiph'],
  ['mintaka', 'rigel'],
]

// Chart window: RA 5h00m–6h10m, Dec −13° to +13°. East is to the left, as on a sky chart.
const RA0 = 5.0
const RA1 = 6.1667
const DEC0 = -13
const DEC1 = 13
const W = 140
const H = 180
const x = (ra: number) => ((RA1 - ra) / (RA1 - RA0)) * W
const y = (dec: number) => ((DEC1 - dec) / (DEC1 - DEC0)) * H
const radius = (mag: number) => Math.max(0.9, 3.1 - mag * 0.62)

/** A small engraved star chart of Orion with its RA/Dec graticule. */
export function OrionChart({ className }: { className?: string }) {
  const raLines = [5 + 1 / 3, 5 + 2 / 3, 6]
  const decLines = [-10, 0, 10]
  return (
    <svg className={className} width={W} height={H} viewBox={`-8 -8 ${W + 16} ${H + 16}`} fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth={0.5} opacity={0.55}>
        <rect x={0} y={0} width={W} height={H} />
        {raLines.map((ra) => (
          <line key={ra} x1={x(ra)} y1={0} x2={x(ra)} y2={H} strokeDasharray="1 3" />
        ))}
        {decLines.map((d) => (
          <line key={d} x1={0} y1={y(d)} x2={W} y2={y(d)} strokeDasharray={d === 0 ? undefined : '1 3'} />
        ))}
      </g>
      <g stroke="currentColor" strokeWidth={0.6} opacity={0.8}>
        {FIGURE.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={x(STARS[a].ra)} y1={y(STARS[a].dec)} x2={x(STARS[b].ra)} y2={y(STARS[b].dec)} />
        ))}
      </g>
      <g fill="currentColor">
        {Object.entries(STARS).map(([name, s]) => (
          <circle key={name} cx={x(s.ra)} cy={y(s.dec)} r={radius(s.mag)} />
        ))}
      </g>
      <g fill="currentColor" fontFamily="var(--serif)" fontStyle="italic" fontSize={8}>
        {(['betelgeuse', 'rigel', 'bellatrix', 'saiph'] as Star[]).map((k) => (
          <text key={k} x={x(STARS[k].ra) + 5} y={y(STARS[k].dec) - 3}>
            {STARS[k].greek}
          </text>
        ))}
      </g>
      <g fill="currentColor" fontFamily="var(--mono)" fontSize={6.5} letterSpacing="0.06em" opacity={0.85}>
        <text x={W} y={H + 7} textAnchor="end">
          ORION · J2000
        </text>
        <text x={1} y={y(0) - 2}>
          0°
        </text>
      </g>
    </svg>
  )
}
