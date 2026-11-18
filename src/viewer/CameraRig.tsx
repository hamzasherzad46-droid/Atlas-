import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useImperativeHandle, useRef, type ComponentRef, type Ref } from 'react'
import * as THREE from 'three'
import type { CameraView } from '../content/types'
import { reducedMotion } from '../lib/motion'
import { bearingOf } from './hud'

export interface CameraApi {
  getView(): CameraView
}

interface Props {
  view: CameraView
  /** Change to re-run the move to `view` (double-tap reset). */
  resetKey: number
  apiRef?: Ref<CameraApi>
  durationMs?: number
  /** Furthest zoom out, in metres (the whole body needs more room than one module). */
  maxDistance?: number
  /**
   * What the camera does when left alone for a few seconds: a slow turn around the body, a gentle
   * sway either side of a question's framing, or nothing. Never with reduced motion.
   */
  idle?: 'turn' | 'sway' | 'off'
  /** The camera's bearing, whenever it changes (heading tape and AZ/EL readouts). */
  onBearing?: (az: number, el: number) => void
}

/** Seconds of stillness before the idle motion starts. */
const IDLE_AFTER_MS = 4000
/** A full slow turn: degrees per second. */
const TURN_DEG_S = 5
/** The sway: degrees either side, and seconds for one swing there and back. */
const SWAY_DEG = 12
const SWAY_S = 14
/** The idle motion eases in over this long. */
const IDLE_EASE_MS = 1500
const UP = new THREE.Vector3(0, 1, 0)

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const round = (v: THREE.Vector3) => v.toArray().map((n) => Math.round(n * 1000) / 1000) as [number, number, number]

/** Orbit controls (drag/pinch) plus smooth camera moves to each question's framing. */
export function CameraRig({ view, resetKey, apiRef, durationMs = 1000, maxDistance = 4, idle = 'off', onBearing }: Props) {
  const camera = useThree((s) => s.camera)
  const invalidate = useThree((s) => s.invalidate)
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null)
  const tween = useRef<Tween | null>(null)
  const first = useRef(true)
  const viewKey = JSON.stringify(view)
  // Idle motion: when the camera was last moved by the student or a tween, and the motion's own clock.
  const still = useRef<Stillness>({ since: 0, dragging: false, start: 0, last: 0, angle: 0 })
  const bearing = useRef({ az: NaN, el: NaN })
  const wake = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const settle = () => {
    still.current.since = performance.now()
    still.current.start = 0
    clearTimeout(wake.current)
    if (idle !== 'off') wake.current = setTimeout(invalidate, IDLE_AFTER_MS + 16)
  }
  useEffect(() => () => clearTimeout(wake.current), [])

  useImperativeHandle(apiRef, () => ({
    getView: () => ({ position: round(camera.position), target: round(controls.current?.target ?? new THREE.Vector3()) }),
  }))

  useEffect(() => {
    const v = JSON.parse(viewKey) as CameraView
    const p1 = new THREE.Vector3(...v.position)
    const t1 = new THREE.Vector3(...v.target)
    const c = controls.current
    if (first.current || !c || reducedMotion()) {
      // Jump straight to the first view (and to every view when the system asks for less motion).
      first.current = false
      camera.position.copy(p1)
      c?.target.copy(t1)
      c?.update()
      invalidate()
      return
    }
    tween.current = { from: performance.now(), p0: camera.position.clone(), t0: c.target.clone(), p1, t1 }
    still.current.start = 0
    invalidate()
  }, [viewKey, resetKey, camera, invalidate])

  // Start counting stillness from the first frame (and again whenever the idle kind changes).
  useEffect(() => {
    still.current.since = performance.now()
    still.current.start = 0
    clearTimeout(wake.current)
    if (idle !== 'off') wake.current = setTimeout(invalidate, IDLE_AFTER_MS + 16)
  }, [idle, invalidate])

  useFrame(() => {
    const c = controls.current
    if (!c) return
    if (tween.current) {
      if (tweenStep(camera, c, tween.current, durationMs)) {
        tween.current = null
        settle()
      }
      invalidate()
    } else if (idle !== 'off' && !reducedMotion() && driftStep(camera, c, still.current, idle)) invalidate()
    if (onBearing) {
      const b = bearingOf(camera, c.target)
      if (b.az !== bearing.current.az || b.el !== bearing.current.el) {
        bearing.current = b
        onBearing(b.az, b.el)
      }
    }
  })

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.12}
      enablePan={false}
      rotateSpeed={0.7}
      zoomSpeed={0.8}
      minDistance={0.12}
      maxDistance={maxDistance}
      onStart={() => {
        still.current.dragging = true
        still.current.start = 0
      }}
      onEnd={() => {
        still.current.dragging = false
        settle()
      }}
    />
  )
}

type Controls = { target: THREE.Vector3; enabled: boolean; update(): void }
type Stillness = { since: number; dragging: boolean; start: number; last: number; angle: number }
type Tween = { from: number; p0: THREE.Vector3; t0: THREE.Vector3; p1: THREE.Vector3; t1: THREE.Vector3 }

/** One frame of a move to a new framing; true when it has arrived. */
function tweenStep(camera: THREE.Camera, c: Controls, tw: Tween, durationMs: number): boolean {
  const raw = Math.min(1, (performance.now() - tw.from) / durationMs)
  const k = easeInOut(raw)
  // Move along an arc around the target rather than cutting through the model.
  const target = tw.t0.clone().lerp(tw.t1, k)
  const d0 = tw.p0.clone().sub(tw.t0)
  const d1 = tw.p1.clone().sub(tw.t1)
  const len = THREE.MathUtils.lerp(d0.length(), d1.length(), k)
  const dir = d0.normalize().lerp(d1.normalize(), k)
  if (dir.lengthSq() < 1e-6) dir.copy(d1).normalize()
  camera.position.copy(target).add(dir.normalize().multiplyScalar(len))
  c.target.copy(target)
  c.enabled = raw >= 1
  c.update()
  return raw >= 1
}

/**
 * One frame of the slow idle turn or sway, eased in and applied as a small step so a drag can take
 * over at any moment. False while the camera should stay still.
 */
function driftStep(camera: THREE.Camera, c: Controls, s: Stillness, idle: 'turn' | 'sway'): boolean {
  const now = performance.now()
  if (s.dragging || now - s.since < IDLE_AFTER_MS) return false
  if (!s.start) {
    s.start = now
    s.last = now
    s.angle = 0
  }
  const t = now - s.start
  const ease = Math.min(1, t / IDLE_EASE_MS)
  let delta: number
  if (idle === 'turn') delta = ((TURN_DEG_S * Math.PI) / 180) * ease * ((now - s.last) / 1000)
  else {
    const angle = ((SWAY_DEG * Math.PI) / 180) * Math.sin((2 * Math.PI * t) / (SWAY_S * 1000)) * ease
    delta = angle - s.angle
    s.angle = angle
  }
  s.last = now
  const offset = camera.position.clone().sub(c.target).applyAxisAngle(UP, delta)
  camera.position.copy(c.target).add(offset)
  c.update()
  return true
}
