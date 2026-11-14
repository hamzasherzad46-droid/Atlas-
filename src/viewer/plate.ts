import * as THREE from 'three'
import type { CameraView, Structure } from '../content/types'
import { meshKeys, meshMatchesAny, meshSide } from '../lib/meshMatch'

/** Keep one side of a bilateral region (side read from the content's mesh keys); midline meshes always stay. */
export function onSide(meshes: THREE.Mesh[], side: 'l' | 'r' | undefined, keys: string[]): THREE.Mesh[] {
  if (!side) return meshes
  const kept = meshes.filter((m) => meshSide(m.name, keys) !== (side === 'l' ? 'r' : 'l'))
  return kept.length ? kept : meshes
}

/** The direction the camera looks from: in front, a little to the right and above. */
export const VIEW_DIR = new THREE.Vector3(0.28, 0.12, 1).normalize()

const round = (v: THREE.Vector3): [number, number, number] => [+v.x.toFixed(3), +v.y.toFixed(3), +v.z.toFixed(3)]

/** A camera view that frames the given meshes on a canvas of this aspect ratio (fov in degrees). */
export function viewForMeshes(meshes: THREE.Mesh[], aspect: number, fov = 35): CameraView | null {
  if (!meshes.length) return null
  const box = new THREE.Box3()
  for (const m of meshes) box.expandByObject(m)
  const centre = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())
  const tan = Math.tan((fov * Math.PI) / 360)
  const fitHeight = size.y / 2 / tan
  const fitWidth = Math.max(size.x, size.z) / 2 / (tan * Math.max(aspect, 0.3))
  const distance = Math.max(fitHeight, fitWidth) * 1.25 + Math.max(size.x, size.z) / 2
  return { position: round(centre.clone().addScaledVector(VIEW_DIR, distance)), target: round(centre) }
}

export interface PlateAnchor {
  id: string
  /** World-space point on the structure's surface. */
  point: [number, number, number]
}

/**
 * One numbered reference per structure, anchored to a real vertex of that structure so the label
 * can only point at the right bone. A structure that merely groups others (carpals = the eight
 * carpal bones) gets no number of its own unless it has parts no other structure names (the body
 * of the sternum, the middle ribs). Bilateral structures are labelled on the side facing the camera.
 */
export function plateAnchors(structures: Structure[], meshes: THREE.Mesh[], side?: 'l' | 'r'): PlateAnchor[] {
  const meshesOf = new Map(structures.map((s) => [s.id, meshes.filter((m) => meshMatchesAny(m.name, meshKeys(s.meshName)))]))
  const anchors: PlateAnchor[] = []
  for (const s of structures) {
    const own = meshesOf.get(s.id) ?? []
    if (!own.length) continue
    const ownSet = new Set(own)
    const covered = new Set<THREE.Mesh>()
    for (const other of structures) {
      if (other.id === s.id) continue
      const theirs = meshesOf.get(other.id) ?? []
      if (theirs.length && theirs.length < own.length && theirs.every((m) => ownSet.has(m))) theirs.forEach((m) => covered.add(m))
    }
    const candidates = onSide(
      own.filter((m) => !covered.has(m)),
      side,
      meshKeys(s.meshName),
    )
    if (!candidates.length) continue
    const mesh = facingMesh(candidates)
    anchors.push({ id: s.id, point: surfacePoint(mesh) })
  }
  return anchors
}

/** Of several meshes, the one whose centre lies furthest towards the camera. */
function facingMesh(meshes: THREE.Mesh[]): THREE.Mesh {
  let best = meshes[0]
  let bestScore = -Infinity
  const c = new THREE.Vector3()
  for (const m of meshes) {
    new THREE.Box3().setFromObject(m).getCenter(c)
    const score = c.dot(VIEW_DIR)
    if (score > bestScore) {
      bestScore = score
      best = m
    }
  }
  return best
}

/** A vertex of the mesh near the middle of its camera-facing side, in world space. */
function surfacePoint(mesh: THREE.Mesh): [number, number, number] {
  mesh.updateWorldMatrix(true, false)
  const box = new THREE.Box3().setFromObject(mesh)
  const centre = box.getCenter(new THREE.Vector3())
  const reach = box.getSize(new THREE.Vector3()).length() / 2
  const aim = centre.clone().addScaledVector(VIEW_DIR, reach)
  const pos = mesh.geometry.getAttribute('position')
  const v = new THREE.Vector3()
  const best = new THREE.Vector3()
  let bestD = Infinity
  // Thin out very dense meshes; a few thousand samples are plenty to find a good surface point.
  const step = Math.max(1, Math.floor(pos.count / 4000))
  for (let i = 0; i < pos.count; i += step) {
    v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld)
    const d = v.distanceToSquared(aim)
    if (d < bestD) {
      bestD = d
      best.copy(v)
    }
  }
  return round(best)
}
