import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { catalog, loadContentFile } from '../content/loader'
import type { Structure } from '../content/types'
import { ModelLoading } from '../components/ModelLoading'
import { useModelLoads } from '../state/modelLoads'
import { CloseIcon } from '../components/Icons'
import { useT } from '../i18n'
import { bodyLayers, displayName, type BodyMode, type CutAxis, type LayerId } from '../lib/bodyLayers'
import { BodyChoice } from '../components/BodyChoice'
import { ColourKey } from '../components/ColourKey'
import { useSettings } from '../state/settings'
import type { Body } from '../content/types'
import { sentence } from '../lib/format'
import { mostSpecific } from '../lib/meshMatch'
import { useNav } from '../state/nav'
import type { BodyPick, BodyViewerApi } from '../viewer/BodyViewer'
import { ScreenBar } from '../components/ScreenBar'

const BodyViewer = lazy(() => import('../viewer/BodyViewer'))

const MODES: BodyMode[] = ['look', 'xray', 'separate', 'cut']
const AXES: CutAxis[] = ['transverse', 'coronal', 'sagittal']

interface Known {
  structure: Structure
  moduleId: string
}

/** Every structure with study notes on this body, so a tapped part can show its notes where they exist. */
function useKnownStructures(body: Body): Known[] {
  const [known, setKnown] = useState<Known[]>([])
  useEffect(() => {
    let alive = true
    const modules = catalog.systems
      .flatMap((s) => s.modules)
      .filter((m) => m.status === 'available' && m.contentFile && (!m.body || m.body === body))
    void Promise.all(modules.map((m) => loadContentFile(m.contentFile!).then((c) => c.structures.map((structure) => ({ structure, moduleId: m.id }))))).then(
      (lists) => alive && setKnown(lists.flat()),
    )
    return () => {
      alive = false
    }
  }, [body])
  return known
}

/**
 * The whole body in 3D. Layers from skin to bone can be switched on and off; X-ray makes the
 * outer layers see-through; the bones can be pulled apart; and the body can be cut in any plane.
 * Tap any part to name it.
 */
