import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import type { ModuleContent } from '../content/types'
import { buildQueue, distractorsFor, mixByRegion, overlaps } from './quiz'

const skeleton = JSON.parse(readFileSync(fileURLToPath(new URL('../../content/skeleton.json', import.meta.url)), 'utf8')) as ModuleContent
const byId = (id: string) => skeleton.structures.find((s) => s.id === id)!

describe('multiple-choice distractors', () => {
  it('knows which structures share parts', () => {
    expect(overlaps(byId('carpals'), byId('scaphoid'))).toBe(true)
    expect(overlaps(byId('ribs'), byId('first-rib'))).toBe(true)
    expect(overlaps(byId('humerus'), byId('medial-epicondyle'))).toBe(true)
    expect(overlaps(byId('radius'), byId('ulna'))).toBe(false)
  })

  it('never offers a second right answer', () => {
    for (const target of skeleton.structures) {
      for (let run = 0; run < 5; run++) {
        const wrong = distractorsFor(target, skeleton.structures)
        expect(wrong).toHaveLength(3)
        for (const d of wrong) {
          expect(d.id).not.toBe(target.id)
          expect(overlaps(d, target), `${target.id} vs ${d.id}`).toBe(false)
          expect(d.name.toLowerCase()).not.toBe(target.name.toLowerCase())
        }
        expect(new Set(wrong.map((d) => d.id)).size).toBe(3)
      }
    }
  })
})

describe('question order', () => {
  it('asks each structure once and mixes regions', () => {
    for (let run = 0; run < 20; run++) {
      const ids = buildQueue({ kind: 'practice', moduleId: 'skeleton', mode: 'learn', region: null, length: 12, answerTimer: 0 }, skeleton.structures, {})
      expect(ids).toHaveLength(12)
      expect(new Set(ids).size).toBe(12)
      const regions = ids.map((id) => byId(id).region)
      // With five regions in the skeleton, the same region never comes twice in a row.
      for (let i = 1; i < regions.length; i++) expect(regions[i], ids.join(',')).not.toBe(regions[i - 1])
    }
  })

  it('exams draw distinct questions too', () => {
    const ids = buildQueue({ kind: 'assessment', moduleId: 'skeleton', mode: 'hard', region: null, length: 20, answerTimer: 20 }, skeleton.structures, {})
    expect(new Set(ids).size).toBe(20)
  })

  it('spreads a region evenly when one region dominates', () => {
    const items = [...'aaaab'].map((region, i) => ({ id: String(i), region }))
    const mixed = mixByRegion(items).map((x) => x.region).join('')
    expect(mixed.includes('bb')).toBe(false)
    expect(mixed).toHaveLength(5)
  })
})
