import catalogJson from '../../content/catalog.json'
import coursesJson from '../../content/courses.json'
import { buildFocusModules, findCourse } from './courses'
import { publicUrl } from '../lib/paths'
import type { Body, Catalog, Course, Courses, Curriculum, MockBank, ModuleContent, ModuleInfo, PlaceholderModel, Plates } from './types'

export const catalog = catalogJson as Catalog

export const systemModules: ModuleInfo[] = catalog.systems.flatMap((sys) => sys.modules.map((m) => ({ ...m, systemId: sys.id })))

export const regionModules: ModuleInfo[] = (catalog.regions ?? []).flatMap((g) => g.modules.map((m) => ({ ...m, group: g.id })))

/** Courses and their focus modules (content/courses.json). */
export const courses = coursesJson as Courses

export const focusModules: ModuleInfo[] = buildFocusModules(courses, systemModules)

export const allModules: ModuleInfo[] = [...focusModules, ...regionModules, ...systemModules]

export function getCourse(id: string): Course {
  return findCourse(courses, id)
}

export function getModuleInfo(id: string): ModuleInfo | undefined {
  return allModules.find((m) => m.id === id)
}

/** The module to show for this body: a module taught on both bodies is swapped for its counterpart. */
export function moduleForBody(id: string, body: Body): string {
  const m = getModuleInfo(id)
  return m?.body && m.counterpart && m.body !== body ? m.counterpart : id
}

/** Whether a module belongs in lists for this body (modules taught on one body only always do). */
export const shownForBody = (m: ModuleInfo, body: Body) => !m.body || m.body === body

// Each module's JSON becomes its own lazily loaded chunk.
const files = import.meta.glob<{ default: unknown }>(['../../content/*.json', '!../../content/catalog.json', '!../../content/courses.json'])

async function loadJson<T>(basename: string): Promise<T> {
  const loader = files[`../../content/${basename}.json`]
  if (!loader) throw new Error(`Missing content file /content/${basename}.json`)
  return (await loader()).default as T
}

let curriculum: Promise<Curriculum> | null = null

/** The full curriculum index, loaded on demand. */
export function loadCurriculum(): Promise<Curriculum> {
  curriculum ??= loadJson<Curriculum>('curriculum')
  return curriculum
}

let plates: Promise<Plates> | null = null

/** The anatomical plates and their arrows, loaded on demand. */
export function loadPlates(): Promise<Plates> {
  plates ??= loadJson<Plates>('plates')
  return plates
}

let mock: Promise<MockBank> | null = null

/** The mock-exam question banks, loaded on demand. */
export function loadMock(): Promise<MockBank> {
  mock ??= loadJson<MockBank>('mock')
  return mock
}

const contentCache = new Map<string, Promise<ModuleContent>>()
const fileCache = new Map<string, Promise<ModuleContent>>()

/** A content file as authored, shared by every module built from it. */
export function loadContentFile(basename: string): Promise<ModuleContent> {
  let p = fileCache.get(basename)
  if (!p) {
    // A failed download is forgotten, so Try again fetches it afresh.
    p = loadJson<ModuleContent>(basename).catch((e: unknown) => {
      fileCache.delete(basename)
      throw e
    })
    fileCache.set(basename, p)
  }
  return p
}

/** Keeps only the included structures, and only the regions they use. */
export function focusContent(content: ModuleContent, include: string[]): ModuleContent {
  const keep = new Set(include)
  const structures = content.structures.filter((s) => keep.has(s.id))
  const regions = content.regions.filter((r) => structures.some((s) => s.region === r.id))
  return { ...content, structures, regions }
}
const placeholderCache = new Map<string, Promise<PlaceholderModel>>()

export function loadModuleContent(info: ModuleInfo): Promise<ModuleContent> {
  if (!info.contentFile) return Promise.reject(new Error(`Module ${info.id} has no content yet`))
  let p = contentCache.get(info.id)
  if (!p) {
    const include = info.include
    p = loadContentFile(info.contentFile)
      .then((c) => (include ? focusContent(c, include) : c))
      .catch((e: unknown) => {
        contentCache.delete(info.id)
        throw e
      })
    contentCache.set(info.id, p)
  }
  return p
}

export function loadPlaceholder(info: ModuleInfo): Promise<PlaceholderModel> {
  if (!info.placeholderFile) return Promise.resolve({ parts: [] })
  let p = placeholderCache.get(info.id)
  if (!p) {
    p = loadJson<PlaceholderModel>(info.placeholderFile).catch((e: unknown) => {
      placeholderCache.delete(info.id)
      throw e
    })
    placeholderCache.set(info.id, p)
  }
  return p
}

const modelCheck = new Map<string, Promise<boolean>>()

/**
 * False only when /models/<file> is clearly missing: a 404, or the HTML page that
 * the dev server and service worker return for unknown paths. If the check itself
 * can't run (e.g. a sandboxed host), assume the model is there and let the loader try.
 */
export function modelAvailable(file: string): Promise<boolean> {
  // The artifact build embeds its models as JS modules (see viewer/embeddedModel.ts).
  if (import.meta.env.MODE === 'artifact') return Promise.resolve(true)
  let p = modelCheck.get(file)
  if (!p) {
    p = fetch(publicUrl(`models/${file}`), { method: 'HEAD' })
      .then((r) => r.status !== 404 && !(r.headers.get('content-type') ?? '').includes('text/html'))
      .catch(() => true)
    modelCheck.set(file, p)
  }
  return p
}