export function BodyScreen() {
  const t = useT()
  const openModule = useNav((s) => s.openModule)
  const body = useSettings((s) => s.body)
  const setSettings = useSettings((s) => s.set)
  const known = useKnownStructures(body)
  const available = bodyLayers(body)
  const [layers, setLayers] = useState<LayerId[]>(() => available.filter((l) => l.on).map((l) => l.id))
  const [mode, setMode] = useState<BodyMode>('xray')
  const [separation, setSeparation] = useState(0.6)
  const [cut, setCut] = useState(0.76)
  const [axis, setAxis] = useState<CutAxis>('transverse')
  const [pick, setPick] = useState<BodyPick | null>(null)
  const [isolated, setIsolated] = useState(false)
  const [loading, setLoading] = useState<LayerId[]>([])
  const [groups, setGroups] = useState<string[]>([])
  const progress = useModelLoads((s) => s.shown)
  const api = useRef<BodyViewerApi>(null)

  const onLoading = useCallback((id: LayerId, on: boolean) => setLoading((l) => (on ? [...new Set([...l, id])] : l.filter((x) => x !== id))), [])
  const onPick = useCallback((p: BodyPick | null) => {
    setPick(p)
    if (!p) setIsolated(false)
  }, [])

  // Switching body starts again from that body's own layers.
  const switchBody = (b: Body) => {
    if (b === body) return
    setSettings({ body: b })
    setLayers(bodyLayers(b).filter((l) => l.on).map((l) => l.id))
    onPick(null)
  }

  const toggle = (id: LayerId) => {
    setLayers((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]))
    if (pick?.layer === id) onPick(null)
  }

  const match = useMemo(() => {
    if (!pick) return null
    const hit = mostSpecific(
      pick.meshName,
      known.map((k) => k.structure),
    )
    return hit ? (known.find((k) => k.structure === hit) ?? null) : null
  }, [pick, known])

  const name = pick ? (match ? sentence(match.structure.name) : displayName(pick.source)) : ''
  const separate = mode === 'separate'

  return (
    <div className="overlay body-screen">
      <ScreenBar title={<h1 className="screen-bar-h">{t('body.title')}</h1>} end={<BodyChoice className="bar-options" value={body} onChange={switchBody} />} />

      <div className="options body-modes" role="group" aria-label={t('body.mode')}>
        {MODES.map((m) => (
          <button key={m} aria-pressed={mode === m} onClick={() => setMode(m)}>
            {t(`body.mode.${m}`)}
          </button>
        ))}
      </div>

      <div className="explore-viewer body-viewer">
        <Suspense fallback={<ModelLoading always />}>
          <BodyViewer
            body={body}
            layers={layers}
            mode={mode}
            amount={separate ? separation : cut}
            axis={axis}
            selected={pick ? { layer: pick.layer, meshName: pick.meshName } : null}
            isolated={isolated}
            pin={pick ? { point: pick.point, label: name } : null}
            apiRef={api}
            onPick={onPick}
            onLoading={onLoading}
            onGroups={setGroups}
          />
        </Suspense>
        <ColourKey groups={groups} />
        {loading.length > 0 && (
          <p className="small body-loading" aria-live="polite">
            {t('body.loading', { layer: loading.map((id) => t(`layer.${id}`)).join(', ') })}
            {progress != null && <span className="num"> {t.percent(Math.round(progress * 100))}</span>}
          </p>
        )}
      </div>

      {(separate || mode === 'cut') && (
        <div className="body-tools">
          {mode === 'cut' && (
            <div className="options body-axes">
              {AXES.map((a) => (
                <button key={a} aria-pressed={axis === a} onClick={() => setAxis(a)}>
                  {t(`body.cut.${a}`)}
                </button>
              ))}
            </div>
          )}
          <input
            className="body-range"
            type="range"
            min={0}
            max={1}
            step={0.005}
            value={separate ? separation : cut}
            aria-label={separate ? t('body.separation') : t('body.cutAt')}
            onChange={(e) => (separate ? setSeparation : setCut)(Number(e.target.value))}
          />
        </div>
      )}

      <div className="body-layers" role="group" aria-label={t('body.layers')}>
        {available.map((l) => (
          <button
            key={l.id}
            className="body-layer"
            aria-pressed={layers.includes(l.id)}
            disabled={separate && l.id !== 'skeleton'}
            onClick={() => toggle(l.id)}
          >
            <span className="body-swatch" aria-hidden />
            {t(`layer.${l.id}`)}
          </button>
        ))}
      </div>

      <section className="explore-panel body-panel" aria-live="polite">
        {!pick ? (
          <>
            <p className="small">{t(`body.help.${mode}`)}</p>
            {body === 'female' && <p className="tiny body-note">{t('bodyOf.femaleNote')}</p>}
          </>
        ) : (
          <>
            <div className="explore-title">
              <h2 className="title" lang="en" dir="auto">
                {name}
              </h2>
              <button className="icon-btn" aria-label={t('common.close')} onClick={() => onPick(null)}>
                <CloseIcon />
              </button>
            </div>
            <p className="label">
              {t(`layer.${pick.layer}`)}
              {match?.structure.latinName ? (
                <>
                  {' · '}
                  <span className="latin" lang="la">
                    {match.structure.latinName}
                  </span>
                </>
              ) : null}
            </p>
            {match && (
              <p className="explore-fn" lang="en" dir="auto">
                {match.structure.definition}
              </p>
            )}
            <div className="explore-actions">
              <button className="textlink" onClick={() => api.current?.focus()}>
                {t('body.focus')}
              </button>
              <button className="textlink" onClick={() => setIsolated((v) => !v)}>
                {isolated ? t('body.showAll') : t('body.isolate')}
              </button>
              {match && (
                <button
                  className="textlink"
                  onClick={() => {
                    openModule(match.moduleId)
                  }}
                >
                  {t('body.study')}
                </button>
              )}
            </div>
          </>
        )}
        {layers.includes('nervous') && !pick && <p className="tiny body-note">{t('body.nervesNote')}</p>}
      </section>
    </div>
  )
}
