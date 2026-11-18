/**
 * The whole-body model, layer by layer. Every file is in atlas space (metres, Y up, feet at y = 0,
 * the body faces +Z, its right side is −X), so the layers line up without transforms.
 */
export type LayerId = 'skin' | 'muscles' | 'skeleton' | 'organs' | 'arteries' | 'veins' | 'nervous'

export interface LayerPart {
  file: string
}

export interface BodyLayer {
  id: LayerId
  parts: LayerPart[]
  /** In X-ray mode, layers under 0.5 become a faint point cloud and can't be tapped (the outer layers). */
  xray: number
  /** Shown when the body viewer opens. */
  on: boolean
}

export const BODY_LAYERS: BodyLayer[] = [
  { id: 'skin', parts: [{ file: 'body-skin.glb' }], xray: 0.1, on: true },
  { id: 'muscles', parts: [{ file: 'body-muscles.glb' }], xray: 0.22, on: false },
  { id: 'skeleton', parts: [{ file: 'skeleton-context.glb' }], xray: 0.9, on: true },
  {
    id: 'organs',
    // The organ modules' own models, so a tapped organ finds its study notes; glands and eyes come from the body build.
    parts: [
      { file: 'heart.glb' },
      { file: 'airways.glb' },
      { file: 'digestive.glb' },
      { file: 'urinary.glb' },
      { file: 'reproductive.glb' },
      { file: 'body-glands.glb' },
    ],
    xray: 1,
    on: true,
  },
  { id: 'arteries', parts: [{ file: 'body-arteries.glb' }], xray: 1, on: false },
  { id: 'veins', parts: [{ file: 'body-veins.glb' }], xray: 1, on: false },
  { id: 'nervous', parts: [{ file: 'body-nervous.glb' }], xray: 1, on: false },
]

export type BodyMode = 'look' | 'xray' | 'separate' | 'cut'
export type CutAxis = 'transverse' | 'coronal' | 'sagittal'

/** Range of each cut through the body, in metres along its axis. */
export const CUT_RANGE: Record<CutAxis, [number, number]> = {
  transverse: [0.02, 1.72], // feet to vertex
  coronal: [-0.15, 0.15], // back to front
  sagittal: [-0.34, 0.34], // right to left
}

/**
 * The clipping plane for a cut at `t` (0..1 across the range): everything on the far side is removed.
 * Transverse keeps what lies below the cut (looking down on it); coronal keeps the back half;
 * sagittal keeps the right half.
 */
export function cutPlane(axis: CutAxis, t: number): { normal: [number, number, number]; constant: number } {
  const [lo, hi] = CUT_RANGE[axis]
  const at = lo + (hi - lo) * Math.min(1, Math.max(0, t))
  if (axis === 'transverse') return { normal: [0, -1, 0], constant: at }
  if (axis === 'coronal') return { normal: [0, 0, -1], constant: at }
  return { normal: [-1, 0, 0], constant: at }
}

/** Where the bones spread from when separated: the middle of the skeleton. */
export const EXPLODE_ORIGIN: [number, number, number] = [0, 0.86, 0]
/** At full separation each bone sits this much further from the origin than it does in the body. */
export const EXPLODE_MAX = 0.55

/** Offset of a bone whose centre is `c` at separation `k` (0..1): bones move straight out from the origin. */
export function explodeOffset(c: [number, number, number], k: number, origin = EXPLODE_ORIGIN): [number, number, number] {
  const f = Math.min(1, Math.max(0, k)) * EXPLODE_MAX
  return [(c[0] - origin[0]) * f, (c[1] - origin[1]) * f, (c[2] - origin[2]) * f]
}

/** American spellings in the BodyParts3D names, and their British forms (used everywhere else in Atlas). */
const BRITISH: [RegExp, string][] = [
  [/esophag/gi, 'oesophag'],
  [/celiac/gi, 'coeliac'],
  [/cecum/gi, 'caecum'],
  [/cecal/gi, 'caecal'],
  [/hemorrhoid/gi, 'haemorrhoid'],
  [/fiber/gi, 'fibre'],
]

function matchCase(found: string, repl: string): string {
  return found[0] === found[0].toUpperCase() ? repl[0].toUpperCase() + repl.slice(1) : repl
}

/**
 * A readable name for a BodyParts3D part: British spelling, "Set of" dropped and the side moved to
 * the end, e.g. "Long head of left biceps brachii" → "Long head of biceps brachii (left)".
 */
export function displayName(source: string): string {
  let side = ''
  let name = source.replace(/^set of /i, '').replace(/\b(left|right)\b\s*/i, (m) => {
    side = m.trim().toLowerCase()
    return ''
  })
  for (const [re, repl] of BRITISH) name = name.replace(re, (m) => matchCase(m, repl))
  name = name.replace(/\s+/g, ' ').trim()
  name = name.charAt(0).toUpperCase() + name.slice(1)
  return side ? `${name} (${side})` : name
}

/** The body on Today: its outline and its bones, drawn as point clouds. */
export const HERO_MODELS = { skin: 'body-skin.glb', bones: 'skeleton-context.glb' }
