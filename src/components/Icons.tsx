import type { SVGProps } from 'react'

/**
 * Atlas has one icon style: a fine engraved line, 1.5 at 24 px, round ends and joins, on a 24 px grid.
 * Short parallel hatching, as on an engraved plate, marks a filled or "on" state. Everything else in
 * the interface is set in type.
 */
const svg = (size: number, extra?: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  ...extra,
})

/** Marks something that opens: list rows and primary actions. Mirrored in right-to-left languages. */
export const ChevronIcon = ({ size = 16 }: { size?: number }) => (
  <svg {...svg(size, { className: 'chev flip-rtl' })}>
    <path d="m9 5.5 6.5 6.5L9 18.5" />
  </svg>
)

/** A section that folds open: the chevron turns to point down while it is open. */
export const DisclosureIcon = ({ open, size = 16 }: { open: boolean; size?: number }) => (
  <svg {...svg(size, { className: `disclosure${open ? ' open' : ''}` })}>
    <path d="m9 5.5 6.5 6.5L9 18.5" />
  </svg>
)

export const BackIcon = ({ size = 16 }: { size?: number }) => (
  <svg {...svg(size, { className: 'flip-rtl' })}>
    <path d="M15 5.5 8.5 12l6.5 6.5" />
  </svg>
)

export const CloseIcon = ({ size = 16 }: { size?: number }) => (
  <svg {...svg(size)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
)

export const CheckIcon = ({ size = 14 }: { size?: number }) => (
  <svg {...svg(size, { strokeWidth: 1.75 })}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)

/** A lens with the engraver's highlight. */
export const SearchIcon = ({ size = 18 }: { size?: number }) => (
  <svg {...svg(size)}>
    <circle cx="10.5" cy="10.5" r="6.25" />
    <path d="m15.25 15.25 4.75 4.75" />
    <path d="M7.6 9.2a3.4 3.4 0 0 1 2.2-2.1" strokeWidth={1} />
  </svg>
)

/** A numbered mark on its leader line, as on a plate; hatched while labels are shown. */
export const LabelsIcon = ({ on, size = 16 }: { on: boolean; size?: number }) => (
  <svg {...svg(size)}>
    <circle cx="15.5" cy="8.5" r="4.5" />
    <path d="M12.3 11.7 4.5 19.5" />
    {on && <path d="m13 11 5-5M12.1 9.1l4-4M14.9 11.9l4-4" strokeWidth={1} />}
  </svg>
)

/** Keyboard: delete the last letter. */
export const BackspaceIcon = ({ size = 22 }: { size?: number }) => (
  <svg {...svg(size)}>
    <path d="M9 6h10.5A1.5 1.5 0 0 1 21 7.5v9a1.5 1.5 0 0 1-1.5 1.5H9l-6-6Z" />
    <path d="m12.5 9.5 5 5m0-5-5 5" />
  </svg>
)

/** Keyboard: confirm the answer. */
export const ReturnIcon = ({ size = 22 }: { size?: number }) => (
  <svg {...svg(size)}>
    <path d="M19 6v5.5a1.5 1.5 0 0 1-1.5 1.5H5" />
    <path d="m9 9-4 4 4 4" />
  </svg>
)
