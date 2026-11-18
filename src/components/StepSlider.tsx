import type { ReactNode } from 'react'

/**
 * A setting with a few fixed values, as a hairline row: the name and the current value on one line,
 * a slider underneath (a hairline track, the accent up to the knob, a tick for each value). The
 * control itself is a native range input laid over the drawing, so keyboards and screen readers
 * work as usual.
 */
export function StepSlider<T extends number>({
  id,
  label,
  values,
  value,
  format,
  onChange,
}: {
  id: string
  label: ReactNode
  values: readonly T[]
  value: T
  format(v: T): string
  onChange(v: T): void
}) {
  const index = Math.max(0, values.indexOf(value))
  const at = values.length > 1 ? (index / (values.length - 1)) * 100 : 0
  return (
    <div className="slider-row">
      <div className="slider-head">
        <label className="r-title" htmlFor={id}>
          {label}
        </label>
        <span className="r-value">{format(value)}</span>
      </div>
      <div className="slider" style={{ ['--at' as string]: `${at}%` }}>
        <span className="slider-track" aria-hidden />
        <span className="slider-fill" aria-hidden />
        {values.map((v, i) => (
          <span key={v} className="slider-tick" aria-hidden style={{ insetInlineStart: `${(i / (values.length - 1)) * 100}%` }} />
        ))}
        <span className="slider-knob" aria-hidden />
        <input
          id={id}
          type="range"
          min={0}
          max={values.length - 1}
          step={1}
          value={index}
          aria-valuetext={format(value)}
          onChange={(e) => onChange(values[Number(e.target.value)])}
        />
      </div>
    </div>
  )
}
