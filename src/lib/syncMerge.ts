import type { DayActivity } from './assignments'
import { dayKey } from './dates'
import type { StructureRecord } from './srs'

/**
 * How progress on this device and progress saved in the account are combined. Pure: no Firebase, no
 * storage. Rules:
 * - a structure's record: the one studied most recently wins;
 * - a flashcard: the one reviewed more often wins;
 * - timed and mock exam results and finished study-plan items: all of them, from every device;
 * - daily activity is kept per device and added up, so a day studied on two devices counts both;
 * - course, daily goal and name: the most recent change wins;
 * - "Reset progress" on any device erases the account's progress, and every other device drops what
 *   it had from before the reset when it next syncs.
 */

export const SYNC_SCHEMA = 1
const MAX_ASSESSMENTS = 50

export interface CardRecord {
  box: number
  dueAt: number
  seen: number
}

export interface AssessmentResult {
  at: number
  moduleId: string
  total: number
  correct: number
  durationMs: number
  missed: string[]
}

export type Days = Record<string, DayActivity>

/** Everything in the progress store that is synced. `days` is this device's own activity. */
export interface Progress {
  records: Record<string, StructureRecord>
  cards: Record<string, CardRecord>
  assessments: AssessmentResult[]
  claimed: Record<string, number>
  xp: number
  days: Days
}

/** The settings that follow the student to other devices. */
export interface Profile {
  track: string
  dailyGoal: number
  name: string
  /** Absent in documents saved before the female models existed. */
  body?: 'male' | 'female'
  /** When any of them was last changed (0: never changed on this device). */
  changedAt: number
}

/** One account's document in Firestore (`users/{uid}`). */
export interface RemoteDoc {
  schema: number
  updatedAt: number
  /** Time of the last "Reset progress" (0: never). */
  resetAt: number
  records: Record<string, StructureRecord>
  cards: Record<string, CardRecord>
  assessments: AssessmentResult[]
  claimed: Record<string, number>
  xp: number
  /** Daily activity per device id. */
  days: Record<string, Days>
  profile: Profile | null
}

export interface SyncInput {
  progress: Progress
  profile: Profile
  deviceId: string
  /** The latest reset this device knows about (0: none). */
  resetAt: number
  /** This device is erasing the account's progress now. */
  reset?: boolean
  now: number
}

export interface SyncOutput {
  progress: Progress
  /** Daily activity from the account's other devices, added up. */
  otherDays: Days
  profile: Profile
  resetAt: number
  remote: RemoteDoc
}

export const emptyProgress = (): Progress => ({ records: {}, cards: {}, assessments: [], claimed: {}, xp: 0, days: {} })

function pick<T>(a: Record<string, T>, b: Record<string, T>, better: (x: T, y: T) => boolean): Record<string, T> {
  const out = { ...a }
  for (const [k, v] of Object.entries(b)) if (!(k in out) || better(v, out[k])) out[k] = v
  return out
}

export const mergeRecords = (a: Progress['records'], b: Progress['records']) =>
  pick(a, b, (x, y) => x.lastSeen > y.lastSeen || (x.lastSeen === y.lastSeen && x.attempts > y.attempts))

export const mergeCards = (a: Progress['cards'], b: Progress['cards']) => pick(a, b, (x, y) => x.seen > y.seen || (x.seen === y.seen && x.dueAt > y.dueAt))

export function mergeAssessments(a: AssessmentResult[], b: AssessmentResult[]): AssessmentResult[] {
  const byKey = new Map<string, AssessmentResult>()
  for (const r of [...a, ...b]) byKey.set(`${r.at}:${r.moduleId}`, byKey.get(`${r.at}:${r.moduleId}`) ?? r)
  return [...byKey.values()].sort((x, y) => y.at - x.at).slice(0, MAX_ASSESSMENTS)
}

export const mergeClaimed = (a: Progress['claimed'], b: Progress['claimed']) => pick(a, b, (x, y) => x < y)

