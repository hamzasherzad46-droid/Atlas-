import { useGLTF } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Component, Suspense, use, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import { ModelLoading } from '../components/ModelLoading'
import { reducedMotion } from '../lib/motion'
import { publicUrl } from '../lib/paths'
import { trackLoads } from '../state/modelLoads'
import { EMBEDDED_MODELS, loadEmbeddedModel } from './embeddedModel'
import { bearingOf, glPalette, pointMaterial, surfaceArea, surfacePoints } from './hud'
import { SCENE } from './scene'
import { useResolvedTheme } from './useResolvedTheme'
import './viewer.css'

const DPR: [number, number] = [1, 2]
const DRACO_PATH = publicUrl('draco/')
const TARGET = new THREE.Vector3(0, 0.88, 0)
/** Where the turn starts: a three-quarter view from the front left. */
const START_AZ = 30
const DISTANCE = 4.1
const HEIGHT = 1.0
/** Degrees per second of the slow idle turn. */
const TURN_DEG_S = 5
/** Points for the outline (skin) and the bones. */
const SKIN_POINTS = 9000
const BONE_POINTS = 26000

function useFetchedScene(file: string): THREE.Object3D {
  return useGLTF(publicUrl(`models/${file}`), DRACO_PATH, false, trackLoads).scene
}
function useEmbeddedScene(file: string): THREE.Object3D {
  return use(loadEmbeddedModel(file)).scene
}
const useModelScene = EMBEDDED_MODELS ? useEmbeddedScene : useFetchedScene

export interface HeroBodyProps {
  /** The outline and the bones, as model files. */
  skin: string
  bones: string
  /** The camera's bearing, whenever it changes (heading tape, AZ/EL). */
  onBearing(az: number, el: number): void
}

/**
 * The body on Today: the skin as a faint cloud of points in the accent and the skeleton as a denser
 * cloud in the text colour, turning slowly. It is not interactive (the page scrolls over it), and it
 * stops drawing when it is scrolled out of sight.
 */
export default function HeroBody({ skin, bones, onBearing }: HeroBodyProps) {
  const el = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const node = el.current
    if (!node || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(node)
    return () => io.disconnect()
  }, [])
  return (
    <HeroBoundary>
      <div className="viewer hero-viewer" ref={el} aria-hidden>
        <Canvas
          className="viewer-main"
          dpr={DPR}
          // Drawn every frame only while it turns and is on screen.
          frameloop={!visible ? 'never' : reducedMotion() ? 'demand' : 'always'}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          camera={{ fov: 30, near: 0.05, far: 50 }}
          scene={SCENE}
        >
          <Suspense fallback={null}>
            <Cloud skin={skin} bones={bones} onReady={() => setReady(true)} />
          </Suspense>
          <Turn onBearing={onBearing} />
        </Canvas>
        <ModelLoading settling={!ready} />
      </div>
    </HeroBoundary>
  )
}

function Cloud({ skin, bones, onReady }: { skin: string; bones: string; onReady(): void }) {
  const theme = useResolvedTheme()
  const skinScene = useModelScene(skin)
  const boneScene = useModelScene(bones)
  const group = useMemo(() => {
    const p = glPalette()
    const light = theme === 'light'
    const g = new THREE.Group()
    g.add(cloud(skinScene, SKIN_POINTS, pointMaterial(p, light ? 0.45 : 0.42, p.point, !light)))
    g.add(cloud(boneScene, BONE_POINTS, pointMaterial(p, 0.5, p.line, !light)))
    return g
  }, [skinScene, boneScene, theme])
  useEffect(
    () => () =>
      group.traverse((o) => {
        if ((o as THREE.Points).isPoints) ((o as THREE.Points).material as THREE.Material).dispose()
      }),
    [group],
  )
  useEffect(() => onReady(), [group, onReady])
  return <primitive object={group} />
}

/** A model's surfaces as `count` points in all, shared out by area; positions are cached per geometry. */
function cloud(scene: THREE.Object3D, count: number, material: THREE.PointsMaterial): THREE.Group {
  const out = new THREE.Group()
  const meshes: THREE.Mesh[] = []
  scene.updateMatrixWorld(true)
  scene.traverse((o) => (o as THREE.Mesh).isMesh && meshes.push(o as THREE.Mesh))
  const areas = meshes.map(surfaceArea)
  const total = areas.reduce((a, b) => a + b, 0) || 1
  meshes.forEach((m, i) => {
    const n = Math.round((count * areas[i]) / total)
    if (!n) return
    const pts = new THREE.Points(surfacePoints(m, n), material)
    pts.applyMatrix4(m.matrixWorld)
    pts.raycast = () => {}
    out.add(pts)
  })
  return out
}

/** The slow turn around the body, and the bearing for the tape. Still when the system asks for less motion. */
function Turn({ onBearing }: { onBearing(az: number, el: number): void }) {
  const camera = useThree((s) => s.camera)
  const last = useRef({ az: NaN, el: NaN, t: 0, deg: START_AZ })
  useFrame(() => {
    const s = last.current
    const now = performance.now()
    const dt = s.t ? Math.min(0.1, (now - s.t) / 1000) : 0
    s.t = now
    if (!reducedMotion()) s.deg = (s.deg + TURN_DEG_S * dt) % 360
    const a = (s.deg * Math.PI) / 180
    camera.position.set(TARGET.x + Math.sin(a) * DISTANCE, HEIGHT, TARGET.z + Math.cos(a) * DISTANCE)
    camera.lookAt(TARGET)
    const b = bearingOf(camera, TARGET)
    if (b.az !== s.az || b.el !== s.el) {
      s.az = b.az
      s.el = b.el
      onBearing(b.az, b.el)
    }
  })
  return null
}

/** Without WebGL the hero is simply empty: the readouts around it still work. */
class HeroBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}
