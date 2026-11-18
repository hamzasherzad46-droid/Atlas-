import { beforeEach, describe, expect, it } from 'vitest'
import type { GLTFLoader } from 'three-stdlib'
import { loadProgress, trackLoads, useModelLoads } from './modelLoads'

type Progress = (e: ProgressEvent) => void
/** A stand-in loader whose downloads the test drives by hand. */
function fakeLoader() {
  const calls: { url: string; onLoad: (d: unknown) => void; onProgress?: Progress }[] = []
  const loader = { load: (url: string, onLoad: (d: unknown) => void, onProgress?: Progress) => calls.push({ url, onLoad, onProgress }) }
  trackLoads(loader as unknown as GLTFLoader)
  return { loader: loader as unknown as GLTFLoader, calls }
}
const progress = (loaded: number, total: number) => ({ loaded, total, lengthComputable: total > 0 }) as ProgressEvent

describe('model download progress', () => {
  beforeEach(() => useModelLoads.setState({ loads: {}, shown: undefined }))

  it('reports the real fraction of bytes, held short of done until the model is ready', () => {
    const { loader, calls } = fakeLoader()
    loader.load('a.glb', () => {})
    expect(useModelLoads.getState().shown).toBeNull()
    calls[0].onProgress?.(progress(250, 1000))
    expect(useModelLoads.getState().shown).toBe(0.25)
    calls[0].onProgress?.(progress(1000, 1000))
    expect(useModelLoads.getState().shown).toBe(0.99)
    calls[0].onLoad({})
    expect(useModelLoads.getState().shown).toBeUndefined()
  })

  it('never steps back when a second model starts, and says nothing about sizes it does not know', () => {
    const { loader, calls } = fakeLoader()
    loader.load('a.glb', () => {})
    calls[0].onProgress?.(progress(800, 1000))
    loader.load('b.glb', () => {})
    calls[1].onProgress?.(progress(0, 1000))
    expect(useModelLoads.getState().shown).toBe(0.8)
    expect(loadProgress({ x: { loaded: 5, total: 0, done: false } })).toBeNull()
  })

  it('wraps a loader only once, however often the extension runs', () => {
    const { loader, calls } = fakeLoader()
    trackLoads(loader)
    trackLoads(loader)
    loader.load('a.glb', () => {})
    expect(calls).toHaveLength(1)
    expect(Object.keys(useModelLoads.getState().loads)).toEqual(['a.glb'])
  })
})
