import { useImperativeHandle, useRef, type Ref } from 'react'
import { useT } from '../i18n'
import { bearingText } from '../lib/format'

export interface BearingReadout {
  set(az: number, el: number): void
}

/** Pixels per degree on the heading tape. */
const PX_PER_DEG = 3
/** The tape is drawn from −90° to 450° so any bearing has ±90° either side of it. */
const FROM = -90
const TO = 450
const MARKS = Array.from({ length: (TO - FROM) / 5 + 1 }, (_, i) => FROM + i * 5)
const wrap = (d: number) => ((d % 360) + 360) % 360

const pad3 = (n: number) => String(n).padStart(3, '0')

/**
 * The instrument layer over a 3D view: a heading tape along the top edge and the camera's azimuth
 * and elevation in the lower corner. Both follow the camera without re-rendering React: the camera
 * rig calls `set` through the ref, which moves the tape and rewrites one text node.
 */
export function ViewerHud({ ref, azel = true }: { ref: Ref<BearingReadout>; azel?: boolean }) {
  const t = useT()
  const strip = useRef<HTMLDivElement>(null)
  const text = useRef<HTMLSpanElement>(null)
  const cardinal: Record<number, string> = { 0: t('viewer.north'), 90: t('viewer.east'), 180: t('viewer.south'), 270: t('viewer.west') }
  const az = t('viewer.az')
  const el = t('viewer.el')

  useImperativeHandle(ref, () => ({
    set(a: number, e: number) {
      if (strip.current) strip.current.style.transform = `translateX(${-(a - FROM) * PX_PER_DEG}px)`
      if (text.current) text.current.textContent = bearingText(a, e, az, el)
    },
  }))

  return (
    <div className="viewer-hud" aria-hidden>
      <div className="tape">
        <div className="tape-strip" ref={strip}>
          {MARKS.map((d) => {
            const deg = wrap(d)
            const major = deg % 30 === 0
            return (
              <span key={d} className={major ? 'tape-tick major' : 'tape-tick'} style={{ left: (d - FROM) * PX_PER_DEG }}>
                {major && <span className="tape-figure hud">{cardinal[deg] ?? pad3(deg)}</span>}
              </span>
            )
          })}
        </div>
        <span className="tape-index" />
      </div>
      {azel && <span className="viewer-azel hud" ref={text} />}
    </div>
  )
}
