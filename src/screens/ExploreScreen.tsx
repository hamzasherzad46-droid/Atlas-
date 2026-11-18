import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { moduleTitle } from '../content/names'
import { noteFor } from '../content/notes'
import type { CameraView, Structure } from '../content/types'
import { useModule } from '../content/useModule'
import { CloseIcon } from '../components/Icons'
import { useT } from '../i18n'
import { sentence } from '../lib/format'
import { meshKeys, mostSpecific } from '../lib/meshMatch'
import { useNav } from '../state/nav'
import { useSettings } from '../state/settings'
import type { CameraApi } from '../viewer/CameraRig'
import type { PlateAnchor } from '../viewer/plate'
import { ScreenBar } from '../components/ScreenBar'

const AnatomyViewer = lazy(() => import('../viewer/AnatomyViewer'))

const OVERVIEW: CameraView = { position: [0.7, 1.05, 2.55], target: [0, 0.88, 0] }
/** Numbered references are offered only where they stay legible: focused regions and small modules. */
const PLATE_LIMIT = 20

/** Camera bearing around the model, like an instrument's azimuth and altitude scales. */
function useBearing(camera: React.RefObject<CameraApi | null>) {
  const [bearing, setBearing] = useState({ az: 0, alt: 0 })
  useEffect(() => {
    const tm = setInterval(() => {
      const v = camera.current?.getView()
      if (!v) return
      const dx = v.position[0] - v.target[0]
      const dy = v.position[1] - v.target[1]
      const dz = v.position[2] - v.target[2]
      const az = Math.round(((Math.atan2(dx, dz) * 180) / Math.PI + 360) % 360)
      const alt = Math.round((Math.atan2(dy, Math.hypot(dx, dz)) * 180) / Math.PI)
      setBearing((b) => (b.az === az && b.alt === alt ? b : { az, alt }))
    }, 250)
    return () => clearInterval(tm)
  }, [camera])
  return bearing
}

