import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { buildFocusModules } from '../content/courses'
import { buildSearchEntries, type SearchTarget } from '../content/searchIndex'
import type { Catalog, Courses, Curriculum, MockBank, ModuleContent, ModuleInfo, Plates } from '../content/types'
import { en } from '../i18n/en'
import { buildIndex, editDistance, fold, search } from './search'

const dir = fileURLToPath(new URL('../../content', import.meta.url))
const read = <T,>(f: string): T => JSON.parse(readFileSync(join(dir, f), 'utf8')) as T

const catalog = read<Catalog>('catalog.json')
const systemModules: ModuleInfo[] = catalog.systems.flatMap((sys) => sys.modules.map((m) => ({ ...m, systemId: sys.id })))
const regionModules: ModuleInfo[] = (catalog.regions ?? []).flatMap((g) => g.modules.map((m) => ({ ...m, group: g.id })))
const focusModules = buildFocusModules(read<Courses>('courses.json'), systemModules)
const allModules = [...focusModules, ...regionModules, ...systemModules]
const english = (id: string) => (en as Record<string, string>)[`module.${id}`] ?? allModules.find((m) => m.id === id)?.title ?? id

const systems = systemModules.filter((m) => m.status === 'available').map((info) => ({ info, content: read<ModuleContent>(`${info.contentFile}.json`) }))
const entries = buildSearchEntries(
  { systems, modules: allModules, curriculum: read<Curriculum>('curriculum.json'), plates: read<Plates>('plates.json'), mock: read<MockBank>('mock.json') },
  { module: english, english, mock: (n) => `Mock exam · ${n} questions` },
)
const index = buildIndex(entries)
const top = (q: string) => search(index, q)[0]?.entry.target
const keys = (q: string, n = 5) => search(index, q, n).map((h) => h.entry.key)
const structureHit = (q: string): SearchTarget => ({ kind: 'structure', moduleId: expect.any(String) as unknown as string, structureId: q })

describe('fold', () => {
  it('folds British and American spellings to one form', () => {
    const pairs = [
      ['Oesophagus', 'esophagus'],
      ['haemorrhage', 'hemorrhage'],
      ['Paediatric', 'pediatric'],
      ['oedema', 'edema'],
      ['catheterisation', 'catheterization'],
      ['tumour', 'tumor'],
      ['centre', 'center'],
      ['fibre', 'fiber'],
      ['analyse', 'analyze'],
      ['Anaesthesia', 'anesthesia'],
    ]
    for (const [gb, us] of pairs) expect(fold(gb), gb).toBe(fold(us))
  })

  it('ignores case, accents and punctuation', () => {
    expect(fold('Tensor fasciae latae')).toBe(fold('tensor-fascie  latae'))
    expect(fold('Ménière')).toBe('meniere')
  })
})

describe('editDistance', () => {
  it('counts insertions, deletions, substitutions and swaps as one edit each', () => {
    expect(editDistance('femr', 'femur')).toBe(1)
    expect(editDistance('femure', 'femur')).toBe(1)
    expect(editDistance('fenur', 'femur')).toBe(1)
    expect(editDistance('fmeur', 'femur')).toBe(1)
    expect(editDistance('tibia', 'fibula')).toBe(3)
  })

  it('stops early past the limit', () => {
    expect(editDistance('skeleton', 'heart', 1)).toBe(2)
  })
})

describe('search over the real content', () => {
  it('has a unique key for every entry', () => {
    expect(new Set(entries.map((e) => e.key)).size).toBe(entries.length)
  })

  it('finds every structure by its own name, first or tied first', () => {
    const structures = entries.filter((e) => e.kind === 'structure')
    expect(structures.length).toBeGreaterThan(200)
    for (const e of structures) {
      const hits = search(index, e.title, 200)
      const best = hits[0]?.score
      const own = hits.find((h) => h.entry.key === e.key)
      expect(own?.score, e.title).toBe(best)
    }
  })

  it('finds every module, topic, plate and mock-exam topic by its title', () => {
    for (const e of entries.filter((x) => x.kind !== 'structure')) {
      const own = search(index, e.title, 400).find((h) => h.entry.key === e.key)
      expect(own?.score, `${e.kind} ${e.title}`).toBe(100)
    }
  })

  it('finds the oesophagus from the American spelling and from a typo', () => {
    expect(top('esophagus')).toEqual(structureHit('oesophagus'))
    expect(top('oesophagis')).toEqual(structureHit('oesophagus'))
    expect(top('esophagis')).toEqual(structureHit('oesophagus'))
  })

  it('finds the femur by name, synonym and typo', () => {
    expect(top('femur')).toEqual(structureHit('femur'))
    expect(top('Femur')).toEqual(structureHit('femur'))
    expect(top('thigh bone')).toEqual(structureHit('femur'))
    expect(keys('femr')).toContain('structure:skeleton:femur')
  })

  it('finds structures by Latin name', () => {
    expect(top('gaster')).toEqual(structureHit('stomach'))
    expect(top('hepar')).toEqual(structureHit('liver'))
  })

  it('finds modules, topics, plates and mock-exam topics', () => {
    expect(keys('catheterization')).toContain('module:urinary-catheterisation')
    expect(keys('injection sites')[0]).toBe('module:injection-sites')
    expect(keys('pediatric anatomy')[0]).toMatch(/^topic:/)
    expect(search(index, 'pediatric anatomy')[0].entry.title).toBe('Paediatric Anatomy')
    expect(keys('cranial nerves', 10).some((k) => k.startsWith('topic:'))).toBe(true)
    expect(keys('axilla', 10)).toContain('plate:axilla')
    expect(keys('lymphatics', 10)).toContain('mock:Lymphatics')
  })

  it('returns nothing for an empty query', () => {
    expect(search(index, '   ')).toEqual([])
  })
})
