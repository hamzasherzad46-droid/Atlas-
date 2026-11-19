import { useGLTF } from '@react-three/drei'
import { Canvas, useThree, type ThreeEvent } from '@react-three/fiber'
import { Component, Suspense, use, useEffect, useImperativeHandle, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode, type Ref } from 'react'
import * as THREE from 'three'
import type { CameraView } from '../content/types'
import { SEPARATE_VIEWS, bodyLayers, cutPlane, explodeOffset, keepMesh, type BodyLayer, type BodyMode, type CutAxis, type LayerId, type LayerPart } from '../lib/bodyLayers'
import type { Body } from '../content/types'
import { publicUrl } from '../lib/paths'
import { trackLoads } from '../state/modelLoads'
import { CameraRig } from './CameraRig'
import { EMBEDDED_MODELS, loadEmbeddedModel } from './embeddedModel'
import { EdgeBuilder, fillMaterial, glPalette, lineMaterial, pointMaterial, solidMaterial, surfaceArea, surfacePoints } from './hud'
import { Lights, PinLabel } from './parts'
import { viewForMeshes } from './plate'
import { SCENE } from './scene'
import { useResolvedTheme } from './useResolvedTheme'
import { ViewerHud, type BearingReadout } from './ViewerHud'
import './viewer.css'

const DPR: [number, number] = [1, 2]
const DRACO_PATH = publicUrl('draco/')
const BODY_HOME: CameraView = { position: [0.75, 1.0, 3.05], target: [0, 0.86, 0] }
/** Each cut is seen face on: from above for a transverse cut, the front for coronal, the left side for sagittal. */
const CUT_VIEWS: Record<CutAxis, CameraView> = {
  transverse: { position: [0.85, 2.6, 2.1], target: [0, 0.86, 0] },
  coronal: BODY_HOME,
  sagittal: { position: [3.0, 1.0, 0.75], target: [0, 0.86, 0] },
}

export interface BodyPick {
  layer: LayerId
  /** Mesh (node) name, e.g. "biceps_brachii.l": used to find study notes. */
  meshName: string
  /** The BodyParts3D name kept in the node's extras, e.g. "Left biceps brachii". */
  source: string
  point: [number, number, number]
}

export interface BodyViewerApi {
  /** Move the camera to frame the selected part. */
  focus(): void
}

export interface BodyViewerProps {
  /** Which body: its layers come from bodyLayers(). */
  body: Body
  layers: LayerId[]
  mode: BodyMode
  /** Separation of the bones, or the position of the cut, 0..1. */
  amount: number
  axis: CutAxis
  selected: { layer: LayerId; meshName: string } | null
  isolated: boolean
  pin: { point: [number, number, number]; label: string } | null
  apiRef?: Ref<BodyViewerApi>
  onPick(pick: BodyPick | null): void
  onLoading(layer: LayerId, loading: boolean): void
}

function useFetchedScene(file: string): THREE.Object3D {
  return useGLTF(publicUrl(`models/${file}`), DRACO_PATH, false, trackLoads).scene
}
function useEmbeddedScene(file: string): THREE.Object3D {
  return use(loadEmbeddedModel(file)).scene
}
/** Chosen once per build, so the hook order never changes. */
const useModelScene = EMBEDDED_MODELS ? useEmbeddedScene : useFetchedScene

const noRaycast = () => {}

interface Shared {
  mode: BodyMode
  amount: number
  plane: THREE.Plane
  selected: BodyViewerProps['selected']
  isolated: boolean
  registry: Map<string, THREE.Mesh>
  accent: THREE.Material
  onPick: BodyViewerProps['onPick']
}

