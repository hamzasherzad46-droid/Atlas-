import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { acceptedAnswers, normalizeAnswer } from '../lib/typing'
import { meshKeys, meshMatchesAny } from '../lib/meshMatch'
import type { Catalog, Courses, Curriculum, MockBank, ModuleContent, PlaceholderModel, Plates } from './types'
import { buildFocusModules, continueModuleId, findCourse, noteForCourse } from './courses'
import { en } from '../i18n/en'

const dir = fileURLToPath(new URL('../../content', import.meta.url))
const modelsDir = fileURLToPath(new URL('../../public/models', import.meta.url))

/** Node names from a GLB's JSON chunk (no decoding of geometry needed). */
function glbNodeNames(file: string): string[] {
  const b = readFileSync(join(modelsDir, file))
  const len = b.readUInt32LE(12)
  const json = JSON.parse(b.subarray(20, 20 + len).toString('utf8')) as { nodes?: { name?: string }[] }
  return (json.nodes ?? []).map((n) => n.name ?? '')
}
const read = <T,>(f: string): T => JSON.parse(readFileSync(join(dir, f), 'utf8')) as T

const catalog = read<Catalog>('catalog.json')
const coursesData = read<Courses>('courses.json')
/** Every kind of note a course can show (nursing, medicine, physio, dentistry, sports). */
const NOTE_KINDS = new Set(coursesData.courses.flatMap((c) => c.notes))
const modules = catalog.systems.flatMap((c) => c.modules).filter((m) => m.status === 'available')

