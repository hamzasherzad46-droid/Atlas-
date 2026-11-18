import { create } from 'zustand'
import type { GLTFLoader } from 'three-stdlib'

/** One model file on its way: bytes so far, the size if the server said, and whether it is ready. */
interface Load {
  loaded: number
  total: number
  done: boolean
}

interface ModelLoads {
  loads: Record<string, Load>
  /** What the screen shows (see loadProgress): it never goes backwards while models are loading. */
  shown: number | null | undefined
}

/** Downloads of 3D models, by URL, so the screen can show real progress instead of a spinner. */
export const useModelLoads = create<ModelLoads>(() => ({ loads: {}, shown: undefined }))

function update(url: string, patch: Partial<Load>) {
  useModelLoads.setState((s) => {
    const loads = { ...s.loads, [url]: { ...(s.loads[url] ?? { loaded: 0, total: 0, done: false }), ...patch } }
    const now = loadProgress(loads)
    // A second model starting (the faint skeleton behind the muscles, say) adds to the total; hold the figure rather than step back.
    // Until its size is known, a new download keeps the figure where it was.
    const before = typeof s.shown === 'number' ? s.shown : null
    const shown = now === undefined ? undefined : now === null ? before : Math.max(before ?? 0, now)
    return { loads, shown }
  })
}

const tracked = new WeakSet<GLTFLoader>()

/**
 * A loader extension for drei's useGLTF: reports each model's download as its bytes arrive. Models
 * already in memory are never loaded again, so they never show progress.
 */
export function trackLoads(loader: GLTFLoader) {
  if (tracked.has(loader)) return
  tracked.add(loader)
  const load = loader.load.bind(loader)
  loader.load = (url, onLoad, onProgress, onError) => {
    update(url, { loaded: 0, total: 0, done: false })
    load(
      url,
      (gltf) => {
        update(url, { done: true })
        onLoad(gltf)
      },
      (e) => {
        update(url, { loaded: e.loaded, total: e.lengthComputable ? e.total : 0 })
        onProgress?.(e)
      },
      (err) => {
        update(url, { done: true })
        onError?.(err)
      },
    )
  }
}

/**
 * Progress of the models still loading: a fraction from 0 to 1, null if a size is unknown, or
 * undefined when nothing is loading. Held just short of 1 until the model is decoded and ready.
 */
export function loadProgress(loads: Record<string, Load>): number | null | undefined {
  const open = Object.values(loads).filter((l) => !l.done)
  if (!open.length) return undefined
  if (open.some((l) => !l.total)) return null
  const loaded = open.reduce((n, l) => n + l.loaded, 0)
  const total = open.reduce((n, l) => n + l.total, 0)
  return Math.min(0.99, loaded / total)
}
