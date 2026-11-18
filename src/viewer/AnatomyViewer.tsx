import { Html } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode, type PointerEvent as ReactPointerEvent, type Ref } from 'react'
import * as THREE from 'three'
import type { CameraView, Structure } from '../content/types'
import type { ModuleAssets } from '../content/useModule'
import { ModelLoading } from '../components/ModelLoading'
import { reducedMotion } from '../lib/motion'
import { meshKeys } from '../lib/meshMatch'
import type { Highlighter } from './highlight'
import { onSide, plateAnchors, viewForMeshes, type PlateAnchor } from './plate'

export type { PlateAnchor }
import { CameraRig, type CameraApi } from './CameraRig'
import { ContextModel, ModelInstance } from './ModelInstance'
import { Lights, PinLabel } from './parts'
import { SCENE } from './scene'
import { ViewerHud, type BearingReadout } from './ViewerHud'
import './viewer.css'
import { translate } from '../i18n'
import { shownLang, useSettings } from '../state/settings'

export interface AnatomyViewerProps {
  assets: ModuleAssets
  highlight: string[]
  view: CameraView
  /** Questions either side, shown as blurred ghost models (quiz carousel). */
  ghosts?: { prev?: Structure; next?: Structure; index: number }
  onPick?: (meshName: string, point: [number, number, number]) => void
  /** A label pinned to a point on the model (explore). */
  pin?: { point: [number, number, number]; label: string } | null
  cameraApi?: Ref<CameraApi>
  /** For a focused region: called once with a view that frames the region. */
  onFraming?: (view: CameraView) => void
  /** Numbered references on the model, one per structure (atlas plate). */
  plate?: boolean
  /** The numbered structures, in order, with the surface point each number marks. */
  onPlate?: (anchors: PlateAnchor[]) => void
  /** A numbered reference was tapped. */
  onPlateSelect?: (id: string) => void
  /** Changes on each right answer: the target turns blue for a moment. */
  flash?: number
  /** Heading tape and AZ/EL readout over the view. */
  readouts?: boolean
  /** The camera's idle motion (see CameraRig). */
  idle?: 'turn' | 'sway' | 'off'
}

const DPR: [number, number] = [1, 2] // cap pixel ratio at 2 for mobile GPUs


export default function AnatomyViewer({
  assets,
  highlight,
  view,
  ghosts,
  onPick,
  pin,
  cameraApi,
  onFraming,
  plate,
  onPlate,
  onPlateSelect,
  flash,
  readouts,
  idle = 'off',
}: AnatomyViewerProps) {
  const hud = useRef<BearingReadout>(null)
  const [resetKey, setResetKey] = useState(0)
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null)
  // A focused region ghosts everything outside it.
  const focus = useMemo(() => (assets.info.include ? assets.content.structures.flatMap((s) => meshKeys(s.meshName)) : undefined), [assets])
  const lastTap = useRef({ t: 0, x: 0, y: 0 })

  // Double-tap (touch) or double-click (mouse) resets the view.
  const onPointerUp = (e: ReactPointerEvent) => {
    const now = performance.now()
    const l = lastTap.current
    const near = Math.hypot(e.clientX - l.x, e.clientY - l.y) < 30
    if (now - l.t < 320 && near) {
      setResetKey((k) => k + 1)
      lastTap.current = { t: 0, x: 0, y: 0 }
    } else {
      lastTap.current = { t: now, x: e.clientX, y: e.clientY }
    }
  }

  return (
    <ViewerBoundary>
      <div className="viewer" onPointerUp={onPointerUp}>
        {ghosts && <GhostCarousel assets={assets} {...ghosts} />}
        <Canvas
          className="viewer-main"
          dpr={DPR}
          frameloop="demand"
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          camera={{ fov: 35, near: 0.01, far: 50, position: view.position }}
          scene={SCENE}
        >
          <Lights />
          <Suspense fallback={null}>
            <ModelInstance assets={assets} highlight={highlight} onPick={onPick} focus={focus} onReady={setHighlighter} flash={flash} />
          </Suspense>
          {assets.info.model?.context && (
            <Suspense fallback={null}>
              <ContextModel file={assets.info.model.context} />
            </Suspense>
          )}
          {pin && <PinLabel point={pin.point} label={pin.label} />}
          {highlighter && (
            <RegionTools
              key={highlighter.target.uuid}
              highlighter={highlighter}
              assets={assets}
              onFraming={onFraming}
              plate={plate}
              onPlate={onPlate}
              onPlateSelect={onPlateSelect}
            />
          )}
          <CameraRig view={view} resetKey={resetKey} apiRef={cameraApi} idle={idle} onBearing={readouts ? (az, el) => hud.current?.set(az, el) : undefined} />
        </Canvas>
        {readouts && <ViewerHud ref={hud} />}
        <ModelLoading settling={!highlighter} />
      </div>
    </ViewerBoundary>
  )
}

