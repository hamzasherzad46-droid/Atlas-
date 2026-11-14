/**
 * Map content `meshName` keys to scene mesh names.
 *
 * Mesh names differ between exporters: Z-Anatomy uses names like "Humerus.l",
 * and three's GLTFLoader strips "." from node names ("Humerusl"). So both sides
 * are reduced to lower-case alphanumerics, and a mesh matches a key if it equals
 * the key or the key followed only by a side/index suffix (l, r, left, right, digits).
 */

export function normalizeMeshName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

const SUFFIX = /^(\d*)(l|r|left|right)?(\d*)$/

/** Side of a mesh read from what follows a matching key ("radiusl" after "radius" → l); null if midline. */
export function meshSide(meshName: string, keys: string[]): 'l' | 'r' | null {
  const m = normalizeMeshName(meshName)
  for (const key of keys) {
    const k = normalizeMeshName(key)
    if (!k || !m.startsWith(k)) continue
    const side = SUFFIX.exec(m.slice(k.length))?.[2]
    if (side) return side.startsWith('l') ? 'l' : 'r'
  }
  return null
}

export function meshMatchesKey(meshName: string, key: string): boolean {
  const m = normalizeMeshName(meshName)
  const k = normalizeMeshName(key)
  if (!k || !m.startsWith(k)) return false
  return SUFFIX.test(m.slice(k.length))
}

export function meshKeys(meshName: string | string[]): string[] {
  return Array.isArray(meshName) ? meshName : [meshName]
}

export function meshMatchesAny(meshName: string, keys: string[]): boolean {
  return keys.some((k) => meshMatchesKey(meshName, k))
}

/**
 * The structure a tapped mesh belongs to, preferring the most specific one: "scaphoid" over the
 * group "carpals", "first rib" over "ribs". The longest matching key wins; ties go to the
 * structure with fewer keys.
 */
export function mostSpecific<T extends { meshName: string | string[] }>(meshName: string, structures: T[]): T | undefined {
  let best: T | undefined
  let bestLen = -1
  let bestCount = Infinity
  for (const s of structures) {
    const keys = meshKeys(s.meshName)
    let len = -1
    for (const k of keys) if (meshMatchesKey(meshName, k)) len = Math.max(len, normalizeMeshName(k).length)
    if (len < 0) continue
    if (len > bestLen || (len === bestLen && keys.length < bestCount)) {
      best = s
      bestLen = len
      bestCount = keys.length
    }
  }
  return best
}
