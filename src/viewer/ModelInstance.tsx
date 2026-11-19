import { useGLTF } from '@react-three/drei'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { use, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { ModuleAssets } from '../content/useModule'
import { motion, reducedMotion } from '../lib/motion'
import { publicUrl } from '../lib/paths'
import { trackLoads } from '../state/modelLoads'
import { EMBEDDED_MODELS, loadEmbeddedModel } from './embeddedModel'
import { buildPlaceholder } from './placeholder'
import { Highlighter } from './highlight'
import { glPalette, OrganMaterials, smoothGeometry } from './hud'
import { colourGroupFor } from '../content/colours'
import { useResolvedTheme } from './useResolvedTheme'

const DEG = Math.PI / 180
const DRACO_PATH = publicUrl('draco/') // self-hosted so it works offline
// Our models don't use meshopt; skipping its decoder avoids instantiating WebAssembly for nothing.
const MESHOPT = false

interface InstanceProps {
  assets: ModuleAssets
  highlight: string[]
  /** Explore mode: report the tapped mesh name and the world-space point that was tapped. */
  onPick?: (meshName: string, point: [number, number, number]) => void
  onMatched?: (meshes: THREE.Mesh[]) => void
  /** Mesh keys of a focused region; other meshes are ghosted and can't be tapped. */
  focus?: string[]
  /** Hands over the instance's highlighter once its materials are set up (region framing, plate labels). */
  onReady?: (highlighter: Highlighter) => void
  /** Increases on every right answer: the target turns briefly blue. */
  flash?: number
}

/** Renders a module's model (GLB if present, otherwise primitives) with a highlight. */
export function ModelInstance(props: InstanceProps) {
  const { assets } = props
  return assets.hasModel && assets.info.model ? <GlbModel {...props} file={assets.info.model.file} /> : <PlaceholderInstance {...props} />
}

function GlbModel(props: InstanceProps & { file: string }) {
  return EMBEDDED_MODELS ? <EmbeddedGlb {...props} /> : <FetchedGlb {...props} />
}

function FetchedGlb(props: InstanceProps & { file: string }) {
  const gltf = useGLTF(publicUrl(`models/${props.file}`), DRACO_PATH, MESHOPT, trackLoads)
  return <GlbScene {...props} scene={gltf.scene} />
}

function EmbeddedGlb(props: InstanceProps & { file: string }) {
  const gltf = use(loadEmbeddedModel(props.file))
  return <GlbScene {...props} scene={gltf.scene} />
}

function GlbScene(props: InstanceProps & { scene: THREE.Object3D; file: string }) {
  // Clone per instance (the ghost carousel shows extra copies); geometry stays shared.
  const { scene } = props
  const root = useMemo(() => scene.clone(true), [scene])
  const t = props.assets.info.model
  return (
    <group
      scale={t?.scale ?? 1}
      position={t?.position ?? [0, 0, 0]}
      rotation={(t?.rotation ?? [0, 0, 0]).map((d) => d * DEG) as [number, number, number]}
    >
      <Highlighted key={root.uuid} root={root} {...props} />
    </group>
  )
}

function PlaceholderInstance(props: InstanceProps) {
  const root = useMemo(() => buildPlaceholder(props.assets.placeholder.parts), [props.assets.placeholder])
  return <Highlighted key={root.uuid} root={root} {...props} />
}

function Highlighted({ root, file, highlight, onPick, onMatched, focus, onReady, flash = 0 }: InstanceProps & { root: THREE.Object3D; file?: string }) {
  const theme = useResolvedTheme()
  const invalidate = useThree((s) => s.invalidate)
  const [highlighter] = useState(() => new Highlighter(root, file, glPalette(), focus?.length ? focus : null))
  const fade = useRef({ t: 1, from: 0 })
  const key = highlight.join('|')

  useEffect(() => () => highlighter.dispose(), [highlighter])

  useEffect(() => {
    highlighter.setPalette(glPalette())
    invalidate()
  }, [highlighter, theme, invalidate])

  useEffect(() => {
    const matched = highlighter.apply(key ? key.split('|') : [])
    onMatched?.(matched)
    fade.current = { t: 0, from: performance.now() }
    highlighter.setProgress(0)
    invalidate()
    // onMatched is intentionally not a dependency: it only matters when the highlight changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlighter, key, invalidate])

  useEffect(() => {
    if (!flash || reducedMotion()) return
    highlighter.flash()
    invalidate()
  }, [flash, highlighter, invalidate])

  useEffect(() => {
    onReady?.(highlighter)
    // Called once per instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlighter])

  useFrame(() => {
    if (highlighter.tick()) invalidate()
    const f = fade.current
    if (f.t >= 1) return
    // The target fills in (at once when the system asks for less motion).
    f.t = reducedMotion() ? 1 : Math.min(1, (performance.now() - f.from) / motion('--slow').duration)
    highlighter.setProgress(1 - Math.pow(1 - f.t, 3))
    invalidate()
  })

  const handleClick = onPick
    ? (e: ThreeEvent<MouseEvent>) => {
        if (e.delta > 8) return // was a drag, not a tap
        e.stopPropagation()
        onPick(e.object.name, [e.point.x, e.point.y, e.point.z])
      }
    : undefined

  return <primitive object={root} onClick={handleClick} />
}

/** A faint, non-interactive backdrop model (e.g. the skeleton behind the muscles) that helps orientation. */
export function ContextModel({ file }: { file: string }) {
  return EMBEDDED_MODELS ? <EmbeddedContext file={file} /> : <FetchedContext file={file} />
}

function FetchedContext({ file }: { file: string }) {
  const gltf = useGLTF(publicUrl(`models/${file}`), DRACO_PATH, MESHOPT, trackLoads)
  return <ContextScene scene={gltf.scene} file={file} />
}

function EmbeddedContext({ file }: { file: string }) {
  const gltf = use(loadEmbeddedModel(file))
  return <ContextScene scene={gltf.scene} file={file} />
}

/** The backdrop (the skeleton behind the organs): smooth, faint and in its own colour, never tappable. */
function ContextScene({ scene, file }: { scene: THREE.Object3D; file: string }) {
  const theme = useResolvedTheme()
  const invalidate = useThree((s) => s.invalidate)
  const root = useMemo(() => scene.clone(true), [scene])
  // A new set per theme: the faint colours fade towards the page colour.
  const materials = useMemo(() => (theme ? new OrganMaterials(glPalette().background) : null)!, [theme])
  useEffect(() => {
    root.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      m.geometry = smoothGeometry(m.geometry)
      m.material = materials.get(colourGroupFor(file, m.name), 'ghost')
      m.renderOrder = 3
      m.raycast = () => {} // taps go to the module's own structures
    })
    invalidate()
  }, [root, materials, file, invalidate])
  useEffect(() => () => materials.dispose(), [materials])
  return <primitive object={root} />
}
