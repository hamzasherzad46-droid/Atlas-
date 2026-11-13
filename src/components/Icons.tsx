import type { SVGProps } from 'react'

/** Line icons: outline when idle, filled when selected. */
const svg = (size: number, extra?: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  ...extra,
})

type TabIconProps = { active?: boolean }

export const TodayIcon = ({ active }: TabIconProps) => (
  <svg {...svg(26)}>
    <path d="M3.5 10.6 12 3.8l8.5 6.8V19a1.8 1.8 0 0 1-1.8 1.8H15v-5.6H9v5.6H5.3A1.8 1.8 0 0 1 3.5 19z" fill={active ? 'currentColor' : 'none'} />
  </svg>
)

export const AtlasIcon = ({ active }: TabIconProps) => (
  <svg {...svg(26)}>
    {[
      [3.5, 3.5],
      [13, 3.5],
      [3.5, 13],
      [13, 13],
    ].map(([x, y]) => (
      <rect key={`${x}${y}`} x={x} y={y} width="7.5" height="7.5" rx="2.2" fill={active ? 'currentColor' : 'none'} />
    ))}
  </svg>
)

export const PracticeIcon = ({ active }: TabIconProps) => (
  <svg {...svg(26)}>
    <rect x="2.5" y="6" width="19" height="12.5" rx="3" fill={active ? 'currentColor' : 'none'} />
    <path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M8 14.5h8" stroke={active ? 'var(--bg)' : 'currentColor'} strokeWidth={2} />
  </svg>
)

export const ProgressIcon = ({ active }: TabIconProps) => (
  <svg {...svg(26)}>
    {[
      [4, 12, 8],
      [10, 7, 13],
      [16, 3.5, 16.5],
    ].map(([x, y, h]) => (
      <rect key={x} x={x} y={y} width="4" height={h} rx="1.6" fill={active ? 'currentColor' : 'none'} />
    ))}
  </svg>
)

export const YouIcon = ({ active }: TabIconProps) => (
  <svg {...svg(26)}>
    <circle cx="12" cy="12" r="9.5" fill={active ? 'currentColor' : 'none'} />
    <circle cx="12" cy="10" r="3.2" fill={active ? 'var(--bg)' : 'none'} stroke={active ? 'var(--bg)' : 'currentColor'} />
    <path d="M6.4 18.4c1.3-2.2 3.3-3.3 5.6-3.3s4.3 1.1 5.6 3.3" stroke={active ? 'var(--bg)' : 'currentColor'} />
  </svg>
)

export const ArrowIcon = ({ size = 22 }: { size?: number }) => (
  <svg {...svg(size, { strokeWidth: 2.2, className: 'flip-rtl' })}>
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </svg>
)

export const ChevronIcon = ({ size = 14 }: { size?: number }) => (
  <svg {...svg(size, { strokeWidth: 2.6, className: 'chev' })}>
    <path d="m9 5 7 7-7 7" />
  </svg>
)

export const BackIcon = () => (
  <svg {...svg(22, { strokeWidth: 2.6, className: 'flip-rtl' })}>
    <path d="m15 5-7 7 7 7" />
  </svg>
)

export const CloseIcon = ({ size = 18 }: { size?: number }) => (
  <svg {...svg(size, { strokeWidth: 2.6 })}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const CheckIcon = ({ size = 16 }: { size?: number }) => (
  <svg {...svg(size, { strokeWidth: 3 })}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)

export const CardsIcon = ({ size = 18 }: { size?: number }) => (
  <svg {...svg(size, { strokeWidth: 2 })}>
    <rect x="7" y="3.5" width="13" height="16" rx="3" />
    <path d="M4 7.5v10.5a3 3 0 0 0 3 3h8.5" />
  </svg>
)

export const ClockIcon = ({ size = 18 }: { size?: number }) => (
  <svg {...svg(size, { strokeWidth: 2 })}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2.6 1.8M9.5 2.5h5" />
  </svg>
)

export const CubeIcon = ({ size = 18 }: { size?: number }) => (
  <svg {...svg(size, { strokeWidth: 2 })}>
    <path d="M12 2.8 20 7.3v9.4l-8 4.5-8-4.5V7.3z" />
    <path d="M4 7.3 12 12l8-4.7M12 12v9.2" />
  </svg>
)

export const RedoIcon = ({ size = 18 }: { size?: number }) => (
  <svg {...svg(size, { strokeWidth: 2.2 })}>
    <path d="M19.5 12a7.5 7.5 0 1 1-2.3-5.4" />
    <path d="M19.5 3.8v4.6h-4.6" />
  </svg>
)

export const KeyboardIcon = ({ size = 18 }: { size?: number }) => (
  <svg {...svg(size, { strokeWidth: 2 })}>
    <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
    <path d="M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M8 14h8" />
  </svg>
)