describe('content catalog', () => {
  it('regional modules include only structures that exist in their content file', () => {
    for (const g of catalog.regions ?? []) {
      for (const m of g.modules) {
        const content = read<ModuleContent>(`${m.contentFile}.json`)
        const ids = new Set(content.structures.map((s) => s.id))
        expect(m.include?.length, m.id).toBeGreaterThan(0)
        for (const id of m.include ?? []) expect(ids.has(id), `${m.id}: ${id}`).toBe(true)
        expect(new Set(m.include).size, `${m.id} has duplicates`).toBe(m.include?.length)
      }
    }
  })

  it('module ids are unique across systems and regions', () => {
    const ids = [...catalog.systems.flatMap((c) => c.modules), ...(catalog.regions ?? []).flatMap((g) => g.modules)].map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every body system has a colour key', () => {
    for (const s of catalog.systems) expect(s.tint, s.id).toMatch(/^#[0-9a-f]{6}$/)
  })

  it('module ids are unique across systems', () => {
    const ids = catalog.systems.flatMap((c) => c.modules.map((m) => m.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every cover engraving exists', () => {
    const covers = fileURLToPath(new URL('../../public/plates/covers', import.meta.url))
    const all = [...catalog.systems.flatMap((c) => c.modules), ...(catalog.regions ?? []).flatMap((g) => g.modules), ...coursesData.focus]
    const used = all.filter((m) => m.cover)
    expect(used.length).toBeGreaterThan(0)
    for (const m of used) expect(existsSync(join(covers, `${m.cover}.webp`)), `${m.id}: ${m.cover}`).toBe(true)
  })

  it('every available module has its content file', () => {
    const present = new Set(readdirSync(dir))
    for (const m of modules) {
      expect(present.has(`${m.contentFile}.json`), m.id).toBe(true)
      if (m.placeholderFile) expect(present.has(`${m.placeholderFile}.json`), m.id).toBe(true)
    }
  })
})

for (const m of modules) {
  describe(`module ${m.id}`, () => {
    const content = read<ModuleContent>(`${m.contentFile}.json`)
    const placeholder = m.placeholderFile ? read<PlaceholderModel>(`${m.placeholderFile}.json`) : { parts: [] }
    const regionIds = new Set(content.regions.map((r) => r.id))

    it('has unique ids', () => {
      const ids = content.structures.map((s) => s.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it.each(content.structures.map((s) => [s.id, s] as const))('%s is complete and typeable', (_id, s) => {
      for (const field of ['name', 'latinName', 'definition', 'function', 'why', 'modelFile'] as const) {
        expect(s[field], field).toBeTruthy()
      }
      const notes = Object.entries(s.notes ?? {})
      expect(notes.length, 'at least one track note').toBeGreaterThan(0)
      for (const [kind, note] of notes) {
        expect([...NOTE_KINDS], `note kind "${kind}" is shown by no course`).toContain(kind)
        expect(note).toBeTruthy()
      }
      // Flashcard fronts show the model, backs the answer; function/why must not leak it on the front either.
      for (const text of [s.function, s.why]) {
        const t = normalizeAnswer(text)
        for (const a of acceptedAnswers(s.name, s.synonyms)) expect(t.includes(a), `function/why reveals "${a}"`).toBe(false)
      }
      expect(regionIds.has(s.region)).toBe(true)
      expect([1, 2, 3]).toContain(s.difficulty)
      expect(s.camera.position).toHaveLength(3)
      expect(s.camera.target).toHaveLength(3)
      // Answers must be typeable on the letters-and-space keyboard.
      for (const a of [s.name, ...s.synonyms]) expect(/^[a-z ]+$/.test(a), a).toBe(true)
      // The definition is shown as a clue, so it must not give the answer away.
      const def = normalizeAnswer(s.definition)
      for (const a of acceptedAnswers(s.name, s.synonyms)) expect(def.includes(a), `definition reveals "${a}"`).toBe(false)
    })

    it('every meshName matches a mesh in the model (or the placeholder if there is no model yet)', () => {
      const hasModel = !!m.model && existsSync(join(modelsDir, m.model.file))
      const names = hasModel ? glbNodeNames(m.model!.file) : placeholder.parts.map((p) => p.name)
      if (!names.length) return
      for (const s of content.structures) {
        for (const key of meshKeys(s.meshName)) {
          expect(names.some((n) => meshMatchesAny(n, [key])), `${s.id}: "${key}"`).toBe(true)
        }
      }
    })

    it('accepted answers are unambiguous across structures', () => {
      const seen = new Map<string, string>()
      for (const s of content.structures) {
        for (const a of acceptedAnswers(s.name, s.synonyms)) {
          expect(seen.get(a), `"${a}" used by ${seen.get(a)} and ${s.id}`).toBeUndefined()
          seen.set(a, s.id)
        }
      }
    })
  })
}

describe('anatomical plates', () => {
  const { plates } = read<Plates>('plates.json')
  const publicDir = fileURLToPath(new URL('../../public', import.meta.url))
  const systems = new Set(catalog.systems.map((s) => s.id))

  it('ids are unique and every plate image exists', () => {
    expect(new Set(plates.map((p) => p.id)).size).toBe(plates.length)
    for (const p of plates) {
      expect(existsSync(join(publicDir, p.image)), p.image).toBe(true)
      expect(systems.has(p.systemId), p.id).toBe(true)
      for (const f of [p.title, p.view, p.source, p.intro]) expect(f.trim().length, p.id).toBeGreaterThan(0)
    }
  })

  it('every arrow points inside its plate and has a name and a note', () => {
    for (const p of plates) {
      expect(p.labels.length, p.id).toBeGreaterThan(0)
      expect(new Set(p.labels.map((l) => l.name)).size, `${p.id} repeats a name`).toBe(p.labels.length)
      for (const l of p.labels) {
        expect(l.x, `${p.id}: ${l.name}`).toBeGreaterThan(0)
        expect(l.x, `${p.id}: ${l.name}`).toBeLessThan(100)
        expect(l.y, `${p.id}: ${l.name}`).toBeGreaterThan(0)
        expect(l.y, `${p.id}: ${l.name}`).toBeLessThan(100)
        expect(l.name.trim(), p.id).toBe(l.name)
        expect(l.note.trim().length, `${p.id}: ${l.name}`).toBeGreaterThan(10)
        expect(/[.!?)]$/.test(l.note), `${p.id}: ${l.name} note ends with a full stop`).toBe(true)
      }
    }
  })
})

describe('mock exam banks', () => {
  const { sets } = read<MockBank>('mock.json')

  it('has a Foundation and a Higher bank, each big enough for a 45-question mock', () => {
    expect(sets.map((s) => s.id).sort()).toEqual(['foundation', 'higher'])
    for (const s of sets) expect(s.questions.length, s.id).toBeGreaterThanOrEqual(45)
  })

  it('every question is complete, with four different options', () => {
    const ids = new Set<string>()
    for (const s of sets) {
      for (const q of s.questions) {
        expect(ids.has(q.id), q.id).toBe(false)
        ids.add(q.id)
        expect(q.options, q.id).toHaveLength(4)
        expect(new Set(q.options.map((o) => o.toLowerCase())).size, `${q.id} repeats an option`).toBe(4)
        for (const f of [q.topic, q.q, q.explain, ...q.options]) expect(f.trim(), q.id).toBe(f)
        expect(/[?.)]$/.test(q.q), `${q.id} question ends with ? or .`).toBe(true)
        expect(/[.!)]$/.test(q.explain), `${q.id} explanation ends with a full stop`).toBe(true)
        // No American spellings in the bank.
        for (const f of [q.q, q.explain, ...q.options]) {
          expect(/\b(esophag|hemo|anemi|edema|fiber|center|color|pediatric|tumor\b|maneuver)/i.test(f), `${q.id}: ${f}`).toBe(false)
        }
      }
    }
  })

  it('no question is repeated within or across banks', () => {
    const texts = sets.flatMap((s) => s.questions.map((q) => q.q.toLowerCase()))
    expect(new Set(texts).size).toBe(texts.length)
  })
})

describe('curriculum study notes', () => {
  const { categories } = read<Curriculum>('curriculum.json')
  const allModules = new Set([...catalog.systems.flatMap((s) => s.modules), ...(catalog.regions ?? []).flatMap((g) => g.modules)].filter((m) => m.status === 'available').map((m) => m.id))
  // American spellings that would be inconsistent with the rest of Atlas.
  const AMERICAN = /\b(esophag|hemo(?!rrhag)|hema(?!t)|anemi|edema|fiber|center|color|pediatric|orthoped|gynecol|anesthe|aging|behavior|labor\b|tumor\b|maneuver|organiz|fertiliz|specializ|recogniz|localiz|hematopo|analyz)/i

  it('every topic has a summary and at least four key points', () => {
    let n = 0
    for (const c of categories) {
      expect(new Set(c.topics.map((t) => t.title)).size, c.id).toBe(c.topics.length)
      for (const t of c.topics) {
        n++
        expect(t.summary?.trim().length, t.title).toBeGreaterThan(10)
        expect(t.points?.length, t.title).toBeGreaterThanOrEqual(4)
        for (const s of [t.summary, ...t.points]) {
          expect(s.trim(), t.title).toBe(s)
          expect(/[.)]$/.test(s), `${t.title}: "${s.slice(-30)}" ends with a full stop`).toBe(true)
          expect(/ {2}/.test(s), `${t.title}: double space`).toBe(false)
        }
      }
    }
    expect(n).toBe(282)
  })

  it('uses British spelling throughout', () => {
    for (const c of categories) {
      expect(AMERICAN.test(c.title), c.title).toBe(false)
      for (const t of c.topics) for (const s of [t.title, t.summary, ...t.points]) expect(AMERICAN.test(s), `${t.title}: ${s}`).toBe(false)
    }
  })

  it('links only to modules that exist', () => {
    for (const c of categories) for (const t of c.topics) for (const id of t.modules ?? []) expect(allModules.has(id), `${t.title}: ${id}`).toBe(true)
  })
})

describe('courses', () => {
  const { courses, focus } = coursesData
  const systemModules = catalog.systems.flatMap((s) => s.modules.map((m) => ({ ...m, systemId: s.id })))
  const regionModules = (catalog.regions ?? []).flatMap((g) => g.modules)
  const focusModules = buildFocusModules(coursesData, systemModules)
  const moduleIds = new Set([...systemModules, ...focusModules].filter((m) => m.status === 'available').map((m) => m.id))
  const regionIds = new Set(regionModules.filter((m) => m.status === 'available').map((m) => m.id))
  const curriculum = read<Curriculum>('curriculum.json')
  const topicTitles = new Set(curriculum.categories.flatMap((c) => c.topics.map((t) => t.title)))
  const plateIds = new Set(read<Plates>('plates.json').plates.map((p) => p.id))
  const mock = read<MockBank>('mock.json')
  const mockTopics = new Set(mock.sets.flatMap((s) => s.questions.map((q) => q.topic)))

  it('course and focus module ids are unique and do not clash with other modules', () => {
    expect(new Set(courses.map((c) => c.id)).size).toBe(courses.length)
    const ids = [...focus.map((f) => f.id), ...systemModules.map((m) => m.id), ...regionModules.map((m) => m.id)]
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every focus module is built from a real module and real structures', () => {
    expect(focusModules).toHaveLength(focus.length)
    for (const f of focus) {
      const from = systemModules.find((m) => m.id === f.from)
      expect(from?.contentFile, f.id).toBeTruthy()
      const structures = new Set(read<ModuleContent>(`${from!.contentFile}.json`).structures.map((s) => s.id))
      expect(f.include.length, f.id).toBeGreaterThan(0)
      for (const id of f.include) expect(structures.has(id), `${f.id}: ${id}`).toBe(true)
      expect(new Set(f.include).size, `${f.id} repeats a structure`).toBe(f.include.length)
      expect(f.title.trim().length && f.description.trim().length, f.id).toBeTruthy()
    }
  })

  it.each(courses.map((c) => [c.id, c] as const))('%s refers only to content that exists', (_id, c) => {
    expect(c.title.trim().length && c.description.trim().length).toBeTruthy()
    expect(c.notes.length).toBeGreaterThan(0)
    expect(c.modules.length).toBeGreaterThan(0)
    for (const id of c.modules) expect(moduleIds.has(id), `module ${id}`).toBe(true)
    for (const id of c.regions) expect(regionIds.has(id), `region ${id}`).toBe(true)
    for (const id of c.categories) expect(curriculum.categories.some((x) => x.id === id), `category ${id}`).toBe(true)
    for (const title of c.topics) expect(topicTitles.has(title), `topic ${title}`).toBe(true)
    for (const id of c.plates) expect(plateIds.has(id), `plate ${id}`).toBe(true)
    for (const topic of c.mockTopics) expect(mockTopics.has(topic), `mock topic ${topic}`).toBe(true)
    for (const list of [c.modules, c.regions, c.categories, c.topics, c.plates, c.mockTopics]) expect(new Set(list).size).toBe(list.length)
  })

  it.each(courses.map((c) => [c.id, c] as const))('%s has a mock exam of at least 15 questions at each level', (_id, c) => {
    for (const set of mock.sets) expect(set.questions.filter((q) => c.mockTopics.includes(q.topic)).length, set.id).toBeGreaterThanOrEqual(15)
  })

  it('English course names in the UI match courses.json, so the JSON stays the single source', () => {
    const strings = en as Record<string, string>
    for (const c of courses) {
      if (strings[`track.${c.id}`] !== undefined) expect(strings[`track.${c.id}`], c.id).toBe(c.title)
      if (strings[`trackHelp.${c.id}`] !== undefined) expect(strings[`trackHelp.${c.id}`], c.id).toBe(c.description)
    }
  })

  it('a new course needs JSON only', () => {
    const midwifery = {
      id: 'midwifery',
      title: 'Midwifery',
      description: 'The pelvis, pregnancy and birth.',
      notes: ['nursing', 'medicine'],
      modules: ['pelvic-floor-test', 'urinary'],
      regions: ['pelvis'],
      categories: ['embryology'],
      topics: ['Placentation'],
      plates: ['diaphragm'],
      mockTopics: ['Development'],
    }
    const data: Courses = {
      focus: [...focus, { id: 'pelvic-floor-test', title: 'Bladder', description: 'The bladder.', from: 'urinary', include: ['urinary-bladder'] }],
      courses: [...courses, midwifery],
    }
    const built = buildFocusModules(data, systemModules)
    expect(built.find((m) => m.id === 'pelvic-floor-test')).toMatchObject({ contentFile: 'urinary', include: ['urinary-bladder'], focus: true })
    expect(findCourse(data, 'midwifery').title).toBe('Midwifery')
    // An unknown course id falls back to the first course rather than breaking the app.
    expect(findCourse(data, 'no-such-course').id).toBe(courses[0].id)
    const exists = (id: string) => [...built, ...systemModules].some((m) => m.id === id)
    expect(continueModuleId(midwifery, null, exists)).toBe('pelvic-floor-test')
    expect(continueModuleId(midwifery, 'urinary', exists)).toBe('urinary')
    expect(continueModuleId(midwifery, 'removed-module', exists)).toBe('pelvic-floor-test')
  })

  it('shows each course its own note first and falls back in order', () => {
    const s = { notes: { medicine: 'M', nursing: 'N' } } as unknown as Parameters<typeof noteForCourse>[0]
    expect(noteForCourse(s, findCourse(coursesData, 'nursing'))).toEqual({ kind: 'nursing', text: 'N' })
    expect(noteForCourse(s, findCourse(coursesData, 'medicine'))).toEqual({ kind: 'medicine', text: 'M' })
    expect(noteForCourse(s, findCourse(coursesData, 'dentistry'))).toEqual({ kind: 'medicine', text: 'M' })
  })
})
