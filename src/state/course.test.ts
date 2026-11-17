import { describe, expect, it } from 'vitest'
import { useProgress } from './progress'
import { useSettings } from './settings'

describe('changing course', () => {
  it('never touches progress', () => {
    useProgress.setState({
      records: { femur: { seen: 3, correct: 2, wrong: 1, streak: 1, box: 2, dueAt: 1, lastSeenAt: 1 } as never },
      days: { '2026-11-17': { answered: 12, correct: 10, ms: 60000 } as never },
      assessments: [{ at: 1, moduleId: 'skeleton', total: 20, correct: 15, durationMs: 1000, missed: [] }],
    })
    const before = JSON.stringify({ ...useProgress.getState() })
    for (const id of ['nursing', 'medicine', 'physio', 'dentistry', 'sports', 'nursing']) {
      useSettings.getState().set({ track: id })
      expect(useSettings.getState().track).toBe(id)
      expect(JSON.stringify({ ...useProgress.getState() })).toBe(before)
    }
  })
})
