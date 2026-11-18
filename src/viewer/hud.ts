import * as THREE from 'three'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'

/**
 * The HUD look for 3D: context drawn as fine edge lines (or a point cloud), the target the one solid,
 * softly lit object with a faint rim. Colours come from the CSS tokens (`--gl-*` in global.css), read
 * once per theme, so nothing here hard-codes the palette.
 */
export interface GlPalette {
  line: string
  lineOpacity: number
  point: string
  target: string
  rim: string
  accent: string
}

export function glPalette(): GlPalette {
  const css = getComputedStyle(document.documentElement)
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback
  return {
    line: v('--gl-line', '#ffffff'),
    lineOpacity: Number(v('--gl-line-opacity', '0.13')),
    point: v('--gl-point', '#8fb8ff'),
    target: v('--gl-target', '#ffffff'),
    rim: v('--gl-rim', '#8fb8ff'),
    accent: v('--accent', '#8fb8ff'),
  }
}

/** Feature edges of a geometry at a given crease angle, computed once and shared by every model that uses it. */
const edgeCache = new WeakMap<THREE.BufferGeometry, Map<number, THREE.EdgesGeometry>>()
export const EDGE_ANGLE = 18

function edgesOf(geometry: THREE.BufferGeometry, angle: number): THREE.EdgesGeometry {
  let byAngle = edgeCache.get(geometry)
  if (!byAngle) edgeCache.set(geometry, (byAngle = new Map()))
  let e = byAngle.get(angle)
  if (!e) {
    e = new THREE.EdgesGeometry(geometry, angle)
    byAngle.set(angle, e)
  }
  return e
}

const hasEdges = (g: THREE.BufferGeometry, angle: number) => !!edgeCache.get(g)?.has(angle)

/**
 * Builds edge lines for many meshes without freezing the screen: a few milliseconds of work per
 * frame, the closest work first, then `onProgress` so the canvas can redraw as the drawing fills in.
 */
export class EdgeBuilder {
  private queue: THREE.Mesh[]
  private cancelled = false
  readonly lines = new Map<THREE.Mesh, THREE.LineSegments>()

  constructor(
    meshes: THREE.Mesh[],
    private material: (mesh: THREE.Mesh) => THREE.LineBasicMaterial,
    private onProgress: () => void,
    /** A wider crease angle draws fewer lines (dense whole-body layers). */
    private angle = EDGE_ANGLE,
    private budgetMs = 6,
  ) {
    // Meshes whose edges are already cached are drawn at once.
    this.queue = meshes.filter((m) => {
      if (!hasEdges(m.geometry, angle)) return true
      this.attach(m)
      return false
    })
    if (this.queue.length) requestAnimationFrame(() => this.step())
  }

  private attach(m: THREE.Mesh) {
    const lines = new THREE.LineSegments(edgesOf(m.geometry, this.angle), this.material(m))
    lines.raycast = () => {}
    lines.renderOrder = 2
    m.add(lines)
    this.lines.set(m, lines)
  }

  private step() {
    if (this.cancelled) return
    const start = performance.now()
    while (this.queue.length && performance.now() - start < this.budgetMs) this.attach(this.queue.shift()!)
    this.onProgress()
    if (this.queue.length) requestAnimationFrame(() => this.step())
  }

  get done() {
    return this.queue.length === 0
  }

  dispose() {
    this.cancelled = true
    // The edge geometries stay cached for the next model that shares them.
    for (const l of this.lines.values()) l.removeFromParent()
    this.lines.clear()
  }
}

/**
 * The one solid object: lit softly by the scene's lights, with a faint fresnel rim. A standard
 * material (so clipping and lights work) with the rim added to its shader.
 */
export function solidMaterial(palette: GlPalette): THREE.MeshStandardMaterial & { userData: { rim: { value: THREE.Color }; rimStrength: { value: number } } } {
  const m = new THREE.MeshStandardMaterial({ color: palette.target, roughness: 0.62, metalness: 0, side: THREE.DoubleSide })
  const rim = { value: new THREE.Color(palette.rim) }
  const rimStrength = { value: 0.55 }
  m.userData.rim = rim
  m.userData.rimStrength = rimStrength
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uRim = rim
    shader.uniforms.uRimStrength = rimStrength
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec3 uRim;\nuniform float uRimStrength;')
      .replace(
        '#include <opaque_fragment>',
        'float hudRim = pow(1.0 - clamp(abs(dot(normal, normalize(vViewPosition))), 0.0, 1.0), 2.5);\noutgoingLight += uRim * hudRim * uRimStrength;\n#include <opaque_fragment>',
      )
  }
  return m as ReturnType<typeof solidMaterial>
}

/** Fine lines for the context. */
export function lineMaterial(palette: GlPalette, scale = 1): THREE.LineBasicMaterial {
  return new THREE.LineBasicMaterial({
    color: palette.line,
    transparent: true,
    opacity: palette.lineOpacity * scale,
    depthWrite: false,
  })
}

/** A barely-there surface under the lines, so the model has presence while its edges are drawn. */
export function fillMaterial(palette: GlPalette, opacity = 0.035): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({ color: palette.line, transparent: true, opacity, depthWrite: false })
}

/** Points spread evenly over a mesh's surface (by area), in the mesh's own space, cached per geometry. */
const pointCache = new WeakMap<THREE.BufferGeometry, Map<number, THREE.BufferGeometry>>()

export function surfacePoints(mesh: THREE.Mesh, count: number): THREE.BufferGeometry {
  let byCount = pointCache.get(mesh.geometry)
  if (!byCount) pointCache.set(mesh.geometry, (byCount = new Map()))
  let g = byCount.get(count)
  if (!g) {
    const sampler = new MeshSurfaceSampler(mesh).build()
    const arr = new Float32Array(count * 3)
    const v = new THREE.Vector3()
    for (let i = 0; i < count; i++) {
      sampler.sample(v)
      arr.set([v.x, v.y, v.z], i * 3)
    }
    g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    byCount.set(count, g)
  }
  return g
}

/** Surface area of a mesh in world units (scaled by its world matrix), for sharing a point budget. */
export function surfaceArea(mesh: THREE.Mesh): number {
  const p = mesh.geometry.attributes.position
  const idx = mesh.geometry.index
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  mesh.updateWorldMatrix(true, false)
  let sum = 0
  const n = idx ? idx.count : p.count
  for (let i = 0; i < n; i += 3) {
    a.fromBufferAttribute(p, idx ? idx.getX(i) : i).applyMatrix4(mesh.matrixWorld)
    b.fromBufferAttribute(p, idx ? idx.getX(i + 1) : i + 1).applyMatrix4(mesh.matrixWorld)
    c.fromBufferAttribute(p, idx ? idx.getX(i + 2) : i + 2).applyMatrix4(mesh.matrixWorld)
    sum += b.sub(a).cross(c.sub(a)).length() / 2
  }
  return sum
}

export function pointMaterial(palette: GlPalette, opacity: number, colour = palette.point, additive = true): THREE.PointsMaterial {
  return new THREE.PointsMaterial({
    color: colour,
    size: 1.4,
    sizeAttenuation: false,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  })
}

/** Camera bearing around the target: azimuth 0–359 (0 = facing the front) and elevation in degrees. */
export function bearingOf(camera: THREE.Camera, target: THREE.Vector3): { az: number; el: number } {
  const d = camera.position.clone().sub(target)
  const az = Math.round(((Math.atan2(d.x, d.z) * 180) / Math.PI + 360) % 360)
  const el = Math.round((Math.atan2(d.y, Math.hypot(d.x, d.z)) * 180) / Math.PI)
  return { az, el }
}
