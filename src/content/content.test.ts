import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { acceptedAnswers, normalizeAnswer } from '../lib/typing'
import { meshKeys, meshMatchesAny } from '../lib/meshMatch'
import { TRACKS, type Catalog, type Curriculum, type MockBank, type ModuleContent, type PlaceholderModel, type Plates } from './types'

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
      for (const [track, note] of notes) {
        expect(TRACKS, track).toContain(track)
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
