import {
  maxDays,
  mergeAssessments,
  mergeCards,
  mergeClaimed,
  mergeRecords,
  mergeSync,
  SYNC_SCHEMA,
  type Profile,
  type Progress,
  type RemoteDoc,
  type SyncInput,
  type SyncOutput,
} from '../lib/syncMerge'
import { useProgress } from '../state/progress'
import { useSettings } from '../state/settings'
import { deleteAccountAndClear, deviceRecord, loadFirebase, saveDevice, settings, signOutAndClear, useAccount } from './account'

/**
 * Keeps this device and the account in step while signed in: pull when signing in and when the app
 * comes back to the front, push a few seconds after studying, send what is waiting when the app goes
 * to the background, and try again when the connection returns.
 */
const PUSH_DELAY_MS = 4000

let started = false
let timer: ReturnType<typeof setTimeout> | null = null
let running: Promise<boolean> | null = null
let again = false
let applying = false
let paused = false

const signedIn = () => useAccount.getState().status === 'signedIn'

function snapshot(): Progress {
  const s = useProgress.getState()
  return { records: s.records, cards: s.cards, assessments: s.assessments, claimed: s.claimed, xp: s.xp, days: s.days }
}

function profile(): Profile {
  const s = useSettings.getState()
  return { track: s.track, dailyGoal: s.dailyGoal, name: s.name, body: s.body, changedAt: s.profileChangedAt }
}

/** The account's document as stored, with defaults for anything missing. Refuses a newer app's format. */
export function readRemote(data: unknown): RemoteDoc | null {
  if (!data || typeof data !== 'object') return null
  const d = data as Partial<RemoteDoc>
  if (typeof d.schema === 'number' && d.schema > SYNC_SCHEMA) throw Object.assign(new Error('Saved by a newer version of Atlas'), { code: 'atlas/newer-version' })
  return {
    schema: SYNC_SCHEMA,
    updatedAt: d.updatedAt ?? 0,
    resetAt: d.resetAt ?? 0,
    records: d.records ?? {},
    cards: d.cards ?? {},
    assessments: Array.isArray(d.assessments) ? d.assessments : [],
    claimed: d.claimed ?? {},
    xp: d.xp ?? 0,
    days: d.days ?? {},
    profile: d.profile ?? null,
  }
}

/** JSON with sorted keys, to tell whether two documents hold the same data. */
export function stableJson(value: unknown): string {
  return JSON.stringify(value, (_, v: unknown) =>
    v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b))) : v,
  )
}

const sameData = (a: RemoteDoc | null, b: RemoteDoc) => !!a && stableJson({ ...a, updatedAt: 0 }) === stableJson({ ...b, updatedAt: 0 })

function isOffline(e: unknown): boolean {
  const code = (e as { code?: string } | null)?.code ?? ''
  return code === 'unavailable' || code === 'auth/network-request-failed' || (typeof navigator !== 'undefined' && navigator.onLine === false)
}

/** Sync now (or join the sync already running). Resolves true when this device and the account agree. */
export function syncNow(): Promise<boolean> {
  if (!signedIn() || paused) return Promise.resolve(false)
  if (running) {
    again = true
    return running
  }
  running = run().finally(() => {
    running = null
    if (again) {
      again = false
      schedule(500)
    }
  })
  return running
}

async function run(): Promise<boolean> {
  const uid = useAccount.getState().user?.uid
  if (!uid) return false
  const device = deviceRecord()
  const before = snapshot()
  const input: SyncInput = { progress: before, profile: profile(), deviceId: device.deviceId, resetAt: device.resetAt, reset: device.pendingReset, now: Date.now() }
  // Filled inside the transaction (which may run more than once; the last run is the one written).
  const result: { out?: SyncOutput } = {}
  useAccount.setState({ sync: 'syncing' })
  try {
    const m = await loadFirebase()
    await m.syncDoc(uid, (data) => {
      const remote = readRemote(data)
      const out = mergeSync({ ...input, now: Date.now() }, remote)
      result.out = out
      // Nothing new for the account: read, but don't write.
      return sameData(remote, out.remote) ? null : (JSON.parse(JSON.stringify(out.remote)) as object)
    })
    const out = result.out
    if (!out || !signedIn() || paused) return false
    apply(out, before, input)
    const now = Date.now()
    saveDevice({ resetAt: out.resetAt, lastSyncedAt: now, pendingReset: false })
    useAccount.setState({ sync: 'idle', lastSyncedAt: now })
    return true
  } catch (e) {
    useAccount.setState({ sync: isOffline(e) ? 'offline' : 'error' })
    return false
  }
}

