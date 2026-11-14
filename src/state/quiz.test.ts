import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import type { ModuleContent } from '../content/types'
import { distractorsFor, overlaps } from './quiz'

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
