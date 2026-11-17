import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { loadPlates } from '../content/loader'
import type { Plate } from '../content/types'
import { ArrowIcon, BackIcon } from '../components/Icons'
import { useT } from '../i18n'
import { publicUrl } from '../lib/paths'
import { placeTags } from '../lib/plates'
import { tintVars } from '../lib/tint'
import { goBack, useNav } from '../state/nav'

function usePlates(): Plate[] | null {
  const [plates, setPlates] = useState<Plate[] | null>(null)
  useEffect(() => {
    let alive = true
    void loadPlates().then((p) => alive && setPlates(p.plates))
    return () => {
      alive = false
    }
  }, [])
  return plates
}

/** The plates, one row each, keyed by body system. */
export function PlatesList() {
  const t = useT()
  const openPlate = useNav((s) => s.openPlate)
  const plates = usePlates()
  if (!plates) return <p className="empty">{t('common.loading')}</p>
  return (
    <div className="rows atlas-list" lang="en">
      {plates.map((p) => (
        <button key={p.id} className="r sys" style={tintVars(p.systemId)} onClick={() => openPlate(p.id)}>
          <span className="swatch" aria-hidden />
          <span className="r-main">
            <span className="r-title" dir="auto">{p.title}</span>
            <span className="r-sub">{t('plate.arrows', { n: p.labels.length })}</span>
          </span>
          <ArrowIcon />
        </button>
      ))}
    </div>
  )
}

/** Tag height in CSS pixels, used to keep the numbered tags of one side from overlapping. */
const TAG_PX = 24

/**
 * One plate: the engraving with numbered arrows and its key. "Test yourself" hides the names;
 * tap a number to be asked what it is, then reveal the answer.
 */
