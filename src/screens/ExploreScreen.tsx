import { lazy, Suspense, useMemo, useRef, useState } from 'react'
import { noteFor } from '../content/notes'
import type { CameraView, Structure } from '../content/types'
import { useModule } from '../content/useModule'
import { BackIcon, CloseIcon } from '../components/Icons'
import { useT } from '../i18n'
import { meshKeys, meshMatchesAny } from '../lib/meshMatch'
import { useNav } from '../state/nav'
import { useSettings } from '../state/settings'
import type { CameraApi } from '../viewer/CameraRig'
import { sentence } from '../lib/format'

const AnatomyViewer = lazy(() => import('../viewer/AnatomyViewer'))

const OVERVIEW: CameraView = { position: [0.7, 1.05, 2.55], target: [0, 0.88, 0] }

/** Free explore: drag, pinch, tap a structure to see what it is and what it does. */
export function ExploreScreen({ moduleId }: { moduleId: string }) {
  const t = useT()
  const openExplore = useNav((s) => s.openExplore)
  const { assets } = useModule(moduleId)
  const track = useSettings((s) => s.track)
  const [selected, setSelected] = useState<Structure | null>(null)
  const [point, setPoint] = useState<[number, number, number] | null>(null)
  const [view, setView] = useState<CameraView>(OVERVIEW)
  const [copied, setCopied] = useState(false)
  const camera = useRef<CameraApi>(null)

  const highlight = useMemo(() => (selected ? meshKeys(selected.meshName) : []), [selected])

  const onPick = (meshName: string, at: [number, number, number]) => {
    const s = assets?.content.structures.find((x) => meshMatchesAny(meshName, meshKeys(x.meshName)))
    setSelected(s ?? null)
    setPoint(s ? at : null)
  }

  const clear = () => {
    setSelected(null)
    setPoint(null)
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

  return (
    <div className="overlay explore">
      <header className="explore-head">
        <button className="backlink" onClick={() => openExplore(null)}>
          <BackIcon /> {t.td(`module.${moduleId}`, moduleId)}
        </button>
        <p className="label">{t('explore.title')}</p>
      </header>
      <div className="explore-viewer">
        {assets && (
          <Suspense fallback={null}>
            <AnatomyViewer
              assets={assets}
              highlight={highlight}
              view={view}
              onPick={onPick}
              pin={selected && point ? { point, label: sentence(selected.name) } : null}
              cameraApi={camera}
            />
          </Suspense>
        )}
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
              <h2 className="title">{sentence(selected.name)}</h2>
              <button className="icon-btn" onClick={clear} aria-label={t('common.close')}>
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
                <span className="label">{t(`note.${note.track}`)}</span>
                <span className="note-text" dir="auto">
                  {note.text}
                </span>
              </p>
            )}
            <div className="explore-actions">
              <button className="textlink" onClick={() => setView({ ...selected.camera })}>
                {t('explore.focus')}
              </button>
              <button className="textlink" onClick={() => setView({ ...OVERVIEW })}>
                {t('explore.whole')}
              </button>
            </div>
          </>
        ) : (
          <p className="small">{t('explore.tap')}</p>
        )}
      </section>
    </div>
  )
}
