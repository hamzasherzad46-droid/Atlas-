import { describe, expect, it } from 'vitest'
import { readRemote, stableJson } from './sync'

describe('reading the account document', () => {
  it('fills in anything missing', () => {
    expect(readRemote({ schema: 1, records: { femur: { lastSeen: 1 } } })).toMatchObject({ resetAt: 0, cards: {}, assessments: [], days: {}, profile: null })
    expect(readRemote(null)).toBeNull()
  })

  it('refuses a document saved by a newer version of Atlas instead of overwriting it', () => {
    expect(() => readRemote({ schema: 99 })).toThrow()
  })

  it('compares documents whatever the key order', () => {
    expect(stableJson({ b: 1, a: { d: 2, c: [3, { f: 1, e: 2 }] } })).toBe(stableJson({ a: { c: [3, { e: 2, f: 1 }], d: 2 }, b: 1 }))
  })
})
