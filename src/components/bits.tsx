import { addDays, dayKey } from '../lib/dates'
import type { DayActivity } from '../lib/assignments'
import { useToasts } from '../state/toast'

/** Hairline progress meter: burgundy; `good` for completed items, `tint` for the surrounding system's colour key. */
export function Meter({ value, max, tone }: { value: number; max: number; tone?: 'good' | 'tint' }) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className={`meter${tone ? ` ${tone}` : ''}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <span style={{ width: `${pct}%` }} />
    </div>
  )
}

/** 12-week activity grid (most recent week last). */
export function Heatmap({ days, now = new Date() }: { days: Record<string, DayActivity>; now?: Date }) {
  const end = addDays(now, 6 - ((now.getDay() + 6) % 7))
  const start = addDays(end, -7 * 12 + 1)
  const cells = Array.from({ length: 7 * 12 }, (_, i) => {
    const d = addDays(start, i)
    const k = dayKey(d)
    const a = days[k]
    const n = (a?.answered ?? 0) + (a?.cards ?? 0)
    const level = n === 0 ? 0 : n < 10 ? 1 : n < 25 ? 2 : n < 50 ? 3 : 4
    return { k, level, future: d > now }
  })
  return (
    <div className="heat" aria-hidden>
      {cells.map((c) => (
        <span key={c.k} className={`heat-cell l${c.level}${c.future ? ' future' : ''}`} />
      ))}
    </div>
  )
}

/** Quiet notices: an ink strip under the status bar. */
export function Toasts() {
  const toasts = useToasts((s) => s.toasts)
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <span className="label">{t.title}</span>
          {t.detail && <span className="toast-detail">{t.detail}</span>}
        </div>
      ))}
    </div>
  )
}