/** Put the merged progress and settings on this device, keeping anything studied while the sync ran. */
function apply(out: SyncOutput, before: Progress, input: SyncInput) {
  const now = snapshot()
  const changedMeanwhile = (Object.keys(before) as (keyof Progress)[]).some((k) => before[k] !== now[k])
  let progress = out.progress
  // After a reset, what this device had from before must not come back.
  const resetHappened = input.reset || out.resetAt !== input.resetAt
  if (changedMeanwhile && !resetHappened) {
    progress = {
      records: mergeRecords(progress.records, now.records),
      cards: mergeCards(progress.cards, now.cards),
      assessments: mergeAssessments(progress.assessments, now.assessments),
      claimed: mergeClaimed(progress.claimed, now.claimed),
      xp: Math.max(progress.xp, now.xp),
      days: maxDays(progress.days, now.days),
    }
  }
  applying = true
  try {
    useProgress.setState({ ...progress, otherDays: out.otherDays })
    const p = out.profile
    const s = useSettings.getState()
    const body = p.body ?? s.body
    if (p.changedAt !== s.profileChangedAt || p.track !== s.track || p.dailyGoal !== s.dailyGoal || p.name !== s.name || body !== s.body) {
      useSettings.setState({ track: p.track, dailyGoal: p.dailyGoal, name: p.name, body, profileChangedAt: p.changedAt })
    }
  } finally {
    applying = false
  }
  if (changedMeanwhile) schedule()
}

function schedule(delay = PUSH_DELAY_MS) {
  if (!signedIn() || paused) return
  if (useAccount.getState().sync === 'idle') useAccount.setState({ sync: 'pending' })
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    timer = null
    void syncNow()
  }, delay)
}

/** Send what is waiting now (the app is going to the background). */
function flush() {
  if (!timer) return
  clearTimeout(timer)
  timer = null
  void syncNow()
}

/** Start following changes (once, and only in builds with accounts). */
export function startSync() {
  if (started || !settings) return
  started = true
  useProgress.subscribe(() => {
    if (!applying) schedule()
  })
  useSettings.subscribe((s, prev) => {
    if (!applying && s.profileChangedAt !== prev.profileChangedAt) schedule()
  })
  useAccount.subscribe((s, prev) => {
    if (s.status === 'signedIn' && prev.status !== 'signedIn') void syncNow()
  })
  window.addEventListener('online', () => schedule(0))
  document.addEventListener('visibilitychange', () => (document.visibilityState === 'hidden' ? flush() : schedule(0)))
}

/** Stop syncing and wait for a sync in progress to finish (before signing out or deleting). */
async function pause() {
  paused = true
  if (timer) clearTimeout(timer)
  timer = null
  if (running) await running.catch(() => false)
}

/**
 * Sign out: sync first so nothing is lost, then clear this device. If the sync fails (offline), returns
 * 'unsynced' without signing out, unless `force`.
 */
export async function signOutSynced(force = false): Promise<'done' | 'unsynced'> {
  if (!force && !(await syncNow())) return 'unsynced'
  await pause()
  try {
    await signOutAndClear()
  } finally {
    paused = false
  }
  return 'done'
}

/** Delete the account (after confirming who it is) with syncing stopped, so nothing re-creates its data. */
export async function deleteAccountSynced(password?: string) {
  await pause()
  try {
    await deleteAccountAndClear(password)
  } finally {
    paused = false
  }
}

/** "Reset progress": on this device, and in the account (on every device) when signed in. */
export function resetProgress() {
  useProgress.getState().reset()
  if (!signedIn()) return
  saveDevice({ pendingReset: true })
  void syncNow()
}