export function PlateScreen({ id }: { id: string }) {
  const t = useT()
  const plates = usePlates()
  const plate = plates?.find((p) => p.id === id) ?? null
  const [active, setActive] = useState<number | null>(null)
  const [test, setTest] = useState(false)
  const [revealed, setRevealed] = useState<Set<number>>(new Set())
  const [large, setLarge] = useState(false)
  const figRef = useRef<HTMLDivElement>(null)
  const [figW, setFigW] = useState(360)

  useLayoutEffect(() => {
    const el = figRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setFigW(el.clientWidth))
    ro.observe(el)
    setFigW(el.clientWidth)
    return () => ro.disconnect()
  }, [plate, large])

  const tags = useMemo(() => {
    if (!plate) return []
    const heightPx = (figW * plate.height) / plate.width
    return placeTags(plate.labels, (TAG_PX / heightPx) * 100)
  }, [plate, figW])

  if (!plate) return <main className="page">{plates && <p className="empty">{t('common.loading')}</p>}</main>

  const { width: W, height: H } = plate
  const shown = (i: number) => !test || revealed.has(i)
  const select = (i: number) => setActive(i)
  const reveal = (i: number) => setRevealed((r) => new Set(r).add(i))
  const startTest = (on: boolean) => {
    setTest(on)
    setRevealed(new Set())
    setActive(on ? 0 : null)
  }
  const next = () => {
    const order = plate.labels.map((_, i) => i)
    const after = order.filter((i) => !revealed.has(i) && i !== active)
    setActive(after.length ? after[0] : null)
  }
  const label = active === null ? null : plate.labels[active]
  // Arrowhead size and line weight in image pixels: about 7 and 1.3 CSS pixels whatever the zoom.
  const unit = W / figW
  const head = 7 * unit

  return (
    <main className="page plate-page sys" style={tintVars(plate.systemId)}>
      <button className="backlink" onClick={() => goBack()}>
        <BackIcon /> {t('common.back')}
      </button>
      <div className="titleblock plate-titleblock">
        <p className="label">
          <span className="swatch" aria-hidden />
          {t.td(`system.${plate.systemId}`, '')}
        </p>
        <h1 className="title" lang="en" dir="ltr">
          {plate.title}
        </h1>
        <p className="small plate-view" lang="en" dir="ltr">
          {plate.view}
        </p>
      </div>

      <div className="options plate-modes">
        <button aria-pressed={!test} onClick={() => startTest(false)}>
          {t('plate.names')}
        </button>
        <button aria-pressed={test} onClick={() => startTest(true)}>
          {t('plate.test')}
        </button>
        <button className="plate-zoom" aria-pressed={large} onClick={() => setLarge((v) => !v)}>
          {large ? t('plate.fit') : t('plate.enlarge')}
        </button>
      </div>

      <div className={large ? 'plate-scroll large' : 'plate-scroll'}>
        <div className="plate-figure" ref={figRef} style={{ aspectRatio: `${W} / ${H}` }}>
          <img src={publicUrl(plate.image)} alt={plate.title} width={W} height={H} draggable={false} />
          <svg className="plate-arrows" viewBox={`0 0 ${W} ${H}`} aria-hidden>
            {tags.map((tag) => {
              const l = plate.labels[tag.i]
              const tx = (tag.side === 'l' ? 0.035 : 0.965) * W
              const ty = (tag.y / 100) * H
              const px = (l.x / 100) * W
              const py = (l.y / 100) * H
              const dx = px - tx
              const dy = py - ty
              const len = Math.hypot(dx, dy) || 1
              const ux = dx / len
              const uy = dy / len
              // The line leaves the tag's edge and stops at the base of the arrowhead.
              const sx = tx + ux * 12 * unit
              const sy = ty + uy * 12 * unit
              const bx = px - ux * head
              const by = py - uy * head
              const wing = head * 0.45
              const pts = `${px},${py} ${bx - uy * wing},${by + ux * wing} ${bx + uy * wing},${by - ux * wing}`
              const on = active === tag.i
              return (
                <g key={tag.i} className={on ? 'leader on' : active === null ? 'leader' : 'leader dim'}>
                  <line className="halo" x1={sx} y1={sy} x2={bx} y2={by} />
                  <line className="ink" x1={sx} y1={sy} x2={bx} y2={by} />
                  <polygon className="head" points={pts} />
                </g>
              )
            })}
          </svg>
          {tags.map((tag) => (
            <button
              key={tag.i}
              className={active === tag.i ? 'plate-tag on' : 'plate-tag'}
              style={{ left: tag.side === 'l' ? '3.5%' : '96.5%', top: `${tag.y}%` }}
              aria-label={shown(tag.i) ? `${tag.i + 1}. ${plate.labels[tag.i].name}` : String(tag.i + 1)}
              onClick={() => select(tag.i)}
            >
              {tag.i + 1}
            </button>
          ))}
        </div>
      </div>

      <section className={active === null ? 'plate-panel' : 'plate-panel pinned'} aria-live="polite">
        {label === null || active === null ? (
          <p className="small plate-hint">{t('plate.tapHint')}</p>
        ) : shown(active) ? (
          <>
            <p className="title plate-name">
              <span className="mono plate-no">{active + 1}</span>
              <span lang="en" dir="ltr">
                {label.name}
              </span>
            </p>
            <p className="plate-note" lang="en" dir="ltr">
              {label.note}
            </p>
            {test && (
              <button className="textlink plate-next" onClick={next}>
                {t('plate.next')}
              </button>
            )}
          </>
        ) : (
          <>
            <p className="title plate-name">
              <span className="mono plate-no">{active + 1}</span>
              <span className="plate-ask">{t('plate.which', { n: active + 1 })}</span>
            </p>
            <button className="go quiet plate-reveal" onClick={() => reveal(active)}>
              {t('plate.show')}
            </button>
          </>
        )}
      </section>

      <section className="sect">
        <p className="label">
          {t('plate.key')}
          {test && <span className="mono plate-score"> · {t('plate.revealed', { a: revealed.size, b: plate.labels.length })}</span>}
        </p>
        <ol className="sect-body plate-keylist">
          {plate.labels.map((l, i) => (
            <li key={i}>
              <button aria-pressed={active === i} onClick={() => select(i)}>
                <span className="mono">{i + 1}</span>
                <span className={shown(i) ? '' : 'plate-blank'} lang="en" dir="auto">
                  {shown(i) ? l.name : '—'}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>

      <section className="sect">
        <p className="label">{t('plate.about')}</p>
        <div className="sect-body" lang="en" dir="ltr">
          <p className="small plate-intro">{plate.intro}</p>
          <p className="tiny plate-source">{plate.source}</p>
        </div>
      </section>
    </main>
  )
}
