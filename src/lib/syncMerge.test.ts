import { describe, expect, it } from 'vitest'
import type { DayActivity } from './assignments'
import type { StructureRecord } from './srs'
import { emptyProgress, maxDays, mergeAssessments, mergeSync, sumDays, type Profile, type Progress, type RemoteDoc, type SyncInput } from './syncMerge'

const rec = (lastSeen: number, attempts = 1, box = 1): StructureRecord => ({ attempts, correct: attempts, errors: 0, lastSeen, lastOutcome: 'perfect', box, dueAt: lastSeen + 1 })
const day = (answered: number, modules: string[] = []): DayActivity => ({ answered, correct: answered, ms: answered * 1000, cards: 0, xp: 0, bestCombo: 1, modules })
const profile = (track: string, changedAt: number): Profile => ({ track, dailyGoal: 20, name: '', changedAt })

const input = (progress: Partial<Progress>, extra: Partial<SyncInput> = {}): SyncInput => ({
  progress: { ...emptyProgress(), ...progress },
  profile: profile('nursing', 0),
  deviceId: 'A',
  resetAt: 0,
  now: 1_000_000,
  ...extra,
})

/** What device `deviceId` uploads, as the account then holds it. */
const upload = (i: SyncInput, remote: RemoteDoc | null = null) => mergeSync(i, remote).remote

describe('merging progress', () => {
  it('first sign-in: everything on the device goes into an empty account, nothing lost', () => {
    const local = { records: { femur: rec(10) }, cards: { tibia: { box: 1, dueAt: 5, seen: 2 } }, days: { '2026-11-17': day(12) }, xp: 30 }
    const out = mergeSync(input(local), null)
    expect(out.progress.records).toEqual(local.records)
    expect(out.progress.cards).toEqual(local.cards)
    expect(out.remote.days).toEqual({ A: local.days })
    expect(out.otherDays).toEqual({})
    expect(out.remote.xp).toBe(30)
  })

  it('a structure studied on both devices keeps the more recent result', () => {
    const remote = upload(input({ records: { femur: rec(50, 3, 4), humerus: rec(5) } }, { deviceId: 'B' }))
    const out = mergeSync(input({ records: { femur: rec(20, 1, 1), radius: rec(7) } }), remote)
    expect(out.progress.records.femur).toEqual(rec(50, 3, 4))
    expect(Object.keys(out.progress.records).sort()).toEqual(['femur', 'humerus', 'radius'])
  })

  it('a flashcard keeps the copy reviewed more often', () => {
    const remote = upload(input({ cards: { femur: { box: 3, dueAt: 9, seen: 5 } } }, { deviceId: 'B' }))
    const out = mergeSync(input({ cards: { femur: { box: 1, dueAt: 99, seen: 2 } } }), remote)
    expect(out.progress.cards.femur).toEqual({ box: 3, dueAt: 9, seen: 5 })
  })

  it('exam results from every device are kept once each, newest first, at most 50', () => {
    const a = { at: 1, moduleId: 'skeleton', total: 20, correct: 15, durationMs: 1, missed: [] }
    const b = { ...a, at: 2 }
    expect(mergeAssessments([a, b], [b])).toEqual([b, a])
    const many = Array.from({ length: 60 }, (_, i) => ({ ...a, at: i }))
    expect(mergeAssessments(many, [])).toHaveLength(50)
  })

  it('the same day studied on two devices adds up', () => {
    const remote = upload(input({ days: { '2026-11-17': day(10, ['skeleton']) } }, { deviceId: 'B' }))
    const out = mergeSync(input({ days: { '2026-11-17': day(4, ['heart']) } }), remote)
    expect(out.progress.days['2026-11-17'].answered).toBe(4)
    expect(out.otherDays['2026-11-17'].answered).toBe(10)
    const all = sumDays([out.progress.days, out.otherDays])['2026-11-17']
    expect(all.answered).toBe(14)
    expect(all.modules.sort()).toEqual(['heart', 'skeleton'])
  })

  it("syncing the same device twice doesn't double its days", () => {
    const first = mergeSync(input({ days: { '2026-11-17': day(4) } }), null)
    const again = mergeSync(input({ days: { '2026-11-17': day(6) } }), first.remote)
    expect(again.remote.days.A['2026-11-17'].answered).toBe(6)
    expect(again.otherDays).toEqual({})
  })

  it('is stable: merging the result again changes nothing', () => {
    const remote = upload(input({ records: { femur: rec(50) }, days: { '2026-11-16': day(3) } }, { deviceId: 'B' }))
    const once = mergeSync(input({ records: { tibia: rec(9) }, days: { '2026-11-17': day(2) } }), remote)
    const twice = mergeSync(input(once.progress, { resetAt: once.resetAt }), once.remote)
    expect(twice.progress).toEqual(once.progress)
    expect(twice.remote.days).toEqual(once.remote.days)
  })

  it('course, daily goal and name: the most recent change wins', () => {
    const remote = upload(input({}, { deviceId: 'B', profile: profile('medicine', 500) }))
    expect(mergeSync(input({}, { profile: profile('nursing', 100) }), remote).profile.track).toBe('medicine')
    expect(mergeSync(input({}, { profile: profile('dentistry', 900) }), remote).profile.track).toBe('dentistry')
    // A device that never changed them takes the account's.
    expect(mergeSync(input({}), remote).profile.track).toBe('medicine')
  })

  it('reset on one device erases the account, and the other device drops its older progress', () => {
    const before = new Date(2026, 10, 10, 9).getTime()
    const resetTime = new Date(2026, 10, 12, 12).getTime()
    const after = new Date(2026, 10, 13, 9).getTime()
    const b = upload(input({ records: { femur: rec(before) }, days: { '2026-11-10': day(5) } }, { deviceId: 'B', now: before }))
    const withA = upload(input({ records: { tibia: rec(before) } }, { now: before }), b)
    // Device A resets.
    const reset = mergeSync(input({ records: { tibia: rec(before) } }, { reset: true, now: resetTime }), withA)
    expect(reset.progress).toEqual(emptyProgress())
    expect(reset.remote.records).toEqual({})
    expect(reset.remote.days).toEqual({ A: {} })
    expect(reset.remote.resetAt).toBe(resetTime)
    // Device B still has femur and a day from before the reset, and studied radius after it.
    const later = mergeSync(
      input({ records: { femur: rec(before), radius: rec(after) }, days: { '2026-11-10': day(5), '2026-11-13': day(2) } }, { deviceId: 'B', now: after }),
      reset.remote,
    )
    expect(Object.keys(later.progress.records)).toEqual(['radius'])
    expect(later.resetAt).toBe(resetTime)
    expect(Object.keys(later.remote.days.B)).toEqual(['2026-11-13'])
  })

  it('a device that already knows about a reset keeps its newer progress', () => {
    const reset = mergeSync(input({}, { reset: true, now: 1_000 }), null)
    const next = mergeSync(input({ records: { femur: rec(5_000) } }, { resetAt: 1_000, now: 6_000 }), reset.remote)
    expect(Object.keys(next.progress.records)).toEqual(['femur'])
  })

  it('maxDays takes the larger count for the same device', () => {
    expect(maxDays({ d: day(3, ['x']) }, { d: day(5, ['y']) }).d).toMatchObject({ answered: 5, modules: ['x', 'y'] })
  })

  it('writes nothing Firestore would reject (no undefined values)', () => {
    const out = mergeSync(input({ records: { femur: rec(1) } }), null)
    expect(JSON.parse(JSON.stringify(out.remote))).toEqual(out.remote)
  })
})
