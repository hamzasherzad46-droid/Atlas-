import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { normalizeAnswer } from '../lib/typing'
import type { Catalog, Curriculum, MockBank, ModuleContent, Plates, Structure } from './types'

/**
 * Names must agree across the content: one structure has one name, one Latin name and one set of
 * answers wherever it is taught, and no answer belongs to two different structures.
 */
const dir = fileURLToPath(new URL('../../content', import.meta.url))
const read = <T,>(f: string): T => JSON.parse(readFileSync(join(dir, f), 'utf8')) as T

const catalog = read<Catalog>('catalog.json')
const all: (Structure & { module: string })[] = catalog.systems
  .flatMap((s) => s.modules)
  .filter((m) => m.contentFile)
  .flatMap((m) => read<ModuleContent>(`${m.contentFile}.json`).structures.map((s) => ({ ...s, module: m.id })))

/**
 * The same structure taught under two ids (kept because progress is saved by id). Both must have the
 * same name and Latin name; listed in CONTENT-REVIEW.md.
 */
const SAME_STRUCTURE: string[][] = [['renal-artery', 'renal-artery-u']]
/** Like the quiz's answer matching, but keeping digits (mock options are often numbers). */
const plain = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

const sameStructure = (a: string, b: string) => a === b || SAME_STRUCTURE.some((g) => g.includes(a) && g.includes(b))

describe('consistency of names', () => {
  it('a structure taught in several modules has the same name, Latin name and answers in each', () => {
    const byId = new Map<string, typeof all>()
    for (const s of all) byId.set(s.id, [...(byId.get(s.id) ?? []), s])
    let shared = 0
    for (const [id, list] of byId) {
      if (list.length < 2) continue
      shared++
      for (const s of list.slice(1)) {
        expect(s.name, `${id} in ${s.module}`).toBe(list[0].name)
        expect(s.latinName, `${id} in ${s.module}`).toBe(list[0].latinName)
        expect(s.synonyms, `${id} in ${s.module}`).toEqual(list[0].synonyms)
      }
    }
    expect(shared).toBeGreaterThan(0)
  })

  it('the same structure under two ids has the same name and Latin name', () => {
    for (const group of SAME_STRUCTURE) {
      const list = all.filter((s) => group.includes(s.id))
      expect(list.length, group.join(', ')).toBeGreaterThanOrEqual(group.length)
      for (const s of list) {
        expect(s.name).toBe(list[0].name)
        expect(s.latinName).toBe(list[0].latinName)
      }
    }
  })

  it('no answer (name or synonym) belongs to two different structures', () => {
    const owner = new Map<string, Structure & { module: string }>()
    const clashes: string[] = []
    for (const s of all) {
      for (const answer of new Set([s.name, ...s.synonyms].map(normalizeAnswer))) {
        const other = owner.get(answer)
        if (other && !sameStructure(other.id, s.id)) clashes.push(`“${answer}”: ${other.module}/${other.id} and ${s.module}/${s.id}`)
        owner.set(answer, s)
      }
    }
    expect(clashes).toEqual([])
  })

  it('no two different structures share a Latin name', () => {
    const owner = new Map<string, string>()
    const clashes: string[] = []
    for (const s of all) {
      const latin = normalizeAnswer(s.latinName)
      const other = owner.get(latin)
      if (other && !sameStructure(other, s.id)) clashes.push(`${s.latinName}: ${other} and ${s.id}`)
      owner.set(latin, s.id)
    }
    expect(clashes).toEqual([])
  })

  it('a synonym is not the name of the structure again', () => {
    const repeats = all.flatMap((s) => s.synonyms.filter((x) => normalizeAnswer(x) === normalizeAnswer(s.name)).map((x) => `${s.id}: ${x}`))
    expect(repeats).toEqual([])
  })

  it('curriculum topic titles are unique', () => {
    const titles = read<Curriculum>('curriculum.json').categories.flatMap((c) => c.topics.map((t) => plain(t.title)))
    expect(titles.filter((t, i) => titles.indexOf(t) !== i)).toEqual([])
  })

  it('mock questions have unique ids and texts, and four different options', () => {
    const questions = read<MockBank>('mock.json').sets.flatMap((s) => s.questions)
    expect(questions).toHaveLength(121)
    const ids = questions.map((q) => q.id)
    expect(ids.filter((x, i) => ids.indexOf(x) !== i)).toEqual([])
    const texts = questions.map((q) => plain(q.q))
    expect(texts.filter((x, i) => texts.indexOf(x) !== i)).toEqual([])
    for (const q of questions) {
      expect(q.options, q.id).toHaveLength(4)
      expect(new Set(q.options.map(plain)).size, `${q.id} has two options that read the same`).toBe(4)
    }
  })

  it('each plate names each arrow once', () => {
    for (const p of read<Plates>('plates.json').plates) {
      const names = p.labels.map((l) => plain(l.name))
      expect(names.filter((x, i) => names.indexOf(x) !== i), p.id).toEqual([])
    }
  })
})