/** The whole body, layer by layer: skin to bone, organs, arteries, veins and the nervous system. */
export default function BodyViewer(props: BodyViewerProps) {
  const theme = useResolvedTheme()
  // A focused part keeps the camera until the view mode or cut plane changes.
  const [focus, setFocus] = useState<{ view: CameraView; mode: BodyMode; axis: CutAxis } | null>(null)
  const modeView = props.mode === 'separate' ? SEPARATE_VIEWS[props.body] : props.mode === 'cut' ? CUT_VIEWS[props.axis] : BODY_HOME
  const view = focus && focus.mode === props.mode && focus.axis === props.axis ? focus.view : modeView
  const [resetKey, setResetKey] = useState(0)
  const hud = useRef<BearingReadout>(null)
  const registry = useMemo(() => new Map<string, THREE.Mesh>(), [])
  // The selected part is the one solid object; colours come from the theme's tokens.
  const accent = useMemo(() => solidMaterial(glPalette()), [])
  useEffect(() => () => accent.dispose(), [accent])
  useEffect(() => {
    const p = glPalette()
    accent.color.set(p.target)
    accent.userData.rim.value.set(p.rim)
  }, [accent, theme])

  // A new plane whenever the cut moves; parts re-attach it to their materials.
  const plane = useMemo(() => {
    const p = cutPlane(props.axis, props.amount)
    return new THREE.Plane(new THREE.Vector3(...p.normal), p.constant)
  }, [props.axis, props.amount])

  useImperativeHandle(props.apiRef, () => ({
    focus: () => {
      const sel = props.selected
      const mesh = sel ? registry.get(`${sel.layer}:${sel.meshName}`) : undefined
      const v = mesh ? viewForMeshes([mesh], 0.7) : null
      if (v) setFocus({ view: v, mode: props.mode, axis: props.axis })
    },
  }))

  const lastTap = useRef({ t: 0, x: 0, y: 0 })
  const onPointerUp = (e: ReactPointerEvent) => {
    const now = performance.now()
    const l = lastTap.current
    if (now - l.t < 320 && Math.hypot(e.clientX - l.x, e.clientY - l.y) < 30) {
      setFocus(null)
      setResetKey((k) => k + 1)
      lastTap.current = { t: 0, x: 0, y: 0 }
    } else lastTap.current = { t: now, x: e.clientX, y: e.clientY }
  }

  const shown = bodyLayers(props.body).filter((l) => props.layers.includes(l.id) && (props.mode !== 'separate' || l.id === 'skeleton'))
  const shared: Shared = {
    mode: props.mode,
    amount: props.amount,
    plane,
    selected: props.selected,
    isolated: props.isolated,
    registry,
    accent,
    onPick: props.onPick,
  }

  return (
    <BodyBoundary>
      <div className="viewer" onPointerUp={onPointerUp}>
        <Canvas
          className="viewer-main"
          dpr={DPR}
          frameloop="demand"
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', localClippingEnabled: true }}
          camera={{ fov: 35, near: 0.01, far: 60, position: BODY_HOME.position }}
          scene={SCENE}
          onPointerMissed={(e) => e.type === 'click' && props.onPick(null)}
        >
          <Lights />
          {shown.map((layer) => (
            <Suspense key={layer.id} fallback={<Loading id={layer.id} onLoading={props.onLoading} />}>
              <Layer layer={layer} shared={shared} theme={theme} />
            </Suspense>
          ))}
          {props.pin && <PinLabel point={props.pin.point} label={props.pin.label} />}
          <CameraRig
            view={view}
            resetKey={resetKey}
            maxDistance={6}
            // The body turns slowly when left alone, but holds still while a part is selected or cut.
            idle={props.selected || props.mode === 'cut' ? 'off' : 'turn'}
            onBearing={(az, el) => hud.current?.set(az, el)}
          />
        </Canvas>
        <ViewerHud ref={hud} />
      </div>
    </BodyBoundary>
  )
}

function Loading({ id, onLoading }: { id: LayerId; onLoading: BodyViewerProps['onLoading'] }) {
  useEffect(() => {
    onLoading(id, true)
    return () => onLoading(id, false)
  }, [id, onLoading])
  return null
}

function Layer({ layer, shared, theme }: { layer: BodyLayer; shared: Shared; theme: 'dark' | 'light' }) {
  return (
    <>
      {layer.parts.map((part) => (
        <Part key={part.file} layer={layer} part={part} shared={shared} theme={theme} />
      ))}
    </>
  )
}

/** Points for a whole layer in X-ray mode, shared out over its meshes by surface area. */
const POINT_BUDGET: Partial<Record<LayerId, number>> = { skin: 14000, muscles: 30000 }
/** Dense whole-body layers draw fewer, stronger creases. */
const EDGE_ANGLE: Partial<Record<LayerId, number>> = { muscles: 32, organs: 50, arteries: 30, veins: 30, nervous: 30 }
/** Line strength per layer (1 = the theme's line opacity), so packed layers don't turn into a white mass. */
const LINE_SCALE: Partial<Record<LayerId, number>> = { skin: 0.6, organs: 0.3, muscles: 0.8, arteries: 0.8, veins: 0.8, nervous: 0.8 }

/**
 * One model file of a layer, in the HUD style: fine lines (or, for the outer layers in X-ray mode,
 * a faint point cloud) over a barely-there surface; the selected part is the one solid object.
 * Separation, cut and isolation work on all of it.
 */
