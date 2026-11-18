import { describe, expect, it } from 'vitest'
import { HOME, type View } from './nav'
import { PLACE_FRESH_MS, placeToRestore, type SavedPlace } from './navMemory'

const NOW = 1_800_000_000_000
const view = (patch: Partial<View>): View => ({ ...HOME, ...patch })
const saved = (v: Partial<View>, history: Partial<View>[] = [], at = NOW - 60_000): SavedPlace => ({ at, view: view(v), history: history.map(view) })
const quiz = { kind: 'practice', moduleId: 'skeleton', mode: 'learn', region: null, length: 12, answerTimer: 0 } as const

describe('reopening the place after a reload', () => {
  it('reopens a module page with the way back to Today', () => {
    const place = placeToRestore(saved({ tab: 'atlas', modulePage: 'skeleton' }, [{}]), NOW)
    expect(place?.view.modulePage).toBe('skeleton')
    expect(place?.view.tab).toBe('atlas')
    expect(place?.history).toEqual([HOME])
  })

  it('reopens an interrupted quiz at the screen it was started from, not mid-question', () => {
    const place = placeToRestore(saved({ tab: 'atlas', modulePage: 'heart', session: quiz }, [{}, { tab: 'atlas', modulePage: 'heart' }]), NOW)
    expect(place?.view.session).toBeNull()
    expect(place?.view.modulePage).toBe('heart')
    expect(place?.history).toEqual([HOME])
  })

  it('reopens an interrupted deck the same way', () => {
    const place = placeToRestore(saved({ cards: { moduleId: 'skeleton', region: null } }, [{}]), NOW)
    expect(place?.view).toEqual(HOME)
    expect(place?.history).toEqual([])
  })

  it('opens a running mock exam at its setup, and never reopens the course sheet or an account dialog', () => {
    const place = placeToRestore(saved({ mock: { topic: null, running: true }, courses: true, account: 'delete' }, [{}]), NOW)
    expect(place?.view.mock).toEqual({ topic: null })
    expect(place?.view.courses).toBe(false)
    expect(place?.view.account).toBeNull()
  })

  it('opens on Today when the place is old, from the future, or names a module that no longer exists', () => {
    expect(placeToRestore(saved({ tab: 'progress' }, [], NOW - PLACE_FRESH_MS - 1), NOW)).toBeNull()
    expect(placeToRestore(saved({ tab: 'progress' }, [], NOW + 60_000), NOW)).toBeNull()
    expect(placeToRestore(saved({ tab: 'atlas', modulePage: 'no-such-module' }, [{}]), NOW)).toBeNull()
    expect(placeToRestore(null, NOW)).toBeNull()
  })
})