/** Explore a model like an atlas plate: rotate it, tap a structure or a number, read what it is. */
export function ExploreScreen({ moduleId }: { moduleId: string }) {
  const t = useT()
  const { assets } = useModule(moduleId)
  const track = useSettings((s) => s.track)
  const [selected, setSelected] = useState<Structure | null>(null)
  const [point, setPoint] = useState<[number, number, number] | null>(null)
  const [home, setHome] = useState<CameraView>(OVERVIEW)
  const [view, setView] = useState<CameraView>(OVERVIEW)
  const [anchors, setAnchors] = useState<PlateAnchor[]>([])
  const [labels, setLabels] = useState(true)
  const [copied, setCopied] = useState(false)
  const camera = useRef<CameraApi>(null)
  const bearing = useBearing(camera)

  const structures = useMemo(() => assets?.content.structures ?? [], [assets])
  const plateOffered = structures.length > 0 && structures.length <= PLATE_LIMIT
  const plate = plateOffered && labels
  const highlight = useMemo(() => (selected ? meshKeys(selected.meshName) : []), [selected])
  const numberOf = useMemo(() => new Map(anchors.map((a, i) => [a.id, i + 1])), [anchors])

  // Opened on one structure (from search): select it and turn the camera to it once it has loaded.
  const focusId = useNav((s) => s.exploreFocus)
  const [focused, setFocused] = useState<string | null>(null)
  if (focusId && focused !== focusId && structures.length) {
    setFocused(focusId)
    const s = structures.find((x) => x.id === focusId)
    if (s) {
      setSelected(s)
      setView({ ...s.camera })
    }
  }

  const select = (s: Structure | null, at: [number, number, number] | null) => {
    setSelected(s)
    setPoint(s ? at : null)
  }

  const onPick = (meshName: string, at: [number, number, number]) => select(mostSpecific(meshName, structures) ?? null, at)

  const fromKey = (id: string) => {
    const s = structures.find((x) => x.id === id) ?? null
    select(s, anchors.find((a) => a.id === id)?.point ?? null)
  }

  const onFraming = (v: CameraView) => {
    setHome(v)
    if (!selected) setView(v)
  }

  const onPlate = (placed: PlateAnchor[]) => {
    setAnchors(placed)
    // A structure opened from search has no tapped point yet; pin its label to its number.
    if (selected && !point) setPoint(placed.find((a) => a.id === selected.id)?.point ?? null)
  }

  // Dev helper for authoring content: copy the current camera as JSON.
  const copyCamera = async () => {
    const v = camera.current?.getView()
    if (!v) return
    await navigator.clipboard?.writeText(JSON.stringify({ camera: v }))
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  const note = selected ? noteFor(selected, track) : null
  const n = selected ? numberOf.get(selected.id) : undefined

  return (
    <div className="overlay explore">
      <ScreenBar
        title={<h1 className="screen-bar-h">{moduleTitle(t, moduleId)}</h1>}
        end={
          plateOffered && (
            <button className="explore-toggle" aria-pressed={labels} onClick={() => setLabels((v) => !v)}>
              {t('explore.labels')} <span aria-hidden>{labels ? '●' : '○'}</span>
            </button>
          )
        }
      />
      <div className="explore-viewer">
        {assets && (
          <Suspense fallback={null}>
            <AnatomyViewer
              assets={assets}
              highlight={highlight}
              view={view}
              onPick={onPick}
              pin={selected && point ? { point, label: n ? `${n} · ${sentence(selected.name)}` : sentence(selected.name) } : null}
              cameraApi={camera}
              onFraming={onFraming}
              plate={plate}
              onPlate={onPlate}
              onPlateSelect={fromKey}
            />
          </Suspense>
        )}
        <p className="figs bearing" aria-hidden>
          AZ {String(bearing.az).padStart(3, '0')}° · ALT {bearing.alt >= 0 ? '+' : '−'}
          {String(Math.abs(bearing.alt)).padStart(2, '0')}°
        </p>
        {!selected && <p className="tiny explore-help">{t('explore.help')}</p>}
        {import.meta.env.DEV && (
          <button className="dev-copy" onClick={() => void copyCamera()}>
            {copied ? t('explore.copied') : t('explore.copy')}
          </button>
        )}
      </div>
      <section className={`explore-panel${selected ? ' open' : ''}`} aria-live="polite" key={selected?.id ?? 'none'}>
        {selected ? (
          <>
            <div className="explore-title">
              <h2 className="title">
                {n && <span className="figs plate-no">{n}</span>}
                {sentence(selected.name)}
              </h2>
              <button className="icon-btn" onClick={() => select(null, null)} aria-label={t('common.close')}>
                <CloseIcon />
              </button>
            </div>
            {selected.latinName.toLowerCase() !== selected.name.toLowerCase() && (
              <p className="latin" dir="auto">
                {selected.latinName}
              </p>
            )}
            <p className="explore-fn" dir="auto">
              {selected.function}
            </p>
            {note && (
              <p className="note">
                <span className="label">{t.td(`note.${note.kind}`, note.kind)}</span>
                <span className="note-text" dir="auto">
                  {note.text}
                </span>
              </p>
            )}
            <div className="explore-actions">
              <button className="textlink" onClick={() => setView({ ...selected.camera })}>
                {t('explore.focus')}
              </button>
              <button className="textlink" onClick={() => setView({ ...home })}>
                {t('explore.reset')}
              </button>
            </div>
          </>
        ) : plate && anchors.length ? (
          <>
            <p className="label">{t('explore.key')}</p>
            <ol className="plate-key">
              {anchors.map((a, i) => {
                const s = structures.find((x) => x.id === a.id)
                return (
                  <li key={a.id}>
                    <button onClick={() => fromKey(a.id)}>
                      <span className="figs">{i + 1}</span>
                      <span>{s ? sentence(s.name) : a.id}</span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </>
        ) : (
          <p className="small">{t('explore.tap')}</p>
        )}
      </section>
    </div>
  )
}
