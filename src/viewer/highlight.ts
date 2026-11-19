import * as THREE from 'three'
import { colourGroupFor, type ColourGroup } from '../content/colours'
import { meshMatchesAny } from '../lib/meshMatch'
import { OrganMaterials, smoothGeometry, solidMaterial, type GlPalette } from './hud'

const noRaycast = () => {}

/** How long a right answer's blue lasts on the target. */
const FLASH_MS = 700

/**
 * Owns the materials of one model instance. Every structure is drawn smooth, in the colour of its
 * organ or tissue (content/colours.json). The meshes matching `keys` become the one bright white,
 * glowing object and everything else dims, so the colours never compete with the question.
 * `progress` (0..1) fades the target in with the camera move; `flash()` turns it briefly blue after
 * a right answer.
 */
export class Highlighter {
  readonly target: ReturnType<typeof solidMaterial>
  private materials: OrganMaterials
  private meshes: THREE.Mesh[] = []
  private groups = new Map<THREE.Mesh, ColourGroup>()
  private palette: GlPalette
  private flashFrom = -Infinity
  private keys: string[] = []

  constructor(
    root: THREE.Object3D,
    /** The model file, for colours that depend on it (a bone file's meshes are bone). */
    file: string | undefined,
    palette: GlPalette,
    /** Mesh keys of a focused region; everything else is drawn faint and can't be tapped. */
    private focus: string[] | null = null,
  ) {
    this.palette = palette
    this.target = solidMaterial(palette)
    this.materials = new OrganMaterials(palette.background)
    root.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      m.geometry = smoothGeometry(m.geometry)
      this.meshes.push(m)
      this.groups.set(m, colourGroupFor(file, m.name))
    })
  }

  /** Meshes in the focused region (all meshes when there is no focus). */
  focusMeshes(): THREE.Mesh[] {
    return this.meshes.filter((m) => this.inFocus(m))
  }

  /** The colour groups on show, for the colour key. */
  visibleGroups(): string[] {
    return [...new Set(this.focusMeshes().map((m) => this.groups.get(m)!.id))]
  }

  private inFocus(m: THREE.Mesh): boolean {
    return !this.focus || meshMatchesAny(m.name, this.focus)
  }

  /** A new theme: the dimmed colours fade towards a different page colour. */
  setPalette(palette: GlPalette) {
    this.palette = palette
    this.target.color.set(palette.target)
    this.target.emissive.set(palette.target)
    this.target.userData.rim.value.set(palette.rim)
    this.materials.dispose()
    this.materials = new OrganMaterials(palette.background)
    this.apply(this.keys)
  }

  /** Returns the matched meshes. */
  apply(keys: string[]): THREE.Mesh[] {
    this.keys = keys
    const matched: THREE.Mesh[] = []
    const anyTarget = keys.length > 0
    for (const m of this.meshes) {
      const hit = anyTarget && meshMatchesAny(m.name, keys)
      const focused = this.inFocus(m)
      const group = this.groups.get(m)!
      m.material = hit ? this.target : this.materials.get(group, !focused ? 'ghost' : anyTarget ? 'dim' : 'normal')
      // The target draws first, then see-through organs over it in a stable order.
      m.renderOrder = hit ? 0 : focused ? 1 : 2
      m.raycast = focused ? THREE.Mesh.prototype.raycast : noRaycast
      if (hit) matched.push(m)
    }
    return matched
  }

  setProgress(t: number) {
    this.target.transparent = t < 1
    this.target.opacity = t
    this.target.depthWrite = t >= 1
  }

  /** A right answer: the target turns blue for a moment. */
  flash(now = performance.now()) {
    this.flashFrom = now
  }

  /** Advances the flash; true while it is still changing (the canvas should draw again). */
  tick(now = performance.now()): boolean {
    const k = (now - this.flashFrom) / FLASH_MS
    if (k < 0 || k > 1) {
      if (k > 1 && this.flashFrom !== -Infinity) {
        this.flashFrom = -Infinity
        this.target.color.set(this.palette.target)
        this.target.emissive.set(this.palette.target)
        return true
      }
      return false
    }
    // Rises quickly, eases back to white.
    const amount = Math.max(0, k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8)
    const blue = new THREE.Color(this.palette.accent)
    this.target.color.set(this.palette.target).lerp(blue, amount)
    this.target.emissive.set(this.palette.target).lerp(blue, amount)
    return true
  }

  /** Bounding box of the matched meshes, in root's parent space. */
  static boundsOf(meshes: THREE.Mesh[]): THREE.Box3 {
    const box = new THREE.Box3()
    for (const m of meshes) box.expandByObject(m)
    return box
  }

  dispose() {
    this.target.dispose()
    this.materials.dispose()
  }
}