const blankDay = (): DayActivity => ({ answered: 0, correct: 0, ms: 0, cards: 0, xp: 0, bestCombo: 0, modules: [] })

/** Two copies of the same device's days (for example after a reload): the larger count is the true one. */
export function maxDays(a: Days, b: Days): Days {
  const out: Days = { ...a }
  for (const [k, d] of Object.entries(b)) {
    const x = { ...blankDay(), ...out[k] }
    out[k] = {
      answered: Math.max(x.answered, d.answered),
      correct: Math.max(x.correct, d.correct),
      ms: Math.max(x.ms, d.ms),
      cards: Math.max(x.cards, d.cards),
      xp: Math.max(x.xp, d.xp),
      bestCombo: Math.max(x.bestCombo, d.bestCombo),
      modules: [...new Set([...x.modules, ...d.modules])],
    }
  }
  return out
}

/** Different devices' days: the counts add up. */
export function sumDays(list: Days[]): Days {
  const out: Days = {}
  for (const days of list) {
    for (const [k, d] of Object.entries(days)) {
      const x = out[k] ?? blankDay()
      out[k] = {
        answered: x.answered + d.answered,
        correct: x.correct + d.correct,
        ms: x.ms + d.ms,
        cards: x.cards + d.cards,
        xp: x.xp + d.xp,
        bestCombo: Math.max(x.bestCombo, d.bestCombo),
        modules: [...new Set([...x.modules, ...d.modules])],
      }
    }
  }
  return out
}

/** What a device keeps from before a reset it has just learned about: only what was done after it. */
function afterReset(p: Progress, resetAt: number): Progress {
  const day = dayKey(new Date(resetAt))
  return {
    records: Object.fromEntries(Object.entries(p.records).filter(([, r]) => r.lastSeen > resetAt)),
    // Flashcard records carry no time, so they cannot be dated: they go.
    cards: {},
    assessments: p.assessments.filter((a) => a.at > resetAt),
    claimed: Object.fromEntries(Object.entries(p.claimed).filter(([, t]) => t > resetAt)),
    xp: 0,
    days: Object.fromEntries(Object.entries(p.days).filter(([k]) => k > day)),
  }
}

/** Combine this device with the account (`remote` is null for an account with nothing saved yet). */
export function mergeSync(input: SyncInput, remote: RemoteDoc | null): SyncOutput {
  const { deviceId, now } = input
  let local = input.progress
  let resetAt = Math.max(input.resetAt, remote?.resetAt ?? 0)
  let theirs: Progress & { devices: Record<string, Days> } = { ...emptyProgress(), devices: {} }

  if (input.reset) {
    // Erase the account's progress: nothing from this device or the account survives.
    resetAt = now
    local = emptyProgress()
  } else {
    if (remote && remote.resetAt > input.resetAt) local = afterReset(local, remote.resetAt)
    if (remote) theirs = { ...remote, days: remote.days[deviceId] ?? {}, devices: remote.days }
  }

  const ownDays = maxDays(local.days, theirs.days)
  const others = Object.fromEntries(Object.entries(theirs.devices).filter(([id]) => id !== deviceId))
  const progress: Progress = {
    records: mergeRecords(local.records, theirs.records),
    cards: mergeCards(local.cards, theirs.cards),
    assessments: mergeAssessments(local.assessments, theirs.assessments),
    claimed: mergeClaimed(local.claimed, theirs.claimed),
    xp: Math.max(local.xp, theirs.xp),
    days: ownDays,
  }

  const saved = remote?.profile ?? null
  const profile = saved && saved.changedAt > input.profile.changedAt ? saved : input.profile

  return {
    progress,
    otherDays: sumDays(Object.values(others)),
    profile,
    resetAt,
    remote: {
      schema: SYNC_SCHEMA,
      updatedAt: now,
      resetAt,
      records: progress.records,
      cards: progress.cards,
      assessments: progress.assessments,
      claimed: progress.claimed,
      xp: progress.xp,
      days: { ...others, [deviceId]: ownDays },
      profile,
    },
  }
}
