import * as THREE from 'three'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { ColourGroup } from '../content/colours'

/**
 * How the 3D is drawn: every structure smooth and in the colour of its organ or tissue
 * (content/colours.json), point clouds for the outer layers in X-ray and on Today, and the target the
 * one bright white object with a glowing rim while everything else dims. Theme colours come from the
 * CSS tokens (`--gl-*` and `--bg` in global.css), read once per theme.
 */
export interface GlPalette {
  /** The page colour, which dimmed organs fade towards. */
  background: string
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
    background: v('--bg', '#000000'),
    line: v('--gl-line', '#ffffff'),
    lineOpacity: Number(v('--gl-line-opacity', '0.13')),
    point: v('--gl-point', '#8fb8ff'),
    target: v('--gl-target', '#ffffff'),
    rim: v('--gl-rim', '#8fb8ff'),
    accent: v('--accent', '#8fb8ff'),
  }
}

/**
 * The structure asked about (or selected): bright white, softly lit, with a glowing fresnel rim and a
 * little light of its own, so it stands out from the coloured organs around it. A standard material
 * (so clipping and lights work) with the rim added to its shader.
 */
export function solidMaterial(palette: GlPalette): THREE.MeshStandardMaterial & { userData: { rim: { value: THREE.Color }; rimStrength: { value: number } } } {
  const m = new THREE.MeshStandardMaterial({
    color: palette.target,
    roughness: 0.5,
    metalness: 0,
    side: THREE.DoubleSide,
    emissive: palette.target,
    emissiveIntensity: GLOW.emissive,
  })
  const rim = { value: new THREE.Color(palette.rim) }
  const rimStrength = { value: GLOW.rim }
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

/** How strongly the target glows: its own light, and its rim. */
const GLOW = { emissive: 0.12, rim: 0.95 }

/**
 * The same shape with shared vertices and smooth normals, so curved surfaces shade smoothly instead
 * of in facets. Computed once per geometry and shared by every model that uses it.
 */
const smoothed = new WeakMap<THREE.BufferGeometry, THREE.BufferGeometry>()
const isSmooth = new WeakSet<THREE.BufferGeometry>()
export function smoothGeometry(g: THREE.BufferGeometry): THREE.BufferGeometry {
  if (isSmooth.has(g)) return g
  let s = smoothed.get(g)
  if (!s) {
    const copy = new THREE.BufferGeometry()
    copy.setAttribute('position', g.getAttribute('position'))
    if (g.index) copy.setIndex(g.index)
    s = mergeVertices(copy, 1e-5)
    s.computeVertexNormals()
    s.computeBoundingBox()
    s.computeBoundingSphere()
    smoothed.set(g, s)
    isSmooth.add(s)
  }
  return s
}

/** How each organ is drawn: in its own colour; dimmed when something else is the target; faint outside a focused region. */
export type Shade = 'normal' | 'dim' | 'ghost'

/** Dimmed organs keep a trace of their colour, see-through so the target shows through them. */
const DIM = { towardBackground: 0.5, opacity: 0.18, ghostOpacity: 0.07 }

/**
 * The materials of one 3D view, one per organ colour and shade, made when first needed and disposed
 * together. Each view has its own, because a cut sets clipping planes on them.
 */
export class OrganMaterials {
  private cache = new Map<string, THREE.MeshStandardMaterial>()
  constructor(private background: string) {}

  get(group: ColourGroup, shade: Shade): THREE.MeshStandardMaterial {
    const key = `${group.id}|${shade}`
    let m = this.cache.get(key)
    if (!m) {
      const colour = new THREE.Color(group.colour)
      if (shade !== 'normal') colour.lerp(new THREE.Color(this.background), DIM.towardBackground)
      const opacity = shade === 'normal' ? group.opacity : group.opacity * (shade === 'dim' ? DIM.opacity : DIM.ghostOpacity)
      m = new THREE.MeshStandardMaterial({
        color: colour,
        roughness: 0.62,
        metalness: 0,
        side: THREE.DoubleSide,
        transparent: opacity < 1,
        opacity,
        depthWrite: opacity >= 1,
      })
      this.cache.set(key, m)
    }
    return m
  }

  all(): THREE.MeshStandardMaterial[] {
    return [...this.cache.values()]
  }

  dispose() {
    for (const m of this.cache.values()) m.dispose()
    this.cache.clear()
  }
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