function Part({ layer, part, shared, theme }: { layer: BodyLayer; part: LayerPart; shared: Shared; theme: 'dark' | 'light' }) {
  const scene = useModelScene(part.file)
  const invalidate = useThree((s) => s.invalidate)
  const mats = useMemo(() => {
    const p = glPalette()
    return { fill: fillMaterial(p, 0.025), lines: lineMaterial(p, LINE_SCALE[layer.id] ?? 1), points: pointMaterial(p, theme === 'light' ? 0.5 : 0.45, p.point, theme !== 'light') }
  }, [layer.id, theme])
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats])
  const { root, meshes } = useMemo(() => {
    const r = scene.clone(true)
    const list: THREE.Mesh[] = []
    const dropped: THREE.Object3D[] = []
    r.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      // A file shared by two layers (the female bones and organs) shows only this part's meshes.
      if (!keepMesh(part, m.name)) return void dropped.push(m)
      // Geometry is in body coordinates; the centre is where a bone moves out from when separated.
      m.geometry.computeBoundingBox()
      const c = m.geometry.boundingBox!.getCenter(new THREE.Vector3())
      m.userData.centre = [c.x, c.y, c.z]
      m.userData.layer = layer.id
      list.push(m)
    })
    for (const d of dropped) d.removeFromParent()
    return { root: r, meshes: list }
  }, [scene, layer.id, part])

  useEffect(() => {
    for (const m of meshes) shared.registry.set(`${layer.id}:${m.name}`, m)
    return () => {
      for (const m of meshes) shared.registry.delete(`${layer.id}:${m.name}`)
    }
  }, [meshes, layer.id, shared.registry])

  const { mode, amount, selected, isolated, plane, accent } = shared
  const asPoints = mode === 'xray' && layer.xray < 0.5 && !!POINT_BUDGET[layer.id]

  // Lines are built once per mesh (in time slices) the first time they are needed.
  const [edges, setEdges] = useState<EdgeBuilder | null>(null)
  useEffect(() => {
    if (asPoints || edges) return
    // Created when lines are first shown; kept while the part is mounted.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEdges(new EdgeBuilder(meshes, () => mats.lines, invalidate, EDGE_ANGLE[layer.id]))
  }, [asPoints, edges, meshes, mats.lines, invalidate, layer.id])
  useEffect(() => () => edges?.dispose(), [edges])

  // Points: each mesh's share of the layer's budget, by surface area.
  const points = useMemo(() => {
    if (!asPoints) return null
    const budget = POINT_BUDGET[layer.id] ?? 0
    const areas = meshes.map(surfaceArea)
    const total = areas.reduce((a, b) => a + b, 0) || 1
    return meshes.map((m, i) => {
      const n = Math.max(0, Math.round((budget * areas[i]) / total))
      if (!n) return null
      const pts = new THREE.Points(surfacePoints(m, n), mats.points)
      pts.raycast = () => {}
      return pts
    })
  }, [asPoints, meshes, layer.id, mats.points])
  useEffect(() => {
    if (!points) return
    points.forEach((p, i) => p && meshes[i].add(p))
    invalidate()
    return () => points.forEach((p) => p?.removeFromParent())
  }, [points, meshes, invalidate])

  useEffect(() => {
    const clip = mode === 'cut' ? [plane] : null
    for (const m of [mats.fill, mats.lines, mats.points, accent]) {
      m.clippingPlanes = clip
      m.needsUpdate = true
    }
    arrange(meshes, layer.id, {
      fill: mats.fill,
      accent,
      selected,
      isolated,
      pickable: !asPoints,
      points: asPoints,
      lines: edges,
      separate: mode === 'separate' ? amount : 0,
    })
    invalidate()
  }, [mode, amount, selected, isolated, plane, accent, mats, meshes, layer.id, asPoints, edges, invalidate])

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 8) return // a drag, not a tap
    // Raycasts ignore clipping: a hit in the part that was cut away belongs to whatever lies behind.
    if (mode === 'cut' && plane.distanceToPoint(e.point) < 0) return
    e.stopPropagation()
    const m = e.object as THREE.Mesh
    shared.onPick({ layer: layer.id, meshName: m.name, source: String(m.userData.name ?? m.name), point: [e.point.x, e.point.y, e.point.z] })
  }

  return <primitive object={root} onClick={onClick} />
}

/** Selection, isolation, lines or points, tap targets and bone separation for the meshes of one part. */
function arrange(
  meshes: THREE.Mesh[],
  layer: LayerId,
  o: {
    fill: THREE.Material
    accent: THREE.Material
    selected: BodyViewerProps['selected']
    isolated: boolean
    pickable: boolean
    points: boolean
    lines: EdgeBuilder | null
    separate: number
  },
) {
  for (const m of meshes) {
    const isSel = !!o.selected && o.selected.layer === layer && o.selected.meshName === m.name
    m.material = isSel ? o.accent : o.fill
    m.visible = !o.isolated || isSel
    const lines = o.lines?.lines.get(m)
    if (lines) lines.visible = !isSel && !o.points
    for (const c of m.children) if ((c as THREE.Points).isPoints) c.visible = !isSel
    // Point-cloud layers can't be tapped, so taps reach what lies beneath.
    m.raycast = m.visible && (o.pickable || isSel) ? THREE.Mesh.prototype.raycast : noRaycast
    m.position.set(...explodeOffset(m.userData.centre as [number, number, number], o.separate))
  }
}

class BodyBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false }
  static getDerivedStateFromError() {
    return { error: true }
  }
  render() {
    return this.state.error ? <div className="viewer viewer-error">3D view unavailable on this device.</div> : this.props.children
  }
}
