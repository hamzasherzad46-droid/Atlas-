import type { SVGProps } from 'react'

/** A few fine line icons; everything else in the interface is set in type. */
const svg = (size: number, extra?: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'square',
  strokeLinejoin: 'miter',
  'aria-hidden': true,
  ...extra,
})

/** Forward arrow; mirrored in right-to-left languages. */
export const ArrowIcon = ({ size = 16 }: { size?: number }) => (
  <svg {...svg(size, { className: 'arrow flip-rtl' })}>
    <path d="M3 12h17M14 6l6 6-6 6" />
  </svg>
)

export const BackIcon = ({ size = 16 }: { size?: number }) => (
  <svg {...svg(size, { className: 'flip-rtl' })}>
    <path d="M21 12H4M10 6l-6 6 6 6" />
  </svg>
)

export const CloseIcon = ({ size = 16 }: { size?: number }) => (
  <svg {...svg(size)}>
    <path d="M5 5l14 14M19 5 5 19" />
  </svg>
)

export const CheckIcon = ({ size = 14 }: { size?: number }) => (
  <svg {...svg(size, { strokeWidth: 2 })}>
    <path d="m4.5 12.5 5 5L19.5 7" />
  </svg>
)