/** Frames a focused region once, and places the numbered references of an atlas plate. */
function RegionTools({
  highlighter,
  assets,
  onFraming,
  plate,
  onPlate,
  onPlateSelect,
}: {
  highlighter: Highlighter
  assets: ModuleAssets
  onFraming?: (view: CameraView) => void
  plate?: boolean
  onPlate?: (anchors: PlateAnchor[]) => void
  onPlateSelect?: (id: string) => void
}) {
  const size = useThree((s) => s.size)
  const invalidate = useThree((s) => s.invalidate)
  const [anchors, setAnchors] = useState<PlateAnchor[]>([])

  useEffect(() => {
    const meshes = highlighter.focusMeshes()
    for (const m of meshes) m.updateWorldMatrix(true, false)
    if (onFraming && assets.info.include) {
      const keys = assets.content.structures.flatMap((s) => meshKeys(s.meshName))
      const v = viewForMeshes(onSide(meshes, assets.info.side, keys), size.width / Math.max(size.height, 1))
      if (v) onFraming(v)
    }
    // Measured once per model instance; the canvas size at that moment is good enough for framing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlighter])

  useEffect(() => {
    if (!plate) return
    const placed = plateAnchors(assets.content.structures, highlighter.focusMeshes(), assets.info.side)
    // Geometry has to be measured after the model is mounted; this runs once per instance and plate toggle.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnchors(placed)
    onPlate?.(placed)
    invalidate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlighter, plate])

  if (!plate) return null
  return (
    <>
      {anchors.map((a, i) => (
        <Html key={a.id} position={a.point} zIndexRange={[2, 0]} wrapperClass="pin-wrap" center>
          <button className="plate-mark figs" onClick={() => onPlateSelect?.(a.id)} aria-label={String(i + 1)}>
            {i + 1}
          </button>
        </Html>
      ))}
    </>
  )
}

/** If the model or WebGL fails, show a message instead of taking the whole app down. */
class ViewerBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed)
      return (
        <div className="viewer viewer-error" role="alert">
          <p className="small">{translate(shownLang(useSettings.getState().lang), 'viewer.error')}</p>
          {/* The 3D loader keeps failed downloads, so a fresh page is the reliable retry (the app reopens where it was). */}
          <button className="go quiet" onClick={() => window.location.reload()}>
            {translate(shownLang(useSettings.getState().lang), 'common.retry')}
          </button>
        </div>
      )
    return this.props.children
  }
}

/* ---------- Ghost carousel ---------- */

const GHOST_SLOT_X = 1.0
const GHOST_HEIGHT = 0.85

/**
 * Previous/next questions, drawn in a separate canvas that only renders when the question
 * changes, faded by CSS at the edges of the view.
 */
function GhostCarousel({ assets, prev, next, index }: { assets: ModuleAssets; prev?: Structure; next?: Structure; index: number }) {
  const el = useRef<HTMLDivElement>(null)
  // Slide in on every question change without remounting the canvas (no new WebGL context).
  useEffect(() => {
    if (reducedMotion()) return
    const e = el.current
    if (!e) return
    const css = getComputedStyle(e)
    e.animate(
      [
        { opacity: 0, transform: 'translateX(4%)' },
        { opacity: css.opacity, transform: 'none' },
      ],
      { duration: parseFloat(css.getPropertyValue('--slow')) || 280, easing: css.getPropertyValue('--ease') || 'ease-out' },
    )
  }, [index])
  return (
    <div className="viewer-ghosts" ref={el} aria-hidden>
      <Canvas
        dpr={1}
        frameloop="demand"
        gl={{ antialias: false, alpha: true }}
        camera={{ fov: 30, position: [0, 0, 4] }}
        scene={SCENE}
      >
        <Lights />
        <Suspense fallback={null}>
          {prev && <Ghost assets={assets} structure={prev} slot={-GHOST_SLOT_X} />}
          {next && <Ghost assets={assets} structure={next} slot={GHOST_SLOT_X} />}
        </Suspense>
      </Canvas>
    </div>
  )
}

/** Places a whole model so the structure's own camera framing appears in the slot. */
function Ghost({ assets, structure, slot }: { assets: ModuleAssets; structure: Structure; slot: number }) {
  const { position, target } = structure.camera
  const dir = new THREE.Vector3(...position).sub(new THREE.Vector3(...target))
  const scale = GHOST_HEIGHT / (0.63 * dir.length()) // 0.63 ≈ 2·tan(35°/2), the main camera's view height per metre
  const yaw = Math.atan2(dir.x, dir.z)
  const rotated = new THREE.Vector3(...target).applyAxisAngle(new THREE.Vector3(0, 1, 0), -yaw).multiplyScalar(scale)
  return (
    <group position={[slot - rotated.x, -rotated.y, -rotated.z]} rotation={[0, -yaw, 0]} scale={scale}>
      <ModelInstance assets={assets} highlight={meshKeys(structure.meshName)} />
    </group>
  )
}
