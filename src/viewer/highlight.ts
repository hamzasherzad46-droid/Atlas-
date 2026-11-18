import * as THREE from 'three'
import { meshMatchesAny } from '../lib/meshMatch'
import { EdgeBuilder, fillMaterial, lineMaterial, solidMaterial, type GlPalette } from './hud'

const noRaycast = () => {}

/** Lines outside a focused region: a third as strong, so the region reads first. */
const GHOST_LINES = 0.35
/** How long a right answer's blue lasts on the target. */
const FLASH_MS = 700

/**
 * Owns the materials of one model instance, in the HUD style: every structure is drawn as fine
 * edge lines over a barely-there surface, and the meshes matching `keys` become the one solid,
 * softly lit object. `progress` (0..1) fades the target in so camera moves and the highlight feel
 * like one motion; `flash()` turns it briefly blue after a right answer.
 */
export class Highlighter {
  readonly target: ReturnType<typeof solidMaterial>
  private readonly fill: THREE.MeshBasicMaterial
  private readonly ghostFill: THREE.MeshBasicMaterial
  private readonly lines: THREE.LineBasicMaterial
  private readonly ghostLines: THREE.LineBasicMaterial
  private readonly edges: EdgeBuilder
  private meshes: THREE.Mesh[] = []
  private hits = new Set<THREE.Mesh>()
  private palette: GlPalette
  private flashFrom = -Infinity

  constructor(
    root: THREE.Object3D,
    palette: GlPalette,
    onProgress: () => void,
    /** Mesh keys of a focused region; everything else is drawn fainter and can't be tapped. */
    private focus: string[] | null = null,
  ) {
    this.palette = palette
    this.target = solidMaterial(palette)
    this.fill = fillMaterial(palette)
    this.ghostFill = fillMaterial(palette, 0.012)
    this.lines = lineMaterial(palette)
    this.ghostLines = lineMaterial(palette, GHOST_LINES)
    root.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) this.meshes.push(o as THREE.Mesh)
    })
    // The focused region is drawn first.
    const ordered = [...this.meshes].sort((a, b) => Number(!this.inFocus(a)) - Number(!this.inFocus(b)))
    this.edges = new EdgeBuilder(ordered, (m) => (this.inFocus(m) ? this.lines : this.ghostLines), () => {
      for (const m of this.hits) this.edges.lines.get(m)?.removeFromParent()
      onProgress()
    })
  }

  /** Meshes in the focused region (all meshes when there is no focus). */
  focusMeshes(): THREE.Mesh[] {
    return this.meshes.filter((m) => this.inFocus(m))
  }

  private inFocus(m: THREE.Mesh): boolean {
    return !this.focus || meshMatchesAny(m.name, this.focus)
  }

  setPalette(palette: GlPalette) {
    this.palette = palette
    this.target.color.set(palette.target)
    this.target.userData.rim.value.set(palette.rim)
    this.fill.color.set(palette.line)
    this.ghostFill.color.set(palette.line)
    this.lines.color.set(palette.line)
    this.lines.opacity = palette.lineOpacity
    this.ghostLines.color.set(palette.line)
    this.ghostLines.opacity = palette.lineOpacity * GHOST_LINES
  }

  /** Returns the matched meshes. */
  apply(keys: string[]): THREE.Mesh[] {
    this.hits.clear()
    const matched: THREE.Mesh[] = []
    for (const m of this.meshes) {
      const hit = keys.length > 0 && meshMatchesAny(m.name, keys)
      const focused = this.inFocus(m)
      m.material = hit ? this.target : focused ? this.fill : this.ghostFill
      m.renderOrder = hit ? 0 : focused ? 1 : 4
      m.raycast = focused ? THREE.Mesh.prototype.raycast : noRaycast
      const lines = this.edges.lines.get(m)
      if (hit) {
        matched.push(m)
        this.hits.add(m)
        lines?.removeFromParent()
      } else if (lines && !lines.parent) m.add(lines)
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
        return true
      }
      return false
    }
    // Rises quickly, eases back to white.
    const amount = k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8
    this.target.color.set(this.palette.target).lerp(new THREE.Color(this.palette.accent), Math.max(0, amount))
    return true
  }

  /** Bounding box of the matched meshes, in root's parent space. */
  static boundsOf(meshes: THREE.Mesh[]): THREE.Box3 {
    const box = new THREE.Box3()
    for (const m of meshes) box.expandByObject(m)
    return box
  }

  dispose() {
    this.edges.dispose()
    this.target.dispose()
    this.fill.dispose()
    this.ghostFill.dispose()
    this.lines.dispose()
    this.ghostLines.dispose()
  }
}
