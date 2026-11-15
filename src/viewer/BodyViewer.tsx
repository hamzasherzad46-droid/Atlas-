import { useGLTF } from '@react-three/drei'
import { Canvas, useThree, type ThreeEvent } from '@react-three/fiber'
import { Component, Suspense, use, useEffect, useImperativeHandle, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode, type Ref } from 'react'
import * as THREE from 'three'
import type { CameraView } from '../content/types'
import { BODY_LAYERS, cutPlane, explodeOffset, type BodyLayer, type BodyMode, type CutAxis, type LayerId, type LayerPart } from '../lib/bodyLayers'
import { publicUrl } from '../lib/paths'
import { CameraRig } from './CameraRig'
import { EMBEDDED_MODELS, loadEmbeddedModel } from './embeddedModel'
import { ACCENT, PALETTES } from './highlight'
import { Lights, PinLabel } from './parts'
import { viewForMeshes } from './plate'
import { SCENE } from './scene'
import { useResolvedTheme } from './useResolvedTheme'
import './viewer.css'

const DPR: [number, number] = [1, 2]
const DRACO_PATH = publicUrl('draco/')
const BODY_HOME: CameraView = { position: [0.75, 1.0, 3.05], target: [0, 0.86, 0] }
/** Far enough back for the separated skeleton. */
const SEPARATE_VIEW: CameraView = { position: [1.0, 1.05, 4.2], target: [0, 0.86, 0] }
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
  return useGLTF(publicUrl(`models/${file}`), DRACO_PATH, false).scene
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
  const modeView = props.mode === 'separate' ? SEPARATE_VIEW : props.mode === 'cut' ? CUT_VIEWS[props.axis] : BODY_HOME
  const view = focus && focus.mode === props.mode && focus.axis === props.axis ? focus.view : modeView
  const [resetKey, setResetKey] = useState(0)
  const registry = useMemo(() => new Map<string, THREE.Mesh>(), [])
  const accent = useMemo(
    () => new THREE.MeshStandardMaterial({ color: ACCENT, emissive: ACCENT, emissiveIntensity: 0.25, roughness: 0.5, side: THREE.DoubleSide }),
    [],
  )
  useEffect(() => () => accent.dispose(), [accent])
  useEffect(() => {
    accent.color.set(PALETTES[theme].accent)
    accent.emissive.set(PALETTES[theme].accent)
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

  const shown = BODY_LAYERS.filter((l) => props.layers.includes(l.id) && (props.mode !== 'separate' || l.id === 'skeleton'))
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
              <Layer layer={layer} shared={shared} bone={PALETTES[theme].bone} />
            </Suspense>
          ))}
          {props.pin && <PinLabel point={props.pin.point} label={props.pin.label} />}
          <CameraRig view={view} resetKey={resetKey} maxDistance={6} />
        </Canvas>
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

function Layer({ layer, shared, bone }: { layer: BodyLayer; shared: Shared; bone: string }) {
  return (
    <>
      {layer.parts.map((part) => (
        <Part key={part.file} layer={layer} part={part} shared={shared} bone={bone} />
      ))}
    </>
  )
}

/** One model file of a layer: its own material, separation, cut, selection and isolation. */
function Part({ layer, part, shared, bone }: { layer: BodyLayer; part: LayerPart; shared: Shared; bone: string }) {
  const scene = useModelScene(part.file)
  const invalidate = useThree((s) => s.invalidate)
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: layer.id === 'skin' ? 0.7 : 0.55, metalness: 0 }),
    [layer.id],
  )
  useEffect(() => () => material.dispose(), [material])
  const { root, meshes } = useMemo(() => {
    const r = scene.clone(true)
    const list: THREE.Mesh[] = []
    r.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      // Geometry is in body coordinates; the centre is where a bone moves out from when separated.
      m.geometry.computeBoundingBox()
      const c = m.geometry.boundingBox!.getCenter(new THREE.Vector3())
      m.userData.centre = [c.x, c.y, c.z]
      m.userData.layer = layer.id
      list.push(m)
    })
    return { root: r, meshes: list }
  }, [scene, layer.id])

  useEffect(() => {
    for (const m of meshes) shared.registry.set(`${layer.id}:${m.name}`, m)
    return () => {
      for (const m of meshes) shared.registry.delete(`${layer.id}:${m.name}`)
    }
  }, [meshes, layer.id, shared.registry])

  const { mode, amount, selected, isolated, plane, accent } = shared
  useEffect(() => {
    styleMaterial(material, accent, part.colour === 'bone' ? bone : part.colour, mode === 'xray' ? layer.xray : 1, mode === 'cut' ? plane : null)
    arrange(meshes, layer.id, { material, accent, selected, isolated, pickable: mode !== 'xray' || layer.xray >= 0.5, separate: mode === 'separate' ? amount : 0 })
    invalidate()
  }, [mode, amount, selected, isolated, plane, accent, material, meshes, layer, part.colour, bone, invalidate])

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

/** Colour, opacity and cut of a part's material (and of the shared selection material). */
function styleMaterial(material: THREE.MeshStandardMaterial, accent: THREE.Material, colour: string, opacity: number, plane: THREE.Plane | null) {
  material.color.set(colour)
  material.opacity = opacity
  material.transparent = opacity < 1
  material.depthWrite = opacity >= 0.6
  material.side = plane ? THREE.DoubleSide : THREE.FrontSide
  material.clippingPlanes = plane ? [plane] : null
  accent.clippingPlanes = plane ? [plane] : null
  material.needsUpdate = true
  accent.needsUpdate = true
}

/** Selection, isolation, tap targets and bone separation for the meshes of one part. */
function arrange(
  meshes: THREE.Mesh[],
  layer: LayerId,
  o: { material: THREE.Material; accent: THREE.Material; selected: BodyViewerProps['selected']; isolated: boolean; pickable: boolean; separate: number },
) {
  for (const m of meshes) {
    const isSel = !!o.selected && o.selected.layer === layer && o.selected.meshName === m.name
    m.material = isSel ? o.accent : o.material
    m.visible = !o.isolated || isSel
    // See-through layers can't be tapped, so taps reach what lies beneath.
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
